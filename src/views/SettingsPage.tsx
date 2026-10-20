import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Phone, Save, CheckCircle2, Sliders, Sparkles, Eye, EyeOff, Play } from 'lucide-react';
import { queryRegionalHospitalBeds } from '../lib/tinyfish';

export const SettingsPage: React.FC = () => {
  const {
    systemConfig,
    updateConfig,
    phoneOverride,
    setPhoneOverride,
    tinyfishApiKey,
    setTinyfishApiKey,
    minIcuBedsRequired,
    setMinIcuBedsRequired,
  } = useApp();

  const [escalationSeconds, setEscalationSeconds] = useState<number>(systemConfig.escalationSeconds);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(systemConfig.confidenceThreshold * 100);
  const [language, setLanguage] = useState<'bilingual' | 'hindi' | 'english'>(systemConfig.language);
  const [phoneInput, setPhoneInput] = useState<string>(phoneOverride);
  const [apiKeyInput, setApiKeyInput] = useState<string>(tinyfishApiKey);
  const [minIcuInput, setMinIcuInput] = useState<number>(minIcuBedsRequired);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // TinyFish live test state
  const [isTestingTinyfish, setIsTestingTinyfish] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Requirement A.12: Page window title formula
  useEffect(() => {
    document.title = 'Settings | NetraGridAI';
  }, []);

  const handleTestTinyfish = async () => {
    setIsTestingTinyfish(true);
    setTestResult(null);
    try {
      const result = await queryRegionalHospitalBeds(
        { lat: 28.4595, lng: 77.0266 },
        'Gurugram NH-48 Express Corridor (Test Query)',
        { apiKey: apiKeyInput, minIcuBedsRequired: minIcuInput }
      );
      setTestResult(
        `✓ [${result.provider}] Extraction successful: ${result.hospitals.length} regional hospitals checked. Recommended: ${result.recommendedHospital?.name} (${result.recommendedHospital?.beds.icuBedsAvailable} ICU beds free, ${result.recommendedHospital?.distanceKm} km, ~${result.recommendedHospital?.estimatedEtaMinutes}m ETA).`
      );
    } catch (err: any) {
      setTestResult(`✗ Query failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsTestingTinyfish(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      escalationSeconds,
      confidenceThreshold: confidenceThreshold / 100,
      language,
    });
    setPhoneOverride(phoneInput);
    setTinyfishApiKey(apiKeyInput.trim());
    setMinIcuBedsRequired(minIcuInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1200px] mx-auto font-sans">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#0B7FF5]" />
            <span>Emergency Escalation & Telephony Settings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure server-authoritative escalation deadlines, YOLO confidence gates, and Twilio responder trunks.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <h2 className="font-bold text-base text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-amber-500" />
            <span>Escalation Rules & Confidence Thresholds</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-600 uppercase font-bold flex justify-between">
                <span>Escalation Timeout (Seconds)</span>
                <span className="text-[#0B7FF5] font-extrabold">{escalationSeconds} seconds</span>
              </label>
              <input
                type="range"
                min="5"
                max="60"
                value={escalationSeconds}
                onChange={(e) => setEscalationSeconds(Number(e.target.value))}
                className="w-full accent-[#0B7FF5]"
              />
              <p className="text-[11px] text-slate-400">
                Operator response window before server places automated Hindi/English phone call. Default: 15s.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-600 uppercase font-bold flex justify-between">
                <span>YOLOv8 Minimum Confidence Gate</span>
                <span className="text-[#0B7FF5] font-extrabold">{confidenceThreshold}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-[#0B7FF5]"
              />
              <p className="text-[11px] text-slate-400">
                Confidence gate required before raising collision alert. Default: 85%.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <h2 className="font-bold text-base text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Phone className="w-5 h-5 text-emerald-600" />
            <span>Voice Language & Responders</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-600 uppercase font-bold">
                TwiML Voice Language Protocol
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg p-2.5 font-mono focus:outline-none font-semibold"
              >
                <option value="bilingual">Bilingual (Hindi + English Consecutive)</option>
                <option value="hindi">Hindi Only (हिन्दी)</option>
                <option value="english">English Only</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-600 uppercase font-bold">
                Default E.164 Responder Trunk
              </label>
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg p-2.5 font-mono focus:outline-none font-semibold"
              />
            </div>
          </div>
        </div>

        {/* TinyFish AI Web Extraction & Live Hospital Bed Routing Configuration */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-base text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#0B7FF5]" />
              <span>TinyFish Live Regional Hospital Bed Query API</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
              AI Web Extraction Agent
            </span>
          </div>

          <p className="text-xs text-slate-500">
            NetraGridAI automatically uses TinyFish to query regional government and private hospital dashboards (e.g. Delhi State Health, Haryana Civil Hospitals) upon collision detection to extract live trauma ICU & ventilator bed availability for 108 ambulance routing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-600 uppercase font-bold flex justify-between">
                <span>TinyFish API Key</span>
                <span className="text-slate-400 font-normal">Optional (Default: Regional Telemetry)</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="tf_live_..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg p-2.5 pr-10 font-mono focus:outline-none font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Obtain key from <a href="https://agent.tinyfish.ai/api-keys" target="_blank" rel="noreferrer" className="text-[#0B7FF5] underline">agent.tinyfish.ai</a>. If blank, high-fidelity dynamic regional telemetry is utilized.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-600 uppercase font-bold flex justify-between">
                <span>Minimum Trauma ICU Beds Required for 108 Routing</span>
                <span className="text-emerald-700 font-bold">{minIcuInput} ICU Bed{minIcuInput > 1 ? 's' : ''}</span>
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={minIcuInput}
                onChange={(e) => setMinIcuInput(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-[11px] text-slate-400">
                Hospitals with fewer available ICU beds will trigger automatic diversion warnings and secondary recommendation.
              </p>
            </div>
          </div>

          {/* Test Live Query Button & Output */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestTinyfish}
              disabled={isTestingTinyfish}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-mono rounded-lg transition-calm flex items-center space-x-1.5 cursor-pointer"
            >
              {isTestingTinyfish ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#0B7FF5] border-t-transparent rounded-full animate-spin" />
                  <span>Querying Live Health Portals...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#0B7FF5]" />
                  <span>Test TinyFish Regional Query (Gurugram NH-48)</span>
                </>
              )}
            </button>

            {testResult && (
              <div className="text-[11px] font-mono text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 max-w-xl">
                {testResult}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          {savedSuccess ? (
            <div className="text-xs text-emerald-600 font-mono font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings updated successfully!</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Changes apply immediately across dispatch system.</span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0B7FF5] text-white font-bold text-xs rounded-lg hover:bg-blue-600 transition-calm flex items-center space-x-2 shadow-md shadow-blue-500/20"
          >
            <Save className="w-4 h-4" />
            <span>SAVE DISPATCH CONFIGURATION</span>
          </button>
        </div>
      </form>
    </div>
  );
};
