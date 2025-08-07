'use client';

import { useState } from 'react';
import {
  Users,
  Calendar,
  Video,
  CheckCircle,
  Mail,
  Trash2,
  Settings,
  Send,
  Key,
  MoreVertical
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserWithRole } from './page';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface UserCardProps {
  user: UserWithRole;
  onAssignVideo: (userId: string) => void;
  onUserUpdated: () => void;
}

export function UserCard({
  user,
  onAssignVideo,
  onUserUpdated
}: UserCardProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isSendingResetPassword, setIsSendingResetPassword] = useState(false);

  // Get the user's role (assuming single role for now)
  const userRole = user.roles?.[0]?.role || 'driver';
  const [selectedRole, setSelectedRole] = useState<'admin' | 'driver'>(
    userRole as 'admin' | 'driver'
  );

  // Mock stats for now - in a real app, you'd fetch these
  const stats = {
    numAssigned: 0,
    completion: 0
  };

  const handleDelete = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      onUserUpdated();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete user'
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleUpdateRole = async () => {
    if (selectedRole === userRole) {
      setShowManageModal(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/update-user-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: selectedRole })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user role');
      }

      toast.success('User role updated successfully');
      onUserUpdated();
      setShowManageModal(false);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update user role'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendInvite = async () => {
    if (!user.id) return;

    setIsSendingInvite(true);
    try {
      const response = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: userRole })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send invitation');
      }

      toast.success('Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to send invitation'
      );
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user.id) return;

    setIsSendingResetPassword(true);
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send reset password email');
      }

      toast.success('Reset password email sent successfully!');
    } catch (error) {
      console.error('Error sending reset password email:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to send reset password email'
      );
    } finally {
      setIsSendingResetPassword(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 border relative">
        {/* Inactive badge */}
        {user.is_active === false && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded z-20">
            inactive
          </span>
        )}

        {/* User Info */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <Users size={28} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg">
              {user.full_name || 'Unnamed User'}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Mail size={14} className="text-gray-400" />
              {user.id}
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="flex justify-between items-center text-xs text-gray-700 mb-2 gap-2">
          <div className="flex flex-col gap-2 flex-1">
            <span className="inline-block font-semibold border rounded-full px-3 py-0.5 bg-white text-black text-xs text-center w-fit mb-1">
              {userRole}
            </span>
            <span className="flex items-center gap-1">
              <Video size={14} className="text-gray-400" />
              {`${stats.numAssigned} videos assigned`}
            </span>
          </div>
          <div className="flex flex-col gap-2 flex-1 items-start">
            <span className="flex items-center gap-1">
              <Calendar size={14} className="text-gray-400" />
              Recently joined
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle size={14} className="text-gray-400" />
              {`${stats.completion}% completed`}
            </span>
          </div>
        </div>

        {/* View Details Button */}
        <Button
          onClick={() => router.push(`/admin/users/${user.id}`)}
          variant="outline"
          className="w-full"
        >
          View Details
        </Button>

        {/* Dropdown Menu */}
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {!user.is_active && (
                <DropdownMenuItem
                  onClick={handleSendInvite}
                  disabled={isSendingInvite}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSendingInvite ? 'Sending...' : 'Send Invite'}
                </DropdownMenuItem>
              )}
              {user.is_active && (
                <DropdownMenuItem
                  onClick={handleResetPassword}
                  disabled={isSendingResetPassword}
                  className="flex items-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  {isSendingResetPassword ? 'Sending...' : 'Reset Password'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setShowManageModal(true)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Manage
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
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure that you want to delete{' '}
              <span className="font-bold">{user.full_name || 'this user'}</span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage User Modal */}
      <Dialog open={showManageModal} onOpenChange={setShowManageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Manage User
            </DialogTitle>
            <DialogDescription>
              {user.full_name || 'Unnamed User'}
              <br />
              <span className="text-sm text-gray-500">{user.id}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setSelectedRole(value as 'admin' | 'driver')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowManageModal(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
