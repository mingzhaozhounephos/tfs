'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { VideoForm } from '@/components/shared/VideoForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Video {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  category: string;
  duration?: string;
  is_annual_renewal?: boolean;
  admin_user: string;
}

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = params?.id as string;

  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`/api/all-videos?id=${videoId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch video');
        }
        const result = await response.json();
        if (result.success && result.data) {
          console.log('result.data', result.data);
          setVideo(result.data);
        } else {
          throw new Error('Video not found');
        }
      } catch (error) {
        toast.error('Failed to load video');
        router.push('/admin/manage-videos');
      } finally {
        setIsFetching(false);
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId, router]);

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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...videoData, id: videoId })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update video');
      }

      toast.success('Video updated successfully');

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

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">
            Video Not Found
          </h2>
          <Button onClick={handleCancel}>Back to Videos</Button>
        </div>
      </div>
    );
  }

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
      <div className="mb-6">
        <Button onClick={handleCancel} variant="outline" className="mb-4">
          ← Back to Videos
        </Button>
        <h2 className="text-xl font-bold mb-1">Edit Training Video</h2>
        <p className="text-sm text-gray-600 mb-4">
          Edit the YouTube video in your training library.
        </p>
      </div>

      <VideoForm
        video={video}
        onSubmit={handleVideoSubmit}
        onCancel={handleCancel}
        adminUserId={video.admin_user}
      />
    </div>
  );
}
