import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getAllOrganisations } from '@/app/admin/users/actions';
import { getOrganisationSettings } from '@/utils/auth-helpers/settings';
import CreateUserForm from '@/components/admin/CreateUserForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tables } from '@/utils/supabase/types';

export default async function CreateUserPage() {
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

  const { allowOrganisations } = getOrganisationSettings();

  let organisations: Tables<'organisations'>[] = [];
  if (allowOrganisations) {
    try {
      organisations = await getAllOrganisations();
    } catch (error) {
      console.error('Error fetching organisations:', error);
    }
  }

  return (
    <div className="flex-1 bg-white p-8 min-h-screen">
      <div className="flex flex-col gap-2 items-start mb-2">
        <img
          src="/Logo.jpg"
          alt="TFS Express Logistics"
          className="h-8 w-auto mb-2"
        />
      </div>

      {/* Header */}
      <div className="mb-6">
        <Button asChild variant="outline" className="mb-4">
          <Link href="/admin/users">← Back to Users</Link>
        </Button>
        <h2 className="text-xl font-bold mb-1">Create New User</h2>
        <p className="text-sm text-gray-600 mb-4">
          Add a new user to the system
        </p>
      </div>

      <CreateUserForm organisations={organisations} />
    </div>
  );
}
