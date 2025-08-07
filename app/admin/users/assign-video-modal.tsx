'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AssignVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  assignedCount: number;
}

export function AssignVideoModal({
  isOpen,
  onClose,
  userId,
  userName,
  assignedCount
}: AssignVideoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Video to User</DialogTitle>
          <DialogDescription>
            Assign training videos to {userName}. This feature is coming soon.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Video assignment functionality will be implemented in a future
              update. Currently assigned videos: {assignedCount}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
