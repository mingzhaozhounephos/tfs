import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseAdmin = createAdminClient();

    // Get user details from auth.users (which has email) and public.users
    const {
      data: { user: authUser },
      error: authError
    } = await supabaseAdmin.auth.admin.getUserById(id);

    if (authError || !authUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('role')
      .eq('user_id', id)
      .single();

    if (roleError) {
      console.error('Error fetching user role:', roleError);
    }

    // Get user's video stats
    const { data: userVideos, error: videosError } = await supabaseAdmin
      .from('users_videos')
      .select('is_completed')
      .eq('user', id);

    if (videosError) {
      console.error('Error fetching user videos:', videosError);
    }

    // Calculate stats
    const numAssigned = userVideos?.length || 0;
    const completed = userVideos?.filter((v) => v.is_completed).length || 0;
    const completion =
      numAssigned > 0 ? Math.round((completed / numAssigned) * 100) : 0;

    // Combine user data with role, email, and stats from auth
    const userWithRole = {
      ...user,
      email: authUser.email || '',
      role: roleData?.role || 'driver', // Default to driver if no role found
      created_at: authUser.created_at || new Date().toISOString(),
      stats: {
        numAssigned,
        completion
      }
    };

    return NextResponse.json(userWithRole);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
