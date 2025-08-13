'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { MyTrainingVideosClient } from './my-training-videos-client';
import { TrainingVideo } from '@/types';

export default async function MyTrainingVideosPage() {
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

    // Build the query using the official Supabase client
    const trainingVideosQuery = supabase
      .from('users_videos')
      .select(
        `
        *,
        video:videos(*)
      `
      )
      .eq('user', user.id)
      .order('modified_date', { ascending: false });

    // Execute the query to get the data
    const { data: assignments, error } = await trainingVideosQuery;

    if (error) {
      throw error;
    }

    // Transform the data to match the expected TrainingVideo interface
    const videos: TrainingVideo[] = (assignments || [])
      .filter((item: any) => item.video) // Filter out null videos
      .map((item: any) => ({
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

    // Create a simple QueryResult structure for the client
    const trainingVideosQueryResult = {
      queryKey: `training_videos_${user.id}`,
      data: videos,
      tableName: 'users_videos',
      url: '',
      searchParams: {}
    };

    return (
      <MyTrainingVideosClient
        trainingVideosQuery={trainingVideosQueryResult}
        role={roleData.role}
      />
    );
  } catch (error) {
    console.error('My Training Videos page error:', error);

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
                <h1 className="text-3xl font-bold">My Training Videos</h1>
              </div>
            </div>
          </div>
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-2">
              Unable to load training videos
            </div>
            <p className="text-gray-400">
              There was an error loading the training videos data. Please try
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
