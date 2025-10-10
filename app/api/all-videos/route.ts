import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    // Get user authentication
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

    if (videoId) {
      // Fetch single video by ID
      const { data, error } = await supabase
        .from('videos')
        .select(
          `
          *,
          users_videos(
            user,
            is_completed
          )
        `
        )
        .eq('id', videoId)
        // .eq('admin_user', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { success: false, error: 'Video not found' },
            { status: 404 }
          );
        }
        throw error;
      }

      // Transform the single video data
      const assignedUsers = data.users_videos?.length || 0;
      const completedUsers =
        data.users_videos?.filter((uv) => uv.is_completed)?.length || 0;
      const completionRate =
        assignedUsers > 0 ? (completedUsers / assignedUsers) * 100 : 0;

      const transformedVideo = {
        ...data,
        title: data.title || '',
        description: data.description || '',
        youtube_url: data.youtube_url || '',
        category: data.category || '',
        admin_user: data.admin_user || '',
        num_of_assigned_users: assignedUsers,
        completion_rate: completionRate
      };

      return NextResponse.json({ success: true, data: transformedVideo });
    } else {
      // Fetch all videos with related data
      const { data, error } = await supabase
        .from('videos')
        .select(
          `
          *,
          users_videos(
            user,
            is_completed
          )
        `
        )
        // .eq('admin_user', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      // Transform the data
      const transformedData =
        data?.map((video) => {
          const assignedUsers = video.users_videos?.length || 0;
          const completedUsers =
            video.users_videos?.filter((uv) => uv.is_completed)?.length || 0;
          const completionRate =
            assignedUsers > 0 ? (completedUsers / assignedUsers) * 100 : 0;

          return {
            ...video,
            title: video.title || '',
            description: video.description || '',
            youtube_url: video.youtube_url || '',
            category: video.category || '',
            admin_user: video.admin_user || '',
            num_of_assigned_users: assignedUsers,
            completion_rate: completionRate
          };
        }) || [];

      return NextResponse.json({ success: true, data: transformedData });
    }
  } catch (err) {
    console.error('Error fetching videos:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch videos'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get user authentication
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

    const videoData = await request.json();

    const payload = {
      title: videoData.title,
      description: videoData.description,
      youtube_url: videoData.youtube_url,
      category: videoData.category,
      duration: videoData.duration || null,
      admin_user: user.id,
      is_annual_renewal: videoData.is_annual_renewal || false
    };

    let error;
    if (videoData.id) {
      // Update existing video
      ({ error } = await supabase
        .from('videos')
        .update(payload)
        .eq('id', videoData.id));
    } else {
      // Create new video
      ({ error } = await supabase.from('videos').insert([payload]));
    }

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error saving video:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to save video'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get user authentication
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

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Delete the video
    const { error } = await supabase.from('videos').delete().eq('id', id);
    // .eq('admin_user', user.id); // Ensure user can only delete their own videos

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting video:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete video'
      },
      { status: 500 }
    );
  }
}
