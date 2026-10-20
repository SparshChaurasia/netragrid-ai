import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, CheckCircle2, PhoneCall, ExternalLink, X, Building2 } from 'lucide-react';
import type { Incident } from '../../types';
import { useApp } from '../../context/AppContext';

interface IncidentCardProps {
  incident: Incident;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident }) => {
  const navigate = useNavigate();
  const { openEscalationModal, dismissIncident, acknowledgeIncident, dispatchIncident } = useApp();

  const getStatusBadge = () => {
    switch (incident.status) {
      case 'AWAITING':
      case 'DETECTED':
        return (
          <span className="bg-blue-100 text-[#0B7FF5] border border-blue-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0B7FF5] animate-pulse" />
            <span>AWAITING ({incident.remainingSeconds}s)</span>
          </span>
        );
      case 'DISMISSED':
        return (
          <span className="bg-slate-100 text-slate-500 border border-slate-200 font-mono text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center space-x-1">
            <X className="w-3 h-3 text-slate-400" />
            <span>DISMISSED</span>
          </span>
        );
      case 'ACKNOWLEDGED':
        return (
          <span className="bg-indigo-600 text-white border border-indigo-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-white" />
            <span>ACKNOWLEDGED</span>
          </span>
        );
      case 'AUTO-ESCALATED':
      case 'DISPATCHED':
      case 'CALLING':
        return (
          <span className="bg-emerald-600 text-white border border-emerald-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 shadow-xs">
            <PhoneCall className="w-3 h-3 text-white" />
            <span>DISPATCHED</span>
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-600 border border-slate-200 font-mono text-[10px] font-medium px-2 py-0.5 rounded-md">
            {incident.status}
          </span>
        );
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-calm space-y-3 font-sans ${
        incident.status === 'AWAITING' || incident.status === 'DETECTED'
          ? 'bg-white border-[#0B7FF5] shadow-md shadow-blue-500/10'
          : incident.status === 'DISPATCHED' || incident.status === 'AUTO-ESCALATED'
          ? 'bg-emerald-50/20 border-emerald-300 shadow-xs'
          : incident.status === 'ACKNOWLEDGED'
          ? 'bg-indigo-50/15 border-indigo-200 shadow-xs'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 font-mono">
          <span className="text-xs font-bold text-slate-900 tracking-wide">{incident.id}</span>
          <span className="text-[10px] bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-md font-bold">
            {incident.severity}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="flex space-x-3">
        <div
          onClick={() => openEscalationModal(incident)}
          className="relative w-24 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 cursor-pointer group bg-slate-900"
        >
          <img src={incident.snapshotUrl} alt="Snapshot" className="w-full h-full object-cover group-hover:scale-105 transition-calm opacity-90" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-calm">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="space-y-1 text-xs flex-1">
          <div className="font-bold text-slate-900 line-clamp-1">{incident.cameraName}</div>
          <div className="text-slate-500 flex items-center space-x-1 text-[11px] line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-[#0B7FF5] shrink-0" />
            <span>{incident.location}</span>
          </div>
          <div className="text-slate-400 flex items-center space-x-1 text-[10px] font-mono">
            <Clock className="w-3 h-3 text-[#0B7FF5]" />
            <span>{new Date(incident.detectedAt).toLocaleTimeString()}</span>
          </div>
          {incident.hospitalRecommendation && (
            <div className="flex items-center space-x-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1">
              <Building2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate font-semibold">{incident.hospitalRecommendation.name} ({incident.hospitalRecommendation.beds.icuBedsAvailable} ICU free)</span>
            </div>
          )}
        </div>
      </div>

      {/* Requirement B.3: The 3 Required Action Buttons on every incident card */}
      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 font-mono text-[11px]">
        {/* Button 3a: Dismiss */}
        <button
          onClick={() => dismissIncident(incident.id)}
          disabled={incident.status === 'DISMISSED'}
          className={`py-1.5 px-2 rounded-lg font-bold transition-calm text-center ${
            incident.status === 'DISMISSED'
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
          }`}
          title="The AI false flagged and no accident occurred visibly"
        >
          Dismiss
        </button>

        {/* Button 3b: Acknowledge */}
        <button
          onClick={() => acknowledgeIncident(incident.id)}
          disabled={incident.status === 'ACKNOWLEDGED'}
          className={`py-1.5 px-2 rounded-lg font-bold transition-calm text-center ${
            incident.status === 'ACKNOWLEDGED'
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-300'
          }`}
          title="To acknowledge that incident has taken place but due to lack of severity immediate action is not taken"
        >
          Ack
        </button>

        {/* Button 3c: Dispatch */}
        <button
          onClick={() => dispatchIncident(incident.id)}
          className="py-1.5 px-2 rounded-lg font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-calm text-center shadow-xs"
          title="Dispatch help"
        >
          Dispatch
        </button>
      </div>

      <div className="text-right">
        <button
          onClick={() => navigate(`/incidents/${incident.id}`)}
          className="text-[11px] font-mono text-[#0B7FF5] hover:underline"
        >
          View Incident Timeline &rarr;
        </button>
      </div>
    </div>
  );
};
