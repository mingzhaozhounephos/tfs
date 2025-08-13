'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Bell, Users, Activity, Play } from 'lucide-react';

// Helper function to fetch dashboard stats
async function fetchDashboardStats() {
  const supabase = createClient();

  try {
    // Get the start and end of the current week (Sunday to Saturday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Set to Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    // Get the start and end of the current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Get total counts first
    const [totalVideosResult, totalUsersResult] = await Promise.all([
      supabase.from('videos').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true })
    ]);

    if (totalVideosResult.error) {
      throw totalVideosResult.error;
    }
    if (totalUsersResult.error) {
      throw totalUsersResult.error;
    }

    // Get videos this week
    const videosThisWeekResult = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfWeek.toISOString())
      .lt('created_at', endOfWeek.toISOString());

    // Get users this month
    const usersThisMonthResult = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())
      .lt('created_at', endOfMonth.toISOString());

    // Get users_videos stats
    const [totalAssignmentsResult, completedAssignmentsResult] =
      await Promise.all([
        supabase
          .from('users_videos')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('users_videos')
          .select('*', { count: 'exact', head: true })
          .eq('is_completed', true)
      ]);

    // Get watched videos stats
    const [watchedResult, weeklyWatchedResult] = await Promise.all([
      supabase
        .from('users_videos')
        .select('*', { count: 'exact', head: true })
        .in('last_action', ['watched', 'completed']),
      supabase
        .from('users_videos')
        .select('*', { count: 'exact', head: true })
        .gte('last_watched', startOfWeek.toISOString())
        .lt('last_watched', endOfWeek.toISOString())
    ]);

    if (videosThisWeekResult.error) {
      throw videosThisWeekResult.error;
    }
    if (usersThisMonthResult.error) {
      throw usersThisMonthResult.error;
    }
    if (totalAssignmentsResult.error) {
      throw totalAssignmentsResult.error;
    }
    if (completedAssignmentsResult.error) {
      throw completedAssignmentsResult.error;
    }
    if (watchedResult.error) {
      throw watchedResult.error;
    }
    if (weeklyWatchedResult.error) {
      throw weeklyWatchedResult.error;
    }

    const totalAssignments = totalAssignmentsResult.count || 0;
    const completedAssignments = completedAssignmentsResult.count || 0;

    const stats = {
      totalVideos: totalVideosResult.count || 0,
      videosThisWeek: videosThisWeekResult.count || 0,
      totalUsers: totalUsersResult.count || 0,
      usersThisMonth: usersThisMonthResult.count || 0,
      completionRate: totalAssignments
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0,
      totalVideosWatched: watchedResult.count || 0,
      videosWatchedThisWeek: weeklyWatchedResult.count || 0
    };

    return stats;
  } catch (error) {
    // Return fallback stats instead of throwing
    return {
      totalVideos: 0,
      videosThisWeek: 0,
      totalUsers: 0,
      usersThisMonth: 0,
      completionRate: 0,
      totalVideosWatched: 0,
      videosWatchedThisWeek: 0
    };
  }
}

export default async function AdminPage() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return redirect('/auth/login');
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      return redirect('/');
    }

    // Fetch dashboard stats
    const stats = await fetchDashboardStats();

    // Get user details
    const userEmail = user.email;
    const userFullName = user.user_metadata?.full_name;

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
              <div className="text-sm text-gray-600 ml-4 whitespace-nowrap">
                Welcome, {userFullName?.trim() || 'Administrator'} ({userEmail})
              </div>
            </div>
          </div>
          {/* Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative">
            <Widget
              title="Total Videos"
              value={String(stats.totalVideos)}
              sub={`+${stats.videosThisWeek} videos added this week`}
              icon={
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
                  <Bell className="w-5 h-5 text-[#EA384C]" />
                </div>
              }
            />
            <Widget
              title="Total Users"
              value={String(stats.totalUsers)}
              sub={`+${stats.usersThisMonth} users added this month`}
              icon={
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
                  <Users className="w-5 h-5 text-[#EA384C]" />
                </div>
              }
            />
            <Widget
              title="Completion Rate"
              value={`${stats.completionRate}%`}
              sub=""
              icon={
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
                  <Activity className="w-5 h-5 text-[#EA384C]" />
                </div>
              }
              progress={stats.completionRate}
            />
            <Widget
              title="Videos Watched"
              value={String(stats.totalVideosWatched)}
              sub={`+${stats.videosWatchedThisWeek} videos watched this week`}
              icon={
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FEEBED]">
                  <Play className="w-5 h-5 text-[#EA384C]" />
                </div>
              }
            />
          </div>
        </main>
      </div>
    );
  } catch (error) {
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

interface WidgetProps {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactElement;
  progress?: number;
}

function Widget({ title, value, sub, icon, progress }: WidgetProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2 min-h-[100px]">
      <div className="flex justify-between items-center">
        <div className="font-semibold">{title}</div>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
      {typeof progress === 'number' && (
        <div className="mt-2 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-2 bg-[#EA384C] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
