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

    // First, find the user_video record
    const { data: userVideo, error: findError } = await supabase
      .from('users_videos')
      .select('id')
      .eq('user', user.id)
      .eq('video', videoId)
      .single();

    if (findError || !userVideo) {
      return NextResponse.json(
        { error: 'Video assignment not found' },
        { status: 404 }
      );
    }

    // Then update it to completed
    const { error: updateError } = await supabase
      .from('users_videos')
      .update({
        is_completed: true,
        last_action: 'completed',
        completed_date: new Date().toISOString(),
        modified_date: new Date().toISOString()
      })
      .eq('id', userVideo.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking video as completed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
