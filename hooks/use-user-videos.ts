import { useState, useEffect, useCallback } from 'react';

interface UserVideo {
  id: string;
  user: string;
  video:
    | string
    | { id: string; title: string; description: string; category: string };
  is_completed: boolean;
  assigned_date: string;
  last_watched: string;
}

export function useUserVideos(userId: string) {
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/videos`);

      if (!response.ok) {
        throw new Error('Failed to fetch user videos');
      }

      const data = await response.json();
      console.log('data', data);
      setVideos(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch user videos'
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(() => {
    return fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    if (userId) {
      fetchVideos();
    }
  }, [userId, fetchVideos]);

  return { videos, loading, error, refresh };
}
