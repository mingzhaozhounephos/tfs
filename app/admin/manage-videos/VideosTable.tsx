'use client';

import { useState, useMemo, useCallback } from 'react';
import { AdminVideoCard } from '@/components/shared/AdminVideoCard';
import { AssignVideoModal } from '@/components/shared/AssignVideoModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSupabaseStore } from '@/utils/supabase/hooks';
import type { QueryResult } from '@/utils/supabase/server';
import type { VideoWithStats, VideoFormData, User } from './page';

interface VideosTableProps {
  videosQuery: QueryResult<VideoWithStats>;
  usersQuery: QueryResult<User>;
  userId: string;
  onRefresh: () => Promise<void>;
}

export default function VideosTable({
  videosQuery,
  usersQuery,
  userId,
  onRefresh
}: VideosTableProps) {
  const router = useRouter();

  // Use Supabase store for videos data
  const videosStore = useSupabaseStore(videosQuery);

  // Use Supabase store for users data
  const usersStore = useSupabaseStore(usersQuery);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All Videos');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedVideoForAssign, setSelectedVideoForAssign] =
    useState<VideoWithStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get unique categories for tab navigation
  const categories = useMemo(() => {
    if (!videosStore.data) return ['All Videos'];
    const uniqueCategories = Array.from(
      new Set(videosStore.data.map((video) => video.category))
    );
    return ['All Videos', ...uniqueCategories.sort()];
  }, [videosStore.data]);

  // Handle page refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error refreshing page:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

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

      toast.success('Video assigned successfully');

      // Refresh the page data
      await handleRefresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while assigning the video';
      toast.error(errorMessage);
    }
  };

  // Handle video deletion
  const handleDelete = async (videoId: string): Promise<void> => {
    try {
      const response = await fetch('/api/all-videos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: videoId })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete video');
      }

      toast.success('Video deleted successfully');

      // Refresh the page data
      await handleRefresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while deleting the video';
      toast.error(errorMessage);
    }
  };

  // Memoize filtered videos to prevent recalculation on every render
  const filteredVideos = useMemo(() => {
    if (!videosStore.data) return [];

    return videosStore.data.filter((video) => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedTag === 'All Videos' || video.category === selectedTag;

      return matchesSearch && matchesCategory;
    });
  }, [videosStore.data, searchQuery, selectedTag]);

  const handleEditVideo = (video: VideoWithStats) => {
    router.push(`/admin/manage-videos/${video.id}/edit`);
  };

  const handleAddVideo = () => {
    router.push('/admin/manage-videos/create');
  };

  const handleAssignToUsers = (video: VideoWithStats) => {
    setSelectedVideoForAssign(video);
    setAssignModalOpen(true);
  };

  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTag(tag);
  }, []);

  // Show error if there's an issue with videos data
  if (videosStore.error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-500">
          Error loading videos: {videosStore.error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Videos</h1>
          <p className="text-gray-600">
            Create and manage training videos for your team
          </p>
        </div>
        <Button
          onClick={handleAddVideo}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Add New Video
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EA384C] pointer-events-none">
            <svg
              className="lucide lucide-search w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 border border-[#EA384C] rounded-lg px-4 py-2 text-sm bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28896] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-64 bg-gray-50 focus:bg-white focus:border-[#EA384C] transition"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className="flex w-fit rounded-lg p-1 shadow-sm"
        style={{ backgroundColor: '#F1F5F9' }}
      >
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-1 rounded-lg transition font-medium
              ${
                selectedTag === category
                  ? 'bg-white text-black font-bold shadow'
                  : 'bg-transparent text-gray-500 hover:text-black'
              }
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300
            `}
            onClick={() => handleTagSelect(category)}
            type="button"
            aria-pressed={selectedTag === category}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video) => (
          <AdminVideoCard
            key={video.id}
            video={video}
            onEdit={() => handleEditVideo(video)}
            showEdit={true}
            onAssignToUsers={() => handleAssignToUsers(video)}
            onDelete={handleDelete}
            users={usersStore.data || []}
            onAssignVideo={handleAssignVideo}
          />
        ))}
      </div>

      {(videosStore.loading || isRefreshing) && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      )}

      {/* Assign Video Modal */}
      {assignModalOpen && selectedVideoForAssign && (
        <AssignVideoModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedVideoForAssign(null);
          }}
          videoId={selectedVideoForAssign.id}
          videoTitle={selectedVideoForAssign.title}
          assignedCount={selectedVideoForAssign.num_of_assigned_users || 0}
          users={usersStore.data || []}
          onAssign={handleAssignVideo}
        />
      )}
    </div>
  );
}
