'use client';

import { useState, useMemo, useCallback } from 'react';
import { VideoFormModal } from '@/components/shared/VideoFormModal';
import { AdminVideoCard } from '@/components/shared/AdminVideoCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VideoWithStats, VideoFormData } from './page';
import { toast } from 'sonner';

interface VideosTableProps {
  videos: VideoWithStats[];
  userId: string;
}

const tags = ['All Videos', 'Van', 'Truck', 'Office'];

export default function VideosTable({ videos, userId }: VideosTableProps) {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All Videos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoWithStats | null>(null);
  const [customData, setCustomData] = useState<VideoWithStats[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Custom refetch function that calls the API
  const customRefetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/all-videos', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch videos');
      }

      if (result.success && result.data) {
        setCustomData(result.data);
      }
    } catch (error) {
      console.error('Error refetching videos:', error);
      toast.error('Failed to refresh videos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Use custom data if available, otherwise use the prop data
  const displayData = customData || videos;

  // Handle video submission with toast notifications
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
        videoData.id
          ? 'Video updated successfully'
          : 'Video created successfully'
      );

      // Use custom refetch instead of the store refetch
      await customRefetch();
      setModalOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while saving the video';

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
        !search.trim() ||
        video.title?.toLowerCase().includes(search.toLowerCase()) ||
        video.description?.toLowerCase().includes(search.toLowerCase()) ||
        video.category?.toLowerCase().includes(search.toLowerCase());

      const matchesTag =
        selectedTag === 'All Videos' ||
        video.category?.toLowerCase() === selectedTag.toLowerCase();

      return matchesSearch && matchesTag;
    });
  }, [displayData, selectedTag, search]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTag(tag);
  }, []);

  const handleAddVideo = useCallback(() => {
    setEditingVideo(null);
    setModalOpen(true);
  }, []);

  const handleEditVideo = useCallback((video: VideoWithStats) => {
    setEditingVideo(video);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleSuccess = useCallback(() => {
    customRefetch();
    setModalOpen(false);
  }, [customRefetch]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Training Videos</h1>
        <button
          className="flex items-center gap-2 bg-[#EA384C] text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-[#EC4659]"
          onClick={handleAddVideo}
        >
          <svg width="18" height="18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="2" />
            <path
              d="M9 5v8M5 9h8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Add Video
        </button>
      </div>
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
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 border border-[#EA384C] rounded-lg px-4 py-2 text-sm bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28896] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-64 bg-gray-50 focus:bg-white focus:border-[#EA384C] transition"
          />
        </div>
      </div>
      {/* Tab Navigation */}
      <div
        className="flex w-fit rounded-lg p-1 mb-6 shadow-sm"
        style={{ backgroundColor: '#F1F5F9' }}
      >
        {tags.map((tag) => (
          <button
            key={tag}
            className={`px-4 py-1 rounded-lg transition font-medium
              ${
                selectedTag === tag
                  ? 'bg-white text-black font-bold shadow'
                  : 'bg-transparent text-gray-500 hover:text-black'
              }
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300
            `}
            onClick={() => handleTagSelect(tag)}
            type="button"
            aria-pressed={selectedTag === tag}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredVideos.map((video) => (
            <AdminVideoCard
              key={video.id}
              video={{
                ...video,
                duration: video.duration || undefined
              }}
              showEdit={true}
              onEdit={() => handleEditVideo(video)}
              onAssignToUsers={() => {
                /* handle assign to users */
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA384C]" />
          </div>
        )}
      </div>
      <VideoFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        video={
          editingVideo
            ? {
                ...editingVideo,
                duration: editingVideo.duration || undefined,
                is_annual_renewal: editingVideo.is_annual_renewal || undefined
              }
            : undefined
        }
        adminUserId={userId}
        onSubmit={handleVideoSubmit}
      />
    </>
  );
}
