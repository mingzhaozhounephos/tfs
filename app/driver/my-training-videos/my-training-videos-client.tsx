'use client';

import { useState, useMemo } from 'react';
import { TrainingVideosGrid } from '@/components/shared/TrainingVideosGrid';
import { TrainingVideoModal } from '@/components/shared/TrainingVideoModal';
import { TrainingVideo } from '@/types';
import { getYouTubeId } from '@/lib/youtube';

const FILTERS = [
  { label: 'All Videos', value: 'all' },
  { label: 'Renewal Required', value: 'renewal' },
  { label: 'Van', value: 'van' },
  { label: 'Truck', value: 'truck' },
  { label: 'Office', value: 'office' }
];

function isAnnualRenewalDue(video: TrainingVideo) {
  if (!video.is_annual_renewal || !video.assigned_date) return false;
  const assigned = new Date(video.assigned_date);
  const now = new Date();
  return now.getTime() - assigned.getTime() > 365 * 24 * 60 * 60 * 1000;
}

interface MyTrainingVideosClientProps {
  videos: TrainingVideo[];
  role: string;
}

export function MyTrainingVideosClient({
  videos,
  role
}: MyTrainingVideosClientProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalVideo, setModalVideo] = useState<TrainingVideo | null>(null);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    let result = videos;
    if (filter === 'renewal') {
      result = result.filter((v) => v.is_annual_renewal);
    } else if (['van', 'truck', 'office'].includes(filter)) {
      result = result.filter((v) => v.category?.toLowerCase() === filter);
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      result = result.filter(
        (v) =>
          (v.title?.toLowerCase() || '').includes(s) ||
          (v.description?.toLowerCase() || '').includes(s)
      );
    }
    return result;
  }, [videos, filter, search]);

  // Count videos needing annual renewal
  const annualRenewalCount = useMemo(
    () =>
      videos.filter(
        (v) => v.is_annual_renewal && v.assigned_date && isAnnualRenewalDue(v)
      ).length,
    [videos]
  );

  // Handler to show the video modal
  function handleShowVideoModal(video: TrainingVideo) {
    setModalVideo(video);
    setShowModal(true);
  }

  // Handle modal close and refresh data
  function handleModalClose() {
    setShowModal(false);
    setModalVideo(null);
    // Trigger page refresh to get updated data
    window.location.reload();
  }

  // Handle refresh callback
  function handleRefresh() {
    window.location.reload();
  }

  return (
    <div className="flex bg-white min-h-screen h-screen">
      <main className="flex-1 p-8 h-screen overflow-y-auto relative">
        <div className="flex flex-col gap-2 items-start mb-2">
          <img
            src="/Logo.jpg"
            alt="TFS Express Logistics"
            className="h-8 w-auto mb-2"
          />
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Training Videos</h1>
          {annualRenewalCount > 0 && (
            <span className="inline-flex items-center gap-2 px-4 py-1 pt-[7px] rounded-full text-sm font-semibold bg-red-500 text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                <polygon
                  points="10,2 19,18 1,18"
                  fill="#fff"
                  stroke="#fff"
                  strokeWidth="1"
                />
                <polygon points="10,3.5 17.5,17 2.5,17" fill="#dc2626" />
                <text
                  x="10"
                  y="15"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#fff"
                  alignmentBaseline="middle"
                  dominantBaseline="middle"
                >
                  !
                </text>
              </svg>
              {annualRenewalCount} video{annualRenewalCount > 1 ? 's' : ''} need
              annual renewal
            </span>
          )}
        </div>
        <div className="mb-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EA384C] pointer-events-none">
              <svg
                className="lucide lucide-search w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 border border-[#EA384C] rounded-lg px-4 py-2 text-sm bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28896] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-64 bg-gray-50 focus:bg-white focus:border-[#EA384C] transition"
            />
          </div>
        </div>
        {/* Tab Navigation */}
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
                onClick={() => setFilter(f.value)}
                type="button"
                aria-pressed={filter === f.value}
              >
                {f.label}
                {f.value === 'all' && (
                  <span className="ml-2">({videos.length})</span>
                )}
              </button>
              {f.label === 'Renewal Required' && annualRenewalCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-xs font-bold shadow border-2 border-white">
                  {annualRenewalCount}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mb-4">
          <TrainingVideosGrid
            videos={filteredVideos}
            onStartTraining={handleShowVideoModal}
          />
        </div>
        {showModal && modalVideo && (
          <TrainingVideoModal
            open={true}
            onClose={handleModalClose}
            title={modalVideo.title}
            youtubeId={getYouTubeId(modalVideo.youtube_url) || ''}
            videoId={modalVideo.id}
            onRefresh={handleRefresh}
          />
        )}
      </main>
    </div>
  );
}
