'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { AssignVideosModal } from './assign-videos-modal';

interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface AssignVideoButtonProps {
  user: User;
  onAssignmentComplete?: () => void;
  initialAssignedVideoIds?: string[];
  videos: Video[];
}

export function AssignVideoButton({
  user,
  onAssignmentComplete,
  initialAssignedVideoIds = [],
  videos
}: AssignVideoButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignedVideoIds, setAssignedVideoIds] = useState<string[]>(
    initialAssignedVideoIds
  );

  // Update local state when initial assignments change
  useEffect(() => {
    setAssignedVideoIds(initialAssignedVideoIds);
  }, [initialAssignedVideoIds]);

  const handleSave = async (selectedVideoIds: string[]) => {
    try {
      const response = await fetch('/api/assign-video-to-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          videoIds: selectedVideoIds
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign videos');
      }

      // Update local state
      setAssignedVideoIds(selectedVideoIds);

      // Notify parent to refresh data
      onAssignmentComplete?.();
    } catch (error) {
      console.error('Error assigning videos:', error);
      // You could add toast notification here if you want
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-[#EA384C] text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-[#EC4659]"
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
        Assign Videos
      </button>

      <AssignVideosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        assignedVideoIds={assignedVideoIds}
        videos={videos}
        onSave={handleSave}
      />
    </>
  );
}
