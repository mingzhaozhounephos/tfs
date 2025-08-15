import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface UserVideo {
  id: string;
  user: string;
  video: string;
  is_completed: boolean;
  assigned_date: string;
  last_watched: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const supabase = createClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get request body
    const { userId, videoIds } = await request.json();

    if (!userId || !Array.isArray(videoIds)) {
      return NextResponse.json(
        { error: 'userId and videoIds array are required' },
        { status: 400 }
      );
    }

    // First, get existing assignments for this user
    const { data: existingAssignments, error: fetchError } = await supabase
      .from('users_videos')
      .select('*')
      .eq('user', userId);

    if (fetchError) {
      console.error('Error fetching existing assignments:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch existing assignments' },
        { status: 500 }
      );
    }

    // Get the current date in ISO format
    const currentDate = new Date().toISOString();

    // Find videos to remove (exist in database but not in new selection)
    const existingVideoIds = new Set(
      existingAssignments
        ?.map((a) => a.video)
        .filter((id): id is string => id !== null) || []
    );
    const videosToRemove =
      existingAssignments?.filter(
        (a) => a.video && !videoIds.includes(a.video)
      ) || [];

    // Find videos to add (exist in new selection but not in database)
    const newVideoIds = videoIds.filter((id) => !existingVideoIds.has(id));

    // Remove unselected videos
    if (videosToRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('users_videos')
        .delete()
        .in(
          'id',
          videosToRemove.map((v) => v.id)
        );

      if (deleteError) {
        console.error('Error removing assignments:', deleteError);
        return NextResponse.json(
          { error: 'Failed to remove video assignments' },
          { status: 500 }
        );
      }
    }

    // Add new videos with assigned_date
    if (newVideoIds.length > 0) {
      const assignments = newVideoIds.map((videoId) => ({
        user: userId,
        video: videoId,
        is_completed: false,
        assigned_date: currentDate
      }));

      const { error: insertError } = await supabase
        .from('users_videos')
        .insert(assignments);

      if (insertError) {
        console.error('Error adding assignments:', insertError);
        return NextResponse.json(
          { error: 'Failed to add video assignments' },
          { status: 500 }
        );
      }
    }

    // Return updated assignments
    const { data: updatedAssignments, error: finalError } = await supabase
      .from('users_videos')
      .select('*')
      .eq('user', userId);

    if (finalError) {
      console.error('Error fetching updated assignments:', finalError);
      return NextResponse.json(
        { error: 'Failed to fetch updated assignments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedAssignments as UserVideo[]
    });
  } catch (error) {
    console.error('Error in assign-video-to-users API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
