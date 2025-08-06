import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { videoId, userIds } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Verify the video belongs to the admin user
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .select('id, admin_user')
      .eq('id', videoId)
      .eq('admin_user', user.id)
      .single();

    if (videoError || !videoData) {
      return NextResponse.json(
        { success: false, error: 'Video not found or access denied' },
        { status: 404 }
      );
    }

    // Get current assignments for this video
    const { data: currentAssignments, error: currentAssignmentsError } =
      await supabase.from('users_videos').select('user').eq('video', videoId);

    if (currentAssignmentsError) {
      console.error(
        'Error fetching current assignments:',
        currentAssignmentsError
      );
      return NextResponse.json(
        { success: false, error: 'Failed to fetch current assignments' },
        { status: 500 }
      );
    }

    // Calculate which users to add and remove
    const currentUserIds =
      currentAssignments
        ?.map((a: { user: string | null }) => a.user)
        .filter((user): user is string => user !== null) || [];
    const usersToAdd = userIds.filter(
      (id: string) => !currentUserIds.includes(id)
    );
    const usersToRemove = currentUserIds.filter(
      (id: string) => !userIds.includes(id)
    );

    try {
      // Remove users that are no longer assigned
      if (usersToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('users_videos')
          .delete()
          .eq('video', videoId)
          .in('user', usersToRemove);

        if (removeError) {
          console.error('Error removing assignments:', removeError);
          throw removeError;
        }
      }

      // Add new users that weren't previously assigned
      if (usersToAdd.length > 0) {
        const { error: addError } = await supabase.from('users_videos').insert(
          usersToAdd.map((userId: string) => ({
            video: videoId,
            user: userId,
            is_completed: false
          }))
        );

        if (addError) {
          console.error('Error adding assignments:', addError);
          throw addError;
        }
      }

      return NextResponse.json({ success: true });
    } catch (err) {
      console.error('Error updating assignments:', err);
      return NextResponse.json(
        { success: false, error: 'Failed to update video assignments' },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('Error assigning video:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to assign video'
      },
      { status: 500 }
    );
  }
}
