'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirect('/auth/login');
  }

  // Check user role and redirect accordingly
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleError) {
    // If there's an error fetching role, redirect to driver page as fallback
    return redirect('/driver');
  }

  // Redirect based on role
  if (roleData?.role === 'admin') {
    return redirect('/admin');
  } else {
    return redirect('/driver');
  }
}
