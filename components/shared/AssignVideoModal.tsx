'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  users_videos?: {
    video: string | null;
    is_completed: boolean | null;
  }[];
}

interface AssignVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
  assignedCount: number;
  users: User[];
  onAssign: (videoId: string, selectedUserIds: string[]) => Promise<void>;
}

export function AssignVideoModal({
  isOpen,
  onClose,
  videoId,
  videoTitle,
  assignedCount,
  users,
  onAssign
}: AssignVideoModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [initialSelectedUsers, setInitialSelectedUsers] = useState<string[]>(
    []
  );
  const [mounted, setMounted] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset selected users when modal opens and pre-select already assigned users
  useEffect(() => {
    if (isOpen) {
      // Find users who are already assigned to this video
      const assignedUserIds = users
        .filter((user) => user.users_videos?.some((uv) => uv.video === videoId))
        .map((user) => user.id);

      setSelectedUsers(assignedUserIds);
      setInitialSelectedUsers(assignedUserIds);
    }
  }, [isOpen, videoId, users]);

  if (!isOpen) return null;

  // Filtered users for search
  const filteredUsers = searchQuery
    ? users.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  // Select All logic
  const allSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => selectedUsers.includes(u.id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedUsers(
        selectedUsers.filter((id) => !filteredUsers.some((u) => u.id === id))
      );
    } else {
      setSelectedUsers([
        ...selectedUsers,
        ...filteredUsers
          .filter((u) => !selectedUsers.includes(u.id))
          .map((u) => u.id)
      ]);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Enable button if:
  // 1. There are selected users to assign
  // 2. There are currently assigned users (to allow unassigning)
  // 3. There were initially assigned users but now none are selected (to allow unassigning all)
  const hasInitialAssignments = assignedCount > 0;
  const hasSelectedUsers = selectedUsers.length > 0;
  const canAssign = hasSelectedUsers || hasInitialAssignments;

  const handleAssign = async () => {
    try {
      setIsAssigning(true);

      // Compare initial and current selections
      const hasChanges =
        initialSelectedUsers.length !== selectedUsers.length ||
        !initialSelectedUsers.every((id) => selectedUsers.includes(id)) ||
        !selectedUsers.every((id) => initialSelectedUsers.includes(id));

      // Close modal first to prevent any race conditions
      onClose();

      // Then perform the assignment
      await onAssign(videoId, selectedUsers);
    } catch (err) {
      console.error('Failed to assign videos:', err);
    } finally {
      setIsAssigning(false);
    }
  };

  // Modal content
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay: semi-transparent black */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Modal */}
      <div className="relative bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md mx-4 shadow-lg z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Assign Video to Users</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-xl px-2"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        {/* Subtitle with video title */}
        <div className="text-sm text-gray-600 mb-4">
          Select users to assign{' '}
          <span className="font-semibold">&quot;{videoTitle}&quot;</span> to.
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
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 border border-[#EA384C] rounded-lg px-4 py-2 text-sm bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28896] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-gray-50 focus:bg-white focus:border-[#EA384C] transition"
            />
          </div>
        </div>
        {/* User List */}
        <div className="flex-1 overflow-y-auto mb-4 border border-[#e6e6e6] max-h-96">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">No users found.</div>
          ) : (
            <>
              <div className="flex items-center px-3 py-2 border border-[#e6e6e6] bg-white sticky top-0 z-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="mr-2"
                />
                <span className="text-sm font-medium select-none">
                  Select All ({filteredUsers.length})
                </span>
              </div>
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center h-14 px-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleUserSelect(user.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserSelect(user.id)}
                    className="mr-2"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {user.email}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user.full_name}
                    </div>
                  </div>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                      user.role === 'admin'
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {selectedUsers.length} users selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!canAssign || isAssigning}
              className="px-4 py-2 text-sm font-medium text-white bg-[#EA384C] rounded-md hover:bg-[#EC4659] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAssigning ? 'Assigning...' : 'Assign Video'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
