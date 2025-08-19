import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  // Add other video properties as needed
}

interface UserVideo {
  id: string;
  user: string;
  video: string | Video;
  is_completed: boolean;
  completed_at?: string;
  // Add other user_video properties as needed
}

interface AssignmentCount {
  video: string | null;
  is_completed: boolean | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseAdmin = createAdminClient();

    // Get videos assigned to the user with video details
    const { data: userVideos, error } = await supabaseAdmin
      .from('users_videos')
      .select(
        `
        *,
        video:videos(*)
      `
      )
      .eq('user', id)
      .not('video', 'is', null); // Ensure video exists

    if (error) {
      console.error('Error fetching user videos:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user videos' },
        { status: 500 }
      );
    }

    // Get video stats for each video (num_of_assigned_users and completion_rate)
    if (userVideos && userVideos.length > 0) {
      const videoIds = userVideos
        .filter((uv) => uv.video && typeof uv.video === 'object')
        .map((uv) => (uv.video as Video).id);

      if (videoIds.length > 0) {
        // Get assignment counts for each video
        const { data: assignmentCounts, error: assignmentError } =
          await supabaseAdmin
            .from('users_videos')
            .select('video, is_completed')
            .in('video', videoIds);

        if (assignmentError) {
          console.error('Error fetching assignment counts:', assignmentError);
        }

        // Calculate stats for each video
        const videosWithStats = userVideos.map((userVideo) => {
          if (!userVideo.video || typeof userVideo.video !== 'object') {
            return userVideo;
          }

          const videoAssignments =
            assignmentCounts?.filter(
              (ac: AssignmentCount) =>
                ac.video && ac.video === (userVideo.video as Video).id
            ) || [];
          const numAssigned = videoAssignments.length;
          const completed = videoAssignments.filter(
            (ac: AssignmentCount) => ac.is_completed
          ).length;
          const completionRate =
            numAssigned > 0 ? Math.round((completed / numAssigned) * 100) : 0;

          return {
            ...userVideo,
            video: {
              ...(userVideo.video as Video),
              num_of_assigned_users: numAssigned,
              completion_rate: completionRate
            }
          };
        });

        return NextResponse.json(videosWithStats);
      }
    }

    // Fallback: return videos without stats if stats calculation fails
    return NextResponse.json(userVideos || []);
  } catch (error) {
    console.error('Error fetching user videos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
