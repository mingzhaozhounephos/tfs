import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId } = await request.json();
    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Find the users_videos record for this user and video
    const { data: userVideo, error: findError } = await supabase
      .from('users_videos')
      .select('*, video:videos(*)')
      .eq('user', user.id)
      .eq('video', videoId)
      .single();

    if (findError || !userVideo) {
      return NextResponse.json(
        { error: 'Video assignment not found' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    // If annual renewal is due, reset assigned_date and completion
    const isAnnualRenewal =
      userVideo.video?.is_annual_renewal &&
      userVideo.assigned_date &&
      new Date().getTime() - new Date(userVideo.assigned_date).getTime() >
        365 * 24 * 60 * 60 * 1000;

    if (isAnnualRenewal) {
      await supabase
        .from('users_videos')
        .update({
          last_watched: now,
          modified_date: now,
          assigned_date: now,
          last_action: 'watched',
          is_completed: false,
          completed_date: null
        })
        .eq('id', userVideo.id);
    } else {
      await supabase
        .from('users_videos')
        .update({
          last_watched: now,
          modified_date: now,
          last_action: userVideo.is_completed ? 'completed' : 'watched'
        })
        .eq('id', userVideo.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating video progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
