import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw, Shield, Camera, Film } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LiveVideoFeed: React.FC = () => {
  const { cameras, selectedCameraId, setSelectedCameraId, systemHealth } = useApp();
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [cctvFeeds, setCctvFeeds] = useState<Record<string, string>>({});
  const [failedCams, setFailedCams] = useState<Record<string, boolean>>({});

  const currentCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0];

  // Poll /api/cctv so when user drops video in public/cctv_footage, feed automatically updates!
  const checkCctvFiles = async () => {
    try {
      const res = await fetch('/api/cctv');
      const data = await res.json();
      if (data.success && data.cameraFeeds) {
        setCctvFeeds(data.cameraFeeds);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    checkCctvFiles();
    const interval = setInterval(checkCctvFiles, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeVideoUrl = cctvFeeds[currentCamera.id] || currentCamera.videoUrl;
  const videoSrc = failedCams[currentCamera.id]
    ? currentCamera.fallbackVideoUrl
    : activeVideoUrl;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setFailedCams((prev) => ({ ...prev, [currentCamera.id]: false }));
    checkCctvFiles();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleVideoError = () => {
    // If local CCTV video in /cctv_footage isn't found, fall back to streaming video
    setFailedCams((prev) => ({ ...prev, [currentCamera.id]: true }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col font-sans shadow-xs">
      {/* Top Header with 3 Camera Selector & Controls */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 max-w-full">
          <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md text-xs font-mono text-[#0B7FF5] font-bold shrink-0 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0B7FF5] animate-pulse shrink-0" />
            <span className="whitespace-nowrap">LIVE CCTV</span>
          </div>

          {/* Camera Selector Dropdown (3 Cameras) */}
          <div className="flex items-center space-x-1.5 min-w-0 flex-1">
            <Camera className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              className="bg-white border border-slate-300 hover:border-[#0B7FF5] text-slate-900 text-xs font-semibold rounded-lg px-2.5 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 transition-calm min-w-0 w-full max-w-full truncate cursor-pointer"
              title="Select camera feed (3 available)"
            >
              {cameras.map((cam) => {
                const label = cam.name.startsWith(cam.id) ? cam.name : `${cam.id} - ${cam.name}`;
                return (
                  <option key={cam.id} value={cam.id}>
                    {label} ({cam.location})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Active CCTV File indicator */}
          <div className="hidden sm:flex items-center space-x-1 font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 shrink-0">
            <Film className="w-3 h-3 text-[#0B7FF5] shrink-0" />
            <span className="truncate max-w-[200px]">/cctv_footage/{currentCamera.cctvFilename}</span>
          </div>

          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition-calm cursor-pointer shrink-0"
            title="Refresh Stream / Rescan folder"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Video Stream Container: Plays CCTV video on repeat */}
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
        <video
          key={`${selectedCameraId}-${videoSrc}`}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          onError={handleVideoError}
          className="w-full h-full object-cover"
        />

        {/* Camera Info Watermark */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm border border-slate-700/80 px-2.5 py-1 rounded-md text-[11px] font-mono text-white flex items-center space-x-2 shadow">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-sky-400">{currentCamera.id}</span>
          <span className="text-slate-400">&bull;</span>
          <span className="text-slate-200">{currentCamera.location}</span>
        </div>

        {showBoundingBoxes && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute border-2 border-[#0B7FF5] bg-[#0B7FF5]/20 rounded transition-all duration-150"
              style={{ top: '35%', left: '42%', width: '28%', height: '32%' }}
            >
              <div className="absolute -top-6 left-0 bg-[#0B7FF5] text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                vehicle_vector: 94%
              </div>
            </div>

            <div
              className="absolute border-2 border-sky-400 bg-sky-400/20 rounded transition-all duration-150"
              style={{ top: '50%', left: '60%', width: '15%', height: '20%' }}
            >
              <div className="absolute -top-6 left-0 bg-sky-400 text-slate-900 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                trajectory_track: 91%
              </div>
            </div>

            <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-700 p-2.5 rounded-lg text-[10px] font-mono text-sky-400 space-y-1 shadow-md">
              <div>INFERENCE: YOLOv8 PyTorch</div>
              <div>CAMERA: {currentCamera.id} ({currentCamera.resolution})</div>
              <div>CONFIDENCE: 94.2%</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Detection Strip */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5 text-[#0B7FF5]" />
          <div>
            <span className="text-slate-400 block text-[10px] font-mono font-bold uppercase">Model</span>
            <span className="font-mono text-slate-800 text-xs font-bold">YOLOv8 Real-Time</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Radio className="w-3.5 h-3.5 text-[#0B7FF5]" />
          <div>
            <span className="text-slate-400 block text-[10px] font-mono font-bold uppercase">Stream Rate</span>
            <span className="font-mono text-slate-800 text-xs font-bold">
              {currentCamera.fps} FPS ({systemHealth.latencyMs}ms)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Camera className="w-3.5 h-3.5 text-[#0B7FF5]" />
          <div>
            <span className="text-slate-400 block text-[10px] font-mono font-bold uppercase">Resolution</span>
            <span className="font-mono text-slate-800 text-xs font-bold">
              {currentCamera.resolution} HD
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 justify-end font-mono text-[10px] text-slate-600 font-bold">
          <span>Feed: {currentCamera.id} (1 of 3)</span>
        </div>
      </div>
    </div>
  );
};
