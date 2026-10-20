import React, { useState } from 'react';
import {
  CheckCircle2,
  PhoneCall,
  X,
  MapPin,
  Radio,
  AlertOctagon,
  ShieldAlert,
  Building2,
  Activity,
  Bed,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Navigation,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EscalationModal: React.FC = () => {
  const {
    isEscalationModalOpen,
    closeEscalationModal,
    activeEscalationIncident,
    dismissIncident,
    acknowledgeIncident,
    dispatchIncident,
    maskedPhone,
    callState,
    systemConfig,
    selectIncidentHospital,
  } = useApp();

  const [showHospitalSelector, setShowHospitalSelector] = useState<boolean>(false);

  if (!isEscalationModalOpen || !activeEscalationIncident) {
    return null;
  }

  const inc = activeEscalationIncident;
  const remaining = Math.max(0, inc.remainingSeconds);

  // Item 3: After the failsafe timer ends (remaining === 0) or call is active/dispatched,
  // automatically show the Twilio call interface!
  const isAwaiting = (inc.status === 'AWAITING' || inc.status === 'DETECTED') && remaining > 0 && callState === 'idle';

  // Compact circular progress calculation
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (remaining / systemConfig.escalationSeconds) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150 font-sans select-none overflow-y-auto">
      {/* Item 4: Fit screen height without getting cropped: max-h-[94vh], compact scaling */}
      <div className="w-full max-w-4xl lg:max-w-5xl max-h-[94vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Header Banner - Compact height */}
        <div className="bg-[#06172E] px-5 sm:px-6 py-3 text-white flex items-center justify-between border-b border-blue-900/50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 shrink-0">
              <AlertOctagon className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase text-sky-400">
                  CRITICAL COLLISION ALERT DETECTED
                </span>
                <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase">
                  {inc.severity}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 leading-tight">
                Surveillance Grid &bull; YOLOv8 Collision Verification
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <span className="bg-slate-800 text-sky-400 font-mono text-xs px-2.5 py-1 rounded-md border border-slate-700 font-bold">
              {(inc.confidence * 100).toFixed(0)}% CONF
            </span>
            <button
              onClick={closeEscalationModal}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-calm cursor-pointer"
              title="Close Alert Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable if screen is extremely small, perfectly fits normal laptop heights */}
        <div className="p-4 sm:p-5 space-y-3 sm:space-y-3.5 overflow-y-auto flex-1">
          
          {/* Incident Snapshot & Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
            
            {/* Snapshot Image with Bounding Boxes */}
            <div className="md:col-span-7 flex flex-col justify-center">
              <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-black flex items-center justify-center shadow-xs aspect-video max-h-[190px] xl:max-h-[220px] w-full">
                <img
                  src={inc.snapshotUrl}
                  alt="Accident Snapshot with Bounding Boxes"
                  className="w-full h-full object-cover"
                />
                
                {/* CV Inference HUD Stamp */}
                <div className="absolute top-2 left-2 bg-slate-900/85 backdrop-blur-sm font-mono text-[10px] text-[#0B7FF5] px-2 py-0.5 rounded border border-slate-700 flex items-center space-x-1 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-bold text-white">{inc.cameraId}</span>
                  <span className="text-slate-400">|</span>
                  <span>CV BOUNDING BOX VERIFIED</span>
                </div>

                <div className="absolute bottom-2 right-2 bg-slate-900/90 backdrop-blur-sm font-mono text-[9px] text-slate-300 px-2 py-0.5 rounded border border-slate-700 shadow">
                  CLASS: <span className="text-sky-400 font-bold">{inc.vehicleType}</span>
                </div>
              </div>
              <p className="text-[10px] font-mono text-slate-500 mt-1 flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3 text-[#0B7FF5] shrink-0" />
                <span className="truncate">AI Feed &bull; Bounding boxes and trajectory conflict vectors tracked</span>
              </p>
            </div>

            {/* Right Column: Telemetry & Vehicle Metadata */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-2 text-xs">
              <div>
                <div className="text-slate-500 font-mono uppercase text-[9px] font-bold tracking-wider">
                  Location & Sector
                </div>
                <div className="font-bold text-slate-900 text-sm flex items-start space-x-1 mt-0.5 leading-snug">
                  <MapPin className="w-4 h-4 text-[#0B7FF5] shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{inc.location}</span>
                </div>
                <div className="font-mono text-slate-500 text-[10px] mt-1 bg-white px-2 py-1 rounded border border-slate-200">
                  GPS: <span className="text-slate-800 font-bold">{inc.coordinates.lat.toFixed(4)}° N, {inc.coordinates.lng.toFixed(4)}° E</span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-200 grid grid-cols-2 gap-2 font-mono">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[9px] block font-bold">INCIDENT ID</span>
                  <span className="text-[#0B7FF5] font-bold text-xs">{inc.id}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[9px] block font-bold">IMPACT SPEED</span>
                  <span className="text-slate-900 font-bold text-xs">{inc.impactSpeed}</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-0.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-mono uppercase font-bold">Type:</span>
                  <span className="bg-blue-50 text-[#0B7FF5] font-mono px-1.5 py-0.2 rounded font-bold border border-blue-200">
                    {(inc.confidence * 100).toFixed(0)}% Conf
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-xs truncate">{inc.vehicleType}</div>
              </div>
            </div>
          </div>

          {/* 108 ERSS Live Hospital Bed Availability Card (TinyFish Web Extraction) */}
          <div className="bg-gradient-to-r from-emerald-50/80 via-blue-50/60 to-slate-50 p-3 sm:p-3.5 rounded-xl border border-emerald-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-emerald-600 text-white shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-[11px] font-bold text-slate-900 uppercase tracking-wide">
                      108 ERSS Recommended Hospital & Bed Status
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold">
                      VERIFIED BEDS
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500">
                <Sparkles className="w-3 h-3 text-[#0B7FF5] animate-pulse" />
                <span className="hidden sm:inline">TinyFish AI Web Agent</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
            </div>

            {inc.isHospitalQuerying ? (
              <div className="py-2.5 px-3 bg-white/80 rounded-lg border border-slate-200 flex items-center justify-center space-x-2 font-mono text-xs text-slate-600">
                <div className="w-3.5 h-3.5 border-2 border-[#0B7FF5] border-t-transparent rounded-full animate-spin" />
                <span>Automating live regional bed query via TinyFish API...</span>
              </div>
            ) : inc.hospitalRecommendation ? (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-emerald-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {inc.hospitalRecommendation.name}
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold border border-slate-200">
                        {inc.hospitalRecommendation.traumaLevel.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate max-w-md">
                      {inc.hospitalRecommendation.address}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="text-right font-mono text-xs">
                      <div className="flex items-center space-x-1 text-slate-900 font-bold justify-end">
                        <Navigation className="w-3 h-3 text-[#0B7FF5]" />
                        <span>{inc.hospitalRecommendation.distanceKm} km</span>
                      </div>
                      <div className="text-[9px] text-emerald-700 font-semibold flex items-center space-x-0.5 justify-end">
                        <Clock className="w-2.5 h-2.5" />
                        <span>~{inc.hospitalRecommendation.estimatedEtaMinutes} min 108 ETA</span>
                      </div>
                    </div>

                    {inc.hospitalQueryResult && inc.hospitalQueryResult.hospitals.length > 1 && (
                      <button
                        onClick={() => setShowHospitalSelector(!showHospitalSelector)}
                        className="p-1 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-calm cursor-pointer"
                        title="View other regional hospitals"
                      >
                        {showHospitalSelector ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* 3 Metric Pills: ICU, Ventilator, Trauma Ward */}
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  <div className="bg-white p-2 rounded-lg border border-emerald-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Trauma ICU Beds</span>
                      <span className="text-xs font-extrabold text-emerald-700">
                        {inc.hospitalRecommendation.beds.icuBedsAvailable} Available
                      </span>
                    </div>
                    <Bed className="w-4 h-4 text-emerald-600 opacity-80" />
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-blue-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Ventilators</span>
                      <span className="text-xs font-extrabold text-[#0B7FF5]">
                        {inc.hospitalRecommendation.beds.ventilatorBedsAvailable} Available
                      </span>
                    </div>
                    <Activity className="w-4 h-4 text-[#0B7FF5] opacity-80" />
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Trauma Ward</span>
                      <span className="text-xs font-extrabold text-slate-800">
                        {inc.hospitalRecommendation.beds.emergencyTraumaBedsAvailable} Available
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">Total {inc.hospitalRecommendation.beds.emergencyTraumaBedsTotal}</span>
                  </div>
                </div>

                {/* Expanded Alternative Hospital List */}
                {showHospitalSelector && inc.hospitalQueryResult && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 animate-in fade-in duration-100 max-h-36 overflow-y-auto">
                    <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider px-1">
                      Select Alternative Hospital Destination
                    </div>
                    {inc.hospitalQueryResult.hospitals.map((h) => {
                      const isCurrent = h.id === inc.hospitalRecommendation?.id;
                      const hasIcu = h.beds.icuBedsAvailable > 0;
                      return (
                        <div
                          key={h.id}
                          className={`p-2 rounded-md border flex items-center justify-between text-xs transition-calm ${
                            isCurrent
                              ? 'bg-emerald-50 border-emerald-300'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-900">{h.name}</span>
                              <span className="text-[9px] font-mono text-slate-500">
                                ({h.distanceKm} km &bull; ~{h.estimatedEtaMinutes}m)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] font-mono">
                              {hasIcu ? (
                                <span className="text-emerald-700 font-bold">
                                  {h.beds.icuBedsAvailable} ICU beds free
                                </span>
                              ) : (
                                <span className="text-red-600 font-bold">
                                  0 ICU beds (Diversion Risk)
                                </span>
                              )}
                              <span className="text-slate-400">|</span>
                              <span className="text-slate-600">{h.phone}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              selectIncidentHospital(inc.id, h);
                              setShowHospitalSelector(false);
                            }}
                            disabled={isCurrent}
                            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-calm cursor-pointer ${
                              isCurrent
                                ? 'bg-emerald-600 text-white cursor-default'
                                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {isCurrent ? 'Selected' : 'Assign'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-500 font-mono">
                No hospital telemetry available for this sector.
              </div>
            )}
          </div>

          {/* Item 3: Auto-Escalation Timer OR Twilio Call Interface */}
          {isAwaiting ? (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r={radius}
                      className="stroke-slate-200"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r={radius}
                      stroke="#0B7FF5"
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-mono font-extrabold text-lg text-slate-900 tracking-tighter leading-none">
                      {remaining}s
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">
                      Left
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-sans">
                    Auto-Escalation Failsafe Timer
                  </h3>
                  <p className="text-[11px] text-slate-600 max-w-md">
                    If no action is taken within <span className="font-mono text-[#0B7FF5] font-bold">{remaining} seconds</span>, NetraGridAI automatically triggers an urgent bilingual dispatch call.
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right bg-white px-3 py-2 rounded-lg border border-slate-200 shrink-0 font-mono text-xs">
                <div className="text-slate-400 text-[9px] font-bold uppercase">Automated Telephony Target</div>
                <div className="font-bold text-[#0B7FF5] text-xs">{maskedPhone}</div>
                <div className="text-[9px] text-slate-500">112 ERSS & 108 Emergency Control</div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-[#0B7FF5] animate-pulse" />
                  <span className="font-mono text-xs font-bold text-slate-900 uppercase">
                    Twilio Automated Voice Call Status
                  </span>
                  {inc.status === 'AUTO-ESCALATED' && (
                    <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold">
                      Failsafe Triggered
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#0B7FF5] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 font-bold">
                  Target: {maskedPhone}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className={`p-2 rounded-lg border transition-calm ${callState === 'queued' ? 'bg-[#0B7FF5] text-white font-bold shadow' : 'bg-white border-slate-200 text-slate-600'}`}>
                  1. Queued
                </div>
                <div className={`p-2 rounded-lg border transition-calm ${callState === 'ringing' ? 'bg-[#0B7FF5] text-white font-bold shadow' : 'bg-white border-slate-200 text-slate-600'}`}>
                  2. Ringing
                </div>
                <div className={`p-2 rounded-lg border transition-calm ${callState === 'answered' ? 'bg-[#0B7FF5] text-white font-bold shadow' : 'bg-white border-slate-200 text-slate-600'}`}>
                  3. Answered
                </div>
                <div className={`p-2 rounded-lg border transition-calm ${callState === 'completed' ? 'bg-emerald-600 text-white font-bold shadow' : 'bg-white border-slate-200 text-slate-600'}`}>
                  4. Completed
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons - Sticky footer, always visible */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Button 3a: Dismiss */}
          <button
            onClick={() => dismissIncident(inc.id)}
            className="py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-calm flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            title="The AI false flagged and no accident occurred visibly"
          >
            <X className="w-4 h-4 text-slate-500" />
            <span>DISMISS</span>
          </button>

          {/* Button 3b: Acknowledge */}
          <button
            onClick={() => acknowledgeIncident(inc.id)}
            disabled={inc.status === 'ACKNOWLEDGED'}
            className={`py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-calm flex items-center justify-center space-x-1.5 cursor-pointer ${
              inc.status === 'ACKNOWLEDGED'
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
            }`}
            title="To acknowledge that incident has taken place but due to lack of severity immediate action is not taken"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ACKNOWLEDGE</span>
          </button>

          {/* Button 3c: Dispatch Help */}
          <button
            onClick={() => dispatchIncident(inc.id, '112 ERSS & 108 CATS')}
            className="py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white transition-calm flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/25 cursor-pointer"
            title="Dispatch emergency ambulance and first responders immediately"
          >
            <PhoneCall className="w-4 h-4" />
            <span>DISPATCH HELP</span>
          </button>
        </div>

      </div>
    </div>
  );
};
