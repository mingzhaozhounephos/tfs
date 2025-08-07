import { createClient, executeWithMetadata } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Tables } from '@/utils/supabase/types';
import { ManageUsersClient } from './manage-users-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Define the expected shape of the data with roles
export type UserWithRole = Tables<'users'> & {
  roles: Tables<'roles'>[];
};

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

  // Build the query to get users with their roles
  const usersQuery = supabase
    .from('users')
    .select(
      `
      *,
      roles(*)
    `
    )
    .order('full_name', { ascending: true });

  // Execute with metadata capture
  const usersQueryResult = await executeWithMetadata<UserWithRole>(usersQuery);

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

      <ManageUsersClient usersQuery={usersQueryResult} />
    </div>
  );
}
