'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { User } from '@/types';

interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface AssignVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  assignedVideoIds: string[];
  videos: Video[];
  onSave: (selectedVideoIds: string[]) => Promise<void>;
}

export function AssignVideosModal({
  isOpen,
  onClose,
  user,
  assignedVideoIds,
  videos,
  onSave
}: AssignVideosModalProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>(assignedVideoIds);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset selected videos when modal opens/closes or assignedVideoIds changes
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    setSelected(assignedVideoIds);
  }, [assignedVideoIds, isOpen]);

  if (!isOpen || !mounted) return null;

  // Filter and group videos
  const filteredVideos = videos.filter(
    (v: Video) =>
      (v.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (v.description?.toLowerCase() || '').includes(search.toLowerCase())
  );
  const categories = Array.from(
    new Set(filteredVideos.map((v: Video) => v.category || ''))
  );
  const videosByCategory = categories.map((cat: string) => ({
    category: cat,
    videos: filteredVideos.filter((v: Video) => v.category === cat)
  }));

  // Select logic
  const allSelected =
    filteredVideos.length > 0 &&
    filteredVideos.every((v: Video) => selected.includes(v.id));
  const handleSelectAll = () => {
    if (allSelected)
      setSelected(
        selected.filter((id) => !filteredVideos.some((v: Video) => v.id === id))
      );
    else
      setSelected([
        ...selected,
        ...filteredVideos
          .filter((v: Video) => !selected.includes(v.id))
          .map((v: Video) => v.id)
      ]);
  };
  const handleGroupSelect = (cat: string) => {
    const groupIds =
      videosByCategory
        .find((g) => g.category === cat)
        ?.videos.map((v: Video) => v.id) || [];
    const allGroupSelected =
      groupIds.length > 0 &&
      groupIds.every((id: string) => selected.includes(id));
    if (allGroupSelected)
      setSelected(selected.filter((id: string) => !groupIds.includes(id)));
    else
      setSelected([
        ...selected,
        ...groupIds.filter((id: string) => !selected.includes(id))
      ]);
  };
  const handleVideoSelect = (id: string) => {
    setSelected((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(selected);
    setSaving(false);
    onClose();
  };

  // Modal content
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl border border-gray-200 p-6 w-full max-w-xl mx-auto shadow-lg z-10 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">
            Assign Videos to {user.full_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-xl px-2"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Select videos to assign to this user.
        </div>
        {/* Search */}
        <div className="w-full mb-4">
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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 border border-[#EA384C] rounded-lg px-4 py-2 text-sm bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28896] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-64 bg-gray-50 focus:bg-white focus:border-[#EA384C] transition"
            />
          </div>
        </div>
        {/* Select All */}
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAll}
            className="mr-2"
          />
          <span className="text-sm font-medium select-none">
            Select All ({filteredVideos.length})
          </span>
        </div>
        {/* Grouped videos */}
        <div className="flex-1 overflow-y-auto mb-4">
          {videos.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No videos found.
            </div>
          ) : videosByCategory.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No videos match your search.
            </div>
          ) : (
            videosByCategory.map((group) => {
              const groupIds = group.videos.map((v: Video) => v.id);
              const allGroupSelected =
                groupIds.length > 0 &&
                groupIds.every((id: string) => selected.includes(id));
              const groupAssignedCount = group.videos.filter((v: Video) =>
                assignedVideoIds.includes(v.id)
              ).length;
              return (
                <div key={group.category} className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={allGroupSelected}
                      onChange={() => handleGroupSelect(group.category)}
                      className="mr-2"
                    />
                    <span
                      className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300 w-fit`}
                    >
                      {group.category}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {group.videos.length} videos
                      {groupAssignedCount > 0 && (
                        <span className="ml-1 text-green-600">
                          ({groupAssignedCount} assigned)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100 bg-gray-50 rounded-lg border border-gray-100">
                    {group.videos.map((video: Video) => {
                      const isAssigned = assignedVideoIds.includes(video.id);
                      return (
                        <div
                          key={video.id}
                          className={`flex items-center px-3 py-2 ${
                            isAssigned ? 'bg-green-50' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected.includes(video.id)}
                            onChange={() => handleVideoSelect(video.id)}
                            className="mr-2"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {video.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {video.description}
                            </div>
                          </div>
                          {isAssigned && (
                            <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                              Assigned
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {selected.length} videos selected
            {selected.length > assignedVideoIds.length && (
              <span className="ml-1 text-green-600">
                (+{selected.length - assignedVideoIds.length} new)
              </span>
            )}
            {selected.length < assignedVideoIds.length && (
              <span className="ml-1 text-red-600">
                (-{assignedVideoIds.length - selected.length} removed)
              </span>
            )}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-[#EA384C] rounded-md hover:bg-[#d92d3a]00 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Saving
                </span>
              ) : (
                'Save Assignments'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
