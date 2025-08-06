'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface VideoFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  video?: {
    id?: string;
    title: string;
    description: string;
    youtube_url: string;
    category: string;
    duration?: string;
    is_annual_renewal?: boolean;
  };
  adminUserId: string;
  onSubmit: (videoData: {
    id?: string;
    title: string;
    description: string;
    youtube_url: string;
    category: string;
    duration?: string;
    is_annual_renewal?: boolean;
  }) => Promise<void>;
}

const categories = ['van', 'truck', 'office'];

export function VideoFormModal({
  open,
  onClose,
  onSuccess,
  video,
  adminUserId,
  onSubmit
}: VideoFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [duration, setDuration] = useState('');
  const [isAnnualRenewal, setIsAnnualRenewal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (video) {
      setTitle(video.title || '');
      setDescription(video.description || '');
      setYoutubeUrl(video.youtube_url || '');
      setCategory(video.category || categories[0]);
      setDuration(video.duration || '');
      setIsAnnualRenewal(video.is_annual_renewal || false);
    } else {
      setTitle('');
      setDescription('');
      setYoutubeUrl('');
      setCategory(categories[0]);
      setDuration('');
      setIsAnnualRenewal(false);
    }
    setError(null);
  }, [video, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const videoData = {
      id: video?.id,
      title,
      description,
      youtube_url: youtubeUrl,
      category,
      duration,
      is_annual_renewal: isAnnualRenewal
    };

    try {
      await onSubmit(videoData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error in form submission:', err);
      setError(err instanceof Error ? err.message : 'Failed to save video');
    } finally {
      setIsLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-1">
          {video ? 'Edit Training Video' : 'Add New Training Video'}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {video
            ? 'Edit the YouTube video in your training library.'
            : 'Add a YouTube video to your training library.'}
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter video title"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Enter video description"
            />
          </div>
          <div>
            <Label htmlFor="youtubeUrl">YouTube URL</Label>
            <Input
              id="youtubeUrl"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              required
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="duration">Duration (optional)</Label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="10:00"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAnnualRenewal"
              checked={isAnnualRenewal}
              onCheckedChange={(checked) =>
                setIsAnnualRenewal(checked as boolean)
              }
            />
            <Label htmlFor="isAnnualRenewal" className="text-sm">
              Requires annual renewal
            </Label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
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
                  Processing
                </span>
              ) : video ? (
                'Save Changes'
              ) : (
                'Add Video'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
