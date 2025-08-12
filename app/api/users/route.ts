import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();

    // Single query to get users with roles and video assignments using joins
    const { data: usersWithRoles, error } = await supabaseAdmin
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

    if (error) {
      console.error('Error fetching users with roles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get all user IDs to fetch emails in batch
    if (usersWithRoles && usersWithRoles.length > 0) {
      const userIds = usersWithRoles.map((user) => user.id);

      // Batch fetch all auth users at once
      const { data: authUsers, error: authError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (authError) {
        console.error('Error fetching auth users:', authError);
      }

      // Combine the data
      const usersWithEmailAndRoles = usersWithRoles.map((user) => {
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

      return NextResponse.json(usersWithEmailAndRoles);
    }

    return NextResponse.json(usersWithRoles || []);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
