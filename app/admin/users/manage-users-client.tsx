'use client';

import { useMemo, useState } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { AdminUser } from '@/app/admin/users/actions';
import { UserCard } from './user-card';
import { UserFormModal } from './user-form-modal';
import { AssignVideoModal } from './assign-video-modal';

interface UserStats {
  numAssigned: number;
  completion: number;
}

interface UserStatsMap {
  [userId: string]: UserStats;
}

interface ManageUsersClientProps {
  users: AdminUser[];
  userStats: UserStatsMap;
}

export function ManageUsersClient({
  users,
  userStats
}: ManageUsersClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Handle search functionality
  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  // Handle video assignment
  const handleAssignVideo = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setAssignModalOpen(true);
  };

  // Filter and sort users: active users first, then by name
  const sortedUsers = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const filtered = normalized
      ? users.filter(
          (u) =>
            (u.full_name || '').toLowerCase().includes(normalized) ||
            (u.email || '').toLowerCase().includes(normalized) ||
            u.id.toLowerCase().includes(normalized)
        )
      : users;

    return filtered.slice().sort((a, b) => {
      if ((a.is_active ?? true) !== (b.is_active ?? true)) {
        return (a.is_active ?? true) ? -1 : 1;
      }
      const nameA = a.full_name || a.id;
      const nameB = b.full_name || b.id;
      return nameA.localeCompare(nameB);
    });
  }, [users, searchTerm]);

  return (
    <div className="flex-1 p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2 items-start mb-2">
        <img
          src="/Logo.jpg"
          alt="TFS Express Logistics"
          className="h-8 w-auto mb-2"
        />
      </div>

      {/* Title and Add User Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#EA384C] text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-[#EC4659] transition-colors"
        >
          <PlusCircle size={20} />
          Add User
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EA384C] w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 border border-[#EA384C] rounded-lg px-4 py-2 text-sm bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28896] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-64 bg-gray-50 focus:bg-white focus:border-[#EA384C] transition"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onAssignVideo={(userId) =>
                handleAssignVideo(userId, user.full_name || user.id)
              }
              onUserUpdated={() => router.refresh()}
              stats={userStats[user.id] || { numAssigned: 0, completion: 0 }}
            />
          ))}
        </div>

        {/* Empty State */}
        {sortedUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No users found</div>
            <p className="text-gray-400">
              Try adjusting your search or add a new user.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <AssignVideoModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        userId={selectedUserId || ''}
        userName={selectedUserName}
        assignedCount={0}
      />
    </div>
  );
}
