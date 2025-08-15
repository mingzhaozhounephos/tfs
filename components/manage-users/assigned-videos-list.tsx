'use client';

import { useMemo, useState } from 'react';
import { AdminVideoCard } from '@/components/shared/AdminVideoCard';
import { AssignVideoModal } from '@/components/shared/AssignVideoModal';

interface AssignedVideosListProps {
  userId: string;
  filter?: string;
  videos: any[];
  loading?: boolean;
  users?: any[];
  // allVideos?: any[];
  onAssignVideo?: (videoId: string, selectedUserIds: string[]) => Promise<void>;
}

export function AssignedVideosList({
  userId,
  filter = 'all',
  videos,
  loading = false,
  users = [],
  // allVideos = [],
  onAssignVideo
}: AssignedVideosListProps) {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedVideoForAssign, setSelectedVideoForAssign] =
    useState<any>(null);

  const handleAssignToUsers = (userVideo: any) => {
    console.log('userVideo: ', userVideo);
    setSelectedVideoForAssign(userVideo);
    setAssignModalOpen(true);
  };

  // Console log users prop
  console.log('AssignedVideosList users:', users);
  // console.log('AssignedVideosList allVideos:', allVideos);

  const filteredVideos = useMemo(() => {
    // First filter by user ID
    const userVideos = videos.filter((v) => v.user === userId);
    console.log('userVideos: ', userVideos);
    // Then apply additional filters
    if (filter === 'pending') return userVideos.filter((v) => !v.is_completed);
    if (filter === 'completed') return userVideos.filter((v) => v.is_completed);
    if (filter === 'renewal')
      return userVideos.filter((v) => v.video && v.video.is_annual_renewal);
    if (['van', 'truck', 'office'].includes(filter))
      return userVideos.filter((v) => v.video && v.video.category === filter);
    return userVideos; // 'all' case
  }, [videos, filter, userId]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading videos...</div>
    );
  if (!filteredVideos.length) {
    let title = '';
    let subtitle = '';
    switch (filter) {
      case 'all':
        title = 'No Videos';
        subtitle = "This user hasn't been assigned to any videos.";
        break;
      case 'pending':
        title = 'No Pending Videos';
        subtitle = "This user doesn't have any pending videos.";
        break;
      case 'completed':
        title = 'No Completed Videos';
        subtitle = "This user hasn't completed any videos yet.";
        break;
      case 'renewal':
        title = 'No Renewal Videos';
        subtitle = "This user doesn't have any videos to renewal.";
        break;
      case 'van':
        title = 'No Van Videos';
        subtitle = "This user doesn't have any  videos for van.";
        break;
      case 'truck':
        title = 'No Truck Videos';
        subtitle = "This user doesn't have any  videos for truck.";
        break;
      case 'office':
        title = 'No Office Videos';
        subtitle = "This user doesn't have any  videos for office.";
        break;
      default:
        title = 'No Videos';
        subtitle = "This user hasn't been assigned to any videos.";
    }
    return (
      <div className="w-full flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 py-16 px-4">
        <div className="flex flex-col items-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            className="mb-4 text-gray-400"
          >
            <path
              d="M24 8L6 40h36L24 8z"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <circle cx="24" cy="32" r="2.5" fill="currentColor" />
            <rect
              x="22.75"
              y="18"
              width="2.5"
              height="10"
              rx="1.25"
              fill="currentColor"
            />
          </svg>
          <div className="font-bold text-xl text-gray-900 mb-2">{title}</div>
          <div className="text-gray-500 text-base">{subtitle}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredVideos.map(
          (userVideo) =>
            userVideo.video && (
              <AdminVideoCard
                key={userVideo.id}
                video={{
                  id: userVideo.video.id,
                  title: userVideo.video.title || '-',
                  category: userVideo.video.category || '-',
                  description: userVideo.video.description || '-',
                  created_at:
                    userVideo.video.created_at || new Date().toISOString(),
                  duration: userVideo.video.duration || '-',
                  youtube_url: userVideo.video.youtube_url,
                  num_of_assigned_users:
                    userVideo.video.num_of_assigned_users || 0,
                  completion_rate: userVideo.video.completion_rate || 0
                }}
                showEdit={false}
                onAssignToUsers={() => handleAssignToUsers(userVideo)}
                showEnhancedInfo={true}
                enhancedData={{
                  assigned_date: userVideo.assigned_date,
                  last_action: userVideo.last_action,
                  last_watched: userVideo.last_watched,
                  completed_date: userVideo.completed_date,
                  is_completed: userVideo.is_completed
                }}
              />
            )
        )}
      </div>

      {/* Assign Video Modal */}
      {assignModalOpen && selectedVideoForAssign && onAssignVideo && (
        <AssignVideoModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedVideoForAssign(null);
          }}
          videoId={selectedVideoForAssign.video.id}
          videoTitle={selectedVideoForAssign.video.title || 'Untitled'}
          assignedCount={
            selectedVideoForAssign.video.num_of_assigned_users || 0
          }
          users={users}
          onAssign={onAssignVideo}
        />
      )}
    </>
  );
}
