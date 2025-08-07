'use client';

import { useState } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { useSupabaseStore } from '@/utils/supabase/hooks';
import { type QueryResult } from '@/utils/supabase/server';
import { UserWithRole } from './page';
import { UserCard } from './user-card';
import { UserFormModal } from './user-form-modal';
import { AssignVideoModal } from './assign-video-modal';

interface ManageUsersClientProps {
  usersQuery: QueryResult<UserWithRole>;
}

export function ManageUsersClient({ usersQuery }: ManageUsersClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  // Use the Supabase Store hook to make the query reactive
  const {
    data: users,
    filters,
    loading,
    error,
    updateFilters,
    refetch
  } = useSupabaseStore(usersQuery);

  // Handle search functionality
  const handleSearch = (searchTerm: string) => {
    updateFilters({
      full_name_ilike: searchTerm ? `%${searchTerm}%` : null
    });
  };

  // Handle video assignment
  const handleAssignVideo = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setAssignModalOpen(true);
  };

  // Sort users: active users first, then by name
  const sortedUsers = users.slice().sort((a, b) => {
    // First sort by active status
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }
    // Then sort by name
    const nameA = a.full_name || a.id;
    const nameB = b.full_name || b.id;
    return nameA.localeCompare(nameB);
  });

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
            className="w-full pl-10 pr-4 py-2 border border-[#EA384C] rounded-lg text-sm bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28896] focus:ring-offset-2 transition-colors md:w-64"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA384C]" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

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
              onUserUpdated={refetch}
            />
          ))}
        </div>

        {/* Empty State */}
        {!loading && sortedUsers.length === 0 && (
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
        onSuccess={refetch}
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
