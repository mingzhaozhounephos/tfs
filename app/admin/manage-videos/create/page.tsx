'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VideoForm } from '@/components/shared/VideoForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CreateVideoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleVideoSubmit = async (videoData: {
    id?: string;
    title: string;
    description: string;
    youtube_url: string;
    category: string;
    duration?: string;
    is_annual_renewal?: boolean;
  }): Promise<void> => {
    setIsLoading(true);
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

      toast.success('Video created successfully');

      // Navigate back to manage videos page
      router.push('/admin/manage-videos');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
      throw error; // Re-throw to let the form handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/manage-videos');
  };

  return (
    <div className="flex-1 bg-white p-8 min-h-screen">
      <div className="flex flex-col gap-2 items-start mb-2">
        <img
          src="/Logo.jpg"
          alt="TFS Express Logistics"
          className="h-8 w-auto mb-2"
        />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Add New Training Video</h2>
          <p className="text-sm text-gray-600">
            Add a YouTube video to your training library.
          </p>
        </div>
        <Button onClick={handleCancel} variant="outline">
          ← Back to Videos
        </Button>
      </div>

      <VideoForm
        onSubmit={handleVideoSubmit}
        onCancel={handleCancel}
        adminUserId="" // This will be set by the API based on the authenticated user
      />
    </div>
  );
}
