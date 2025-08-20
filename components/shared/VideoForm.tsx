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

interface VideoFormProps {
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
  onCancel: () => void;
}

const categories = ['van', 'truck', 'office'];

export function VideoForm({
  video,
  adminUserId,
  onSubmit,
  onCancel
}: VideoFormProps) {
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
  }, [video]);

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
    } catch (err) {
      console.error('Error in form submission:', err);
      setError(err instanceof Error ? err.message : 'Failed to save video');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter video title"
              className="border border-[#EA384C] rounded-lg px-4 py-2 text-sm bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28896] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-gray-50 focus:bg-white focus:border-[#EA384C] transition"
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
              className="border border-[#EA384C] rounded-lg px-4 py-2 text-sm bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28896] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-gray-50 focus:bg-white focus:border-[#EA384C] transition"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Enter video description"
              className="border border-[#EA384C] rounded-lg px-4 py-2 text-sm bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28896] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-gray-50 focus:bg-white focus:border-[#EA384C] transition"
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
              className="border border-[#EA384C] rounded-lg px-4 py-2 text-sm bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28896] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-gray-50 focus:bg-white focus:border-[#EA384C] transition"
            />
          </div>
          <div className="md:col-span-2">
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
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
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
  );
}
