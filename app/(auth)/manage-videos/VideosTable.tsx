'use client';

import { useState, useMemo, useCallback } from 'react';
import { VideoFormModal } from '@/components/shared/VideoFormModal';
import { AdminVideoCard } from '@/components/shared/AdminVideoCard';
import { AssignVideoModal } from '@/components/shared/AssignVideoModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { VideoWithStats, VideoFormData, User } from './page';

interface VideosTableProps {
  videos: VideoWithStats[];
  userId: string;
  users: User[];
}

export default function VideosTable({
  videos,
  userId,
  users
}: VideosTableProps) {
  const [displayData, setDisplayData] = useState<VideoWithStats[]>(videos);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All Videos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoWithStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedVideoForAssign, setSelectedVideoForAssign] =
    useState<VideoWithStats | null>(null);

  // Get unique categories for tab navigation
  const categories = useMemo(() => {
    if (!displayData) return ['All Videos'];
    const uniqueCategories = Array.from(
      new Set(displayData.map((video) => video.category))
    );
    return ['All Videos', ...uniqueCategories.sort()];
  }, [displayData]);

  // Custom refetch function that calls the API
  const customRefetch = useCallback(async () => {
    try {
      const response = await fetch('/api/all-videos', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const result = await response.json();
      if (result.success) {
        setDisplayData(result.data);
      }
    } catch (error) {
      console.error('Error refetching videos:', error);
    }
  }, []);

  // Handle video submission
  const handleVideoSubmit = async (videoData: VideoFormData): Promise<void> => {
    try {
      const response = await fetch('/api/all-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save video');
      }

      toast.success(
        editingVideo
          ? 'Video updated successfully'
          : 'Video created successfully'
      );

      // Refresh the data
      await customRefetch();

      // Close modal and reset editing state
      setShowAddModal(false);
      setEditingVideo(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
    }
  };

  // TODO: need to refresh the users->users_videos either before or after the assignment
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

      // Refresh the data
      await customRefetch();
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

      // Refresh the data
      await customRefetch();
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
    if (!displayData) return [];

    return displayData.filter((video) => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedTag === 'All Videos' || video.category === selectedTag;

      return matchesSearch && matchesCategory;
    });
  }, [displayData, searchQuery, selectedTag]);

  const handleEditVideo = (video: VideoWithStats) => {
    setEditingVideo(video);
    setShowAddModal(true);
  };

  const handleAddVideo = () => {
    setEditingVideo(null);
    setShowAddModal(true);
  };

  const handleAssignToUsers = (video: VideoWithStats) => {
    setSelectedVideoForAssign(video);
    setAssignModalOpen(true);
  };

  const handleSuccess = () => {
    customRefetch();
    setShowAddModal(false);
  };

  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTag(tag);
  }, []);

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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
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
            users={users}
            onAssignVideo={handleAssignVideo}
          />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      )}

      {/* Add/Edit Video Modal */}
      {showAddModal && (
        <VideoFormModal
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingVideo(null);
          }}
          onSuccess={handleSuccess}
          video={
            editingVideo
              ? {
                  id: editingVideo.id,
                  title: editingVideo.title,
                  description: editingVideo.description,
                  youtube_url: editingVideo.youtube_url,
                  category: editingVideo.category,
                  duration: editingVideo.duration || undefined,
                  is_annual_renewal: editingVideo.is_annual_renewal || undefined
                }
              : undefined
          }
          adminUserId={editingVideo?.admin_user || userId}
          onSubmit={handleVideoSubmit}
        />
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
          users={users}
          onAssign={handleAssignVideo}
        />
      )}
    </div>
  );
}
