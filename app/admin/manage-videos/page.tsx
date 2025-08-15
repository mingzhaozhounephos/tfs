'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import VideosTable from './VideosTable';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export type VideoWithStats = {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  category: string;
  duration: string | null;
  created_at: string;
  admin_user: string;
  is_annual_renewal: boolean | null;
  users_videos: {
    user: string | null;
    is_completed: boolean | null;
  }[];
  num_of_assigned_users?: number;
  completion_rate?: number;
};

export type VideoFormData = {
  id?: string;
  title: string;
  description: string;
  youtube_url: string;
  category: string;
  duration?: string;
  is_annual_renewal?: boolean;
};

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  users_videos?: {
    video: string | null;
    is_completed: boolean | null;
  }[];
};

// Server action to refresh the page data
export async function refreshPageData() {
  'use server';
  revalidatePath('/admin/manage-videos');
}

export default async function ManageVideosPage() {
  const supabase = createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirect('/auth/login');
  }

  // Check if user has admin role
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleError || roleData?.role !== 'admin') {
    return redirect('/');
  }

  // Fetch videos with related data directly using Supabase
  const { data: videosData, error: videosError } = await supabase
    .from('videos')
    .select(
      `
      *,
      users_videos(
        user,
        is_completed
      )
    `
    )
    .eq('admin_user', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (videosError) {
    throw new Error('Failed to fetch videos');
  }

  // Transform the data to add computed fields
  const transformedVideos = (videosData || []).map((video) => {
    const assignedUsers = video.users_videos?.length || 0;
    const completedUsers =
      video.users_videos?.filter((uv) => uv.is_completed)?.length || 0;
    const completionRate =
      assignedUsers > 0 ? (completedUsers / assignedUsers) * 100 : 0;

    return {
      ...video,
      title: video.title || '',
      description: video.description || '',
      youtube_url: video.youtube_url || '',
      category: video.category || '',
      admin_user: video.admin_user || '',
      num_of_assigned_users: assignedUsers,
      completion_rate: completionRate
    };
  });

  // Create a QueryResult structure for videos
  const videosQueryResult = {
    queryKey: 'videos',
    data: transformedVideos,
    tableName: 'videos',
    url: '',
    searchParams: {}
  };

  // Fetch users for assignment modal using admin client
  const { data: usersData, error: usersError } = await supabaseAdmin
    .from('users')
    .select(
      `
      id,
      full_name,
      is_active,
      roles!inner(
        role
      ),
      users_videos(
        video,
        is_completed
      )
    `
    )
    .eq('is_active', true)
    .order('full_name');

  if (usersError) {
    console.error('Error fetching users:', usersError);
  }

  // Transform users data to include email and role
  let transformedUsers: User[] = [];

  if (usersData && usersData.length > 0) {
    // Get all user IDs to fetch emails in batch
    const userIds = usersData.map((user) => user.id);

    // Batch fetch all auth users at once
    const { data: authUsers, error: authError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching auth users:', authError);
    }

    // Combine the data
    transformedUsers = usersData.map((user) => {
      const authUser = authUsers?.users?.find((au) => au.id === user.id);
      const role = user.roles?.[0]?.role || 'driver';

      return {
        id: user.id,
        full_name: user.full_name,
        email: authUser?.email || '',
        is_active: user.is_active,
        role: role,
        users_videos: user.users_videos || []
      };
    });
  }

  // Create a QueryResult structure for users
  const usersQueryResult = {
    queryKey: 'users',
    data: transformedUsers,
    tableName: 'users',
    url: '',
    searchParams: {}
  };

  return (
    <div className="flex-1 bg-white p-8 min-h-screen">
      <div className="flex flex-col gap-2 items-start mb-2">
        <img
          src="/Logo.jpg"
          alt="TFS Express Logistics"
          className="h-8 w-auto mb-2"
        />
      </div>
      <VideosTable
        videosQuery={videosQueryResult}
        usersQuery={usersQueryResult}
        userId={user.id}
        onRefresh={refreshPageData}
      />
    </div>
  );
}
