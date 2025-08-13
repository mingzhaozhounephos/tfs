'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DriverDashboardClient } from './driver-dashboard-client';
import { TrainingVideo } from '@/types';

// Helper function to fetch driver dashboard data
async function fetchDriverDashboardData(userId: string) {
  const supabase = createClient();

  try {
    // Get user's assigned videos with video details
    const { data: assignments, error } = await supabase
      .from('users_videos')
      .select(
        `
        *,
        video:videos(*)
      `
      )
      .eq('user', userId)
      .order('modified_date', { ascending: false });

    if (error) throw error;

    // Transform assignments to the expected video format
    const videos: TrainingVideo[] = (assignments || [])
      .filter((item) => item.video) // Filter out null videos
      .map((item) => ({
        id: item.video!.id,
        title: item.video!.title || '',
        category: item.video!.category || '',
        description: item.video!.description || '',
        created_at: item.video!.created_at,
        duration: item.video!.duration || '',
        youtube_url: item.video!.youtube_url || undefined,
        assigned_date: item.assigned_date || undefined,
        last_watched: item.last_watched || undefined,
        renewal_due: undefined, // Not in the database
        is_completed: item.is_completed || false,
        modified_date: item.modified_date || undefined,
        last_action: item.last_action || undefined,
        is_annual_renewal: item.video!.is_annual_renewal || false,
        completed_date: item.completed_date || undefined
      }));

    return videos;
  } catch (error) {
    console.error('Error fetching driver dashboard data:', error);
    return [];
  }
}

export default async function DriverPage() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return redirect('/auth/login');
    }

    // Check if user has driver role
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'driver') {
      return redirect('/');
    }

    // Fetch driver dashboard data
    const videos = await fetchDriverDashboardData(user.id);

    // Get user details
    const userEmail = user.email;
    const userFullName = user.user_metadata?.full_name;

    return (
      <DriverDashboardClient
        videos={videos}
        userEmail={userEmail}
        userFullName={userFullName}
      />
    );
  } catch (error) {
    console.error('Driver page error:', error);

    // Return a simple error page instead of crashing
    return (
      <div className="flex bg-white min-h-screen h-screen">
        <main className="flex-1 p-8 h-screen overflow-y-auto relative">
          <div className="flex flex-col gap-2 items-center mb-6 w-full">
            <div className="flex items-start justify-between w-full">
              <img
                src="/Logo.jpg"
                alt="TFS Express Logistics"
                className="h-8 w-auto mb-2"
              />
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">Dashboard</h1>
              </div>
            </div>
          </div>
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-2">
              Unable to load dashboard
            </div>
            <p className="text-gray-400">
              There was an error loading the dashboard data. Please try
              refreshing the page.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </main>
      </div>
    );
  }
}
