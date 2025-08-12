'use client';

import { useMemo } from 'react';

interface AssignedVideosToggleProps {
  userId: string;
  onFilterChange: (filter: string) => void;
  filter: string;
  videos: any[];
}

const FILTERS = [
  { label: 'All Videos', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Renewal Required', value: 'renewal' },
  { label: 'Van', value: 'van' },
  { label: 'Truck', value: 'truck' },
  { label: 'Office', value: 'office' }
];

export function AssignedVideosToggle({
  userId,
  onFilterChange,
  filter,
  videos
}: AssignedVideosToggleProps) {
  // Compute counts for each filter
  const counts = useMemo(() => {
    const pending = videos.filter((v) => !v.is_completed).length;
    const completed = videos.filter((v) => v.is_completed).length;
    const renewal = videos.filter(
      (v) => typeof v.video === 'object' && v.video.is_annual_renewal
    ).length;
    const van = videos.filter(
      (v) => typeof v.video === 'object' && v.video.category === 'van'
    ).length;
    const truck = videos.filter(
      (v) => typeof v.video === 'object' && v.video.category === 'truck'
    ).length;
    const office = videos.filter(
      (v) => typeof v.video === 'object' && v.video.category === 'office'
    ).length;
    return {
      all: videos.length,
      pending,
      completed,
      renewal,
      van,
      truck,
      office
    };
  }, [videos]);

  return (
    <div
      className="flex w-fit rounded-lg p-1 mb-6 shadow-sm"
      style={{ backgroundColor: '#F1F5F9' }}
    >
      {FILTERS.map((f) => (
        <div key={f.value} className="relative inline-block">
          <button
            className={`px-4 py-1 rounded-lg transition font-medium
              ${
                filter === f.value
                  ? 'bg-white text-black font-bold shadow'
                  : 'bg-transparent text-gray-500 hover:text-black'
              }
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300
            `}
            onClick={() => onFilterChange(f.value)}
            type="button"
            aria-pressed={filter === f.value}
          >
            {f.label}
            {f.value === 'all' && <span className="ml-2">({counts.all})</span>}
            {f.value === 'pending' && (
              <span className="ml-2">({counts.pending})</span>
            )}
            {f.value === 'completed' && (
              <span className="ml-2">({counts.completed})</span>
            )}
          </button>
          {f.value === 'renewal' && counts.renewal > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-xs font-bold shadow border-2 border-white">
              {counts.renewal}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
