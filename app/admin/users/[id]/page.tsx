'use client';

import { User } from '@/types';
import { UserDetailsCards } from '@/components/manage-users/user-details-cards';
import { AssignedVideosToggle } from '@/components/manage-users/assigned-videos-toggle';
import { AssignedVideosList } from '@/components/manage-users/assigned-videos-list';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AssignVideoButton } from '@/components/manage-users/assign-video-button';
import { Button } from '@/components/ui/button';

interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
}

export default function UserDetailsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Handle video assignment
  const handleAssignVideo = async (
    videoId: string,
    selectedUserIds: string[]
  ): Promise<void> => {
    try {
      const response = await fetch('/api/assign-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, userIds: selectedUserIds })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to assign video');
      }

      // Refresh the videos data to show updated stats
      const videosResponse = await fetch(`/api/users/${id}/videos`);
      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        setVideos(videosData);
      }
    } catch (error) {
      console.error('Error assigning video:', error);
      // You could add toast notification here if you want
    }
  };

  // Handle video assignment completion from AssignVideoButton
  const handleVideoAssignmentComplete = async () => {
    try {
      // Refresh the videos data to show updated assignments
      const videosResponse = await fetch(`/api/users/${id}/videos`);
      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        setVideos(videosData);
      }

      // Also refresh user data to show updated statistics
      const userResponse = await fetch(`/api/users/${id}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing data after assignment:', error);
    }
  };

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/admin/users');
            return;
          }
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to load user details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    async function fetchVideos() {
      try {
        const response = await fetch(`/api/users/${id}/videos`);
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
        // Don't set error for videos, just log it
      }
    }

    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        // Don't set error for users, just log it
      }
    }

    async function fetchAllVideos() {
      try {
        const response = await fetch('/api/all-videos');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAllVideos(data.data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching all videos:', error);
      }
    }

    if (id) {
      fetchUser();
      fetchVideos();
      fetchUsers();
      fetchAllVideos();
    }
  }, [id, router]);

  if (error) {
    return (
      <div className="flex h-screen min-h-screen">
        <div className="flex-1 h-screen overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/admin/users')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Return to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white p-8 min-h-screen">
      <div className="flex flex-col gap-2 items-start mb-2">
        <img
          src="/Logo.jpg"
          alt="TFS Express Logistics"
          className="h-8 w-auto mb-2"
        />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-600">
            View and manage user information and assigned videos
          </p>
        </div>
        <Button onClick={() => router.push('/admin/users')} variant="outline">
          ← Back to Users
        </Button>
      </div>

      {user && (
        <>
          <UserDetailsCards user={user} />
          <div className="flex items-center justify-between mt-8 mb-4">
            <h2 className="text-xl font-bold text-black">Assigned Videos</h2>
            <AssignVideoButton
              user={user}
              onAssignmentComplete={handleVideoAssignmentComplete}
              initialAssignedVideoIds={videos
                .map((v: any) =>
                  typeof v.video === 'string' ? v.video : v.video?.id
                )
                .filter(Boolean)}
              videos={allVideos}
            />
          </div>
          <AssignedVideosToggle
            userId={user.id}
            onFilterChange={setFilter}
            filter={filter}
            videos={videos}
          />
          <AssignedVideosList
            userId={user.id}
            filter={filter}
            videos={videos}
            loading={loading}
            users={users}
            onAssignVideo={handleAssignVideo}
          />
        </>
      )}
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA384C]" />
        </div>
      )}
    </div>
  );
}
