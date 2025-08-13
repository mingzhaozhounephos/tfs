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

export interface TrainingVideo {
  id: string;
  title: string;
  category: string;
  description: string;
  created_at: string | Date;
  duration: string;
  youtube_url?: string;
  assigned_date?: string | Date;
  last_watched?: string | Date;
  renewal_due?: string;
  is_completed?: boolean;
  modified_date?: string;
  last_action?: string;
  is_annual_renewal?: boolean;
  completed_date?: string | Date;
}
