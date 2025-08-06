'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  PlayCircle,
  Trash2,
  MoreVertical
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { AssignVideoModal } from './AssignVideoModal';

interface VideoWithStats {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  category: string;
  duration: string | null;
  created_at: string;
  num_of_assigned_users?: number;
  completion_rate?: number;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

interface AdminVideoCardProps {
  video: VideoWithStats;
  onEdit?: () => void;
  showEdit?: boolean;
  onAssignToUsers?: () => void;
  onDelete?: (videoId: string) => void;
  users?: User[];
  onAssignVideo?: (videoId: string, selectedUserIds: string[]) => Promise<void>;
}

/**
 * Extracts the YouTube video ID from a YouTube URL
 * @param url The YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
 * @returns The YouTube video ID or null if not found
 */
function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/**
 * Generates the YouTube thumbnail URL for a video ID
 * @param videoId The YouTube video ID
 * @returns The URL for the maxresdefault thumbnail
 */
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// Helper function to format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

export function AdminVideoCard({
  video,
  onEdit,
  showEdit = false,
  onAssignToUsers,
  onDelete,
  users = [],
  onAssignVideo
}: AdminVideoCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const youtubeId = video.youtube_url ? getYouTubeId(video.youtube_url) : null;
  const thumbnailUrl = youtubeId ? getYouTubeThumbnail(youtubeId) : null;

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      // Call the parent's onDelete callback to handle the deletion
      if (onDelete) {
        await onDelete(video.id);
      }

      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting video:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete video');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAssignToUsers = () => {
    if (onAssignVideo) {
      setAssignModalOpen(true);
    } else if (onAssignToUsers) {
      onAssignToUsers();
    }
  };

  const handleAssignVideo = async (
    videoId: string,
    selectedUserIds: string[]
  ) => {
    if (onAssignVideo) {
      await onAssignVideo(videoId, selectedUserIds);
    }
  };

  return (
    <div className="group bg-white rounded-xl shadow p-4 flex flex-col gap-2 relative border border-transparent hover:border-red-500 hover:shadow-lg transition-all duration-200">
      {/* Menu icon for edit */}
      {showEdit && (
        <div className="absolute top-3 right-3 flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-red-50 hover:bg-red-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={onEdit}
                className="flex items-center gap-2"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M18 2a2.828 2.828 0 1 1 4 4L7 21l-4 1 1-4Z" />
                  <path d="M16 5 19 8" />
                </svg>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="font-bold pr-6">{video.title || 'Untitled'}</div>
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`inline-block text-xs font-semibold rounded-full px-3 py-0.5
            ${
              video.category?.toLowerCase() === 'office'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : video.category?.toLowerCase() === 'truck'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : video.category?.toLowerCase() === 'van'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          style={{ minWidth: 'fit-content' }}
        >
          {video.category || 'Uncategorized'}
        </span>
      </div>
      <div
        className="text-xs text-gray-600 mb-2 line-clamp-2"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {video.description || 'No description available'}
      </div>
      <div
        className="relative aspect-video w-full overflow-hidden rounded-lg cursor-pointer"
        onClick={() => youtubeId && handleOpenModal()}
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={video.title || 'Video thumbnail'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <PlayCircle className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">No thumbnail available</p>
            </div>
          </div>
        )}
        {youtubeId && (
          <>
            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 z-10" />
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
              <span className="rounded-full bg-white/60 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-red-500" fill="none" />
              </span>
            </span>
          </>
        )}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar size={16} className="text-gray-400" />
          {formatDate(video.created_at)}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={16} className="text-gray-400" />
          {video.duration || 'N/A'}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Users size={16} className="text-gray-400" />
          {video.num_of_assigned_users || 0} assigned
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle size={16} className="text-gray-400" />
          {Math.round(video.completion_rate || 0)}% completed
        </span>
      </div>

      <Button
        className="mt-auto bg-red-500 text-white hover:bg-red-600"
        onClick={handleAssignToUsers}
      >
        Assign to Users
      </Button>

      {/* YouTube Modal - Placeholder for now */}
      {showModal && youtubeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{video.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                ×
              </Button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={video.title}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col items-center">
            <div className="mb-4 text-center">
              <Trash2 className="w-10 h-10 text-[#EA384C] mx-auto mb-2" />
              <div className="text-lg font-semibold mb-2">Delete Video</div>
              <div className="text-gray-600">
                Are you sure that you want to delete{' '}
                <span className="font-bold">{video.title}</span>?
              </div>
              {(() => {
                const assignedUsers = Number(video.num_of_assigned_users);
                return !isNaN(assignedUsers) && assignedUsers > 0 ? (
                  <div className="text-red-600 mt-2">
                    This video is assigned to {assignedUsers} user
                    {assignedUsers > 1 ? 's' : ''}.
                  </div>
                ) : null;
              })()}
              {error && <div className="text-red-600 mt-2">{error}</div>}
            </div>
            <div className="flex gap-2 w-full justify-center mt-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-[#EA384C] text-white font-medium hover:bg-[#EC4659] transition disabled:opacity-50"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Video Modal */}
      {assignModalOpen && onAssignVideo && (
        <AssignVideoModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          videoId={video.id}
          videoTitle={video.title}
          assignedCount={video.num_of_assigned_users || 0}
          users={users}
          onAssign={handleAssignVideo}
        />
      )}
    </div>
  );
}
