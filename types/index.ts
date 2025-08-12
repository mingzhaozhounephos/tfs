import { Database } from '@/utils/supabase/types';

export interface UserStats {
  numAssigned: number;
  completion: number;
}

export type User = Database['public']['Tables']['users']['Row'] & {
  role: string;
  created_at: string;
  email: string; // Add email field that's expected by components
  stats: UserStats;
};

export type Video = Database['public']['Tables']['videos']['Row'];

export type UserVideo = Database['public']['Tables']['users_videos']['Row'] & {
  video: Video;
};
