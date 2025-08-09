import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getAllUsers, AdminUser } from '@/app/admin/users/actions';
import { ManageUsersClient } from './manage-users-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Types for user stats
interface UserStats {
  numAssigned: number;
  completion: number;
}

interface UserStatsMap {
  [userId: string]: UserStats;
}

// Function to fetch user stats from Supabase
async function fetchUserStats(users: AdminUser[]): Promise<UserStatsMap> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('users_videos')
      .select('user, is_completed');

    if (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }

    // Calculate stats for each user
    const stats: UserStatsMap = {};
    users.forEach((user) => {
      const userVideos = data.filter((uv) => uv.user === user.id);
      const numAssigned = userVideos.length;
      const completed = userVideos.filter((uv) => uv.is_completed).length;
      const completion =
        numAssigned === 0 ? 0 : Math.round((completed / numAssigned) * 100);

      stats[user.id] = { numAssigned, completion };
    });

    console.log('User stats calculated:', stats);
    return stats;
  } catch (error) {
    console.error('Error in fetchUserStats:', error);
    // Return empty stats if there's an error
    const emptyStats: UserStatsMap = {};
    users.forEach((user) => {
      emptyStats[user.id] = { numAssigned: 0, completion: 0 };
    });
    return emptyStats;
  }
}

export default async function AdminUsersPage() {
  const supabase = createClient();
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

  let users: AdminUser[] = [];
  let userStats: UserStatsMap = {};
  let error: string | null = null;

  try {
    users = await getAllUsers();
    userStats = await fetchUserStats(users);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    error = errorMessage;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-400">
            Manage all user accounts and their permissions
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/admin">← Back to Admin</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/users/create">Create User</Link>
          </Button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Error loading users: {error}
        </div>
      ) : (
        <ManageUsersClient users={users} userStats={userStats} />
      )}
    </div>
  );
}
