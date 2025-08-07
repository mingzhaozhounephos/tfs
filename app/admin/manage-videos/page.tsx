'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { executeWithMetadata } from '@/utils/supabase/server';
import VideosTable from './VideosTable';
import { redirect } from 'next/navigation';

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
  users_videos: {
    video: string | null;
    is_completed: boolean | null;
  }[];
};

// Type for the raw user data from the database
type RawUser = {
  id: string;
  full_name: string | null;
  roles: { role: string }[];
};

// Type for the raw user data with assignments from the database
type RawUserWithAssignments = {
  id: string;
  full_name: string | null;
  roles: { role: string }[];
  users_videos: {
    video: string | null;
    is_completed: boolean | null;
  }[];
};

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
  const { data, error } = await supabase
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

  if (error) {
    throw new Error('Failed to fetch videos');
  }

  // Transform the data (same logic as API)
  const transformedData =
    data?.map((video) => {
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
    }) || [];

  // Fetch users for assignment modal using executeWithMetadata for consistency
  const usersQuery = supabase
    .from('users')
    .select(
      `
      id,
      full_name,
      roles!inner(role),
      users_videos(
        video,
        is_completed
      )
    `
    )
    .eq('is_active', true);

  const usersQueryResult =
    await executeWithMetadata<RawUserWithAssignments>(usersQuery);

  // Transform the data to match the User interface
  const transformedUsers: User[] = (usersQueryResult.data || [])
    .map((user: RawUserWithAssignments) => ({
      id: user.id,
      email: '', // We don't have email in public.users, will need to get from auth if needed
      full_name: user.full_name,
      role: user.roles?.[0]?.role || 'driver',
      users_videos: user.users_videos || []
    }))
    .filter((user) => user.id); // Only include users with valid IDs

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
        videos={transformedData}
        userId={user.id}
        users={transformedUsers}
      />
    </div>
  );
}
