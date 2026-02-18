
import React, { useState, useEffect } from 'react';
import { 
  Settings2, 
  ShieldCheck, 
  FileText, 
  Loader2, 
  Video, 
  Key, 
  ArrowRightLeft,
  ShieldAlert,
  TrendingUp,
  Construction,
  LayoutGrid,
  Zap
} from 'lucide-react';
import { DesignType, DesignConfig, TrafficStats } from './types';
import { RoadCanvas } from './components/RoadCanvas';
import { generateTrafficProposal, generateUturnVideo } from './services/geminiService';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [config, setConfig] = useState<DesignConfig>({
    laneWidth: 3.5,
    medianWidth: 2.0, 
    trafficSpeed: 60, 
    uTurnType: DesignType.MEDIAN_POCKET
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [proposal, setProposal] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const [stats, setStats] = useState<TrafficStats>({
    throughput: 5800, 
    safetyScore: 99.8, 
    costEstimate: "₹8.2Cr - ₹11.5Cr"
  });

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    setProposal(null);
    const result = await generateTrafficProposal(config);
    setProposal(result);
    setIsGenerating(false);
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleGenerateVideo = async () => {
    if (!hasApiKey) await handleSelectKey();
    setIsVideoGenerating(true);
    try {
      await generateUturnVideo(config);
    } catch (error: any) {
      if (error.message?.includes("Requested entity was not found")) setHasApiKey(false);
    } finally {
      setIsVideoGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-slate-950 text-white p-5 shadow-2xl border-b border-white/5 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-600 p-3 rounded-2xl shadow-lg shadow-yellow-500/20">
              <Zap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
                UrbanTurn <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded-lg uppercase tracking-widest">Express Protection</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Segregated 8-Lane Non-Obstructive Flow</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!hasApiKey ? (
              <button onClick={handleSelectKey} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-xl">
                <Key size={14} /> Unlock Simulation
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-black border border-emerald-500/20">
                <ShieldCheck size={14} /> Through-Lane Validated
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 lg:p-8 space-y-8 max-w-7xl">
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
              <ShieldAlert className="text-red-500" size={24} />
              7m Segregated U-Turn Canal
            </h2>
            <div className="flex gap-2">
              <span className="bg-red-100 text-red-700 text-[10px] font-black px-3 py-1.5 rounded-full border border-red-200 uppercase tracking-widest">No Obstruction</span>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1.5 rounded-full border border-blue-200 uppercase tracking-widest">L2/L3 Express Flow</span>
            </div>
          </div>
          <div className="shadow-2xl rounded-[2.5rem] overflow-hidden bg-slate-900 border-4 border-white">
            <RoadCanvas config={config} />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-5">
              <Settings2 size={18} className="text-yellow-600" />
              <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Anti-Obstruction Protocol</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">U-Turn Canal</span>
                   <span className="text-xl font-black text-yellow-600">7.0m Width</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Through Lanes</span>
                   <span className="text-xl font-black text-blue-600">Protected</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Divider Type</span>
                   <span className="text-xl font-black text-slate-900 text-red-500">Solid Curb</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">PCU Impact</span>
                   <span className="text-xl font-black text-slate-900">Zero</span>
                </div>
              </div>

              <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Construction className="text-red-600" size={18} /></div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-800 uppercase mb-1">Enforced Segregation</h4>
                    <p className="text-[11px] text-slate-500">The 7m L1 zone acts as a dedicated canal. A solid yellow divider prevents U-turning vehicles from swinging into L2 or L3 lanes.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button onClick={handleGenerateProposal} disabled={isGenerating} className="bg-slate-900 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all">
                  {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                  GET PROPOSAL
                </button>
                <button onClick={handleGenerateVideo} disabled={isVideoGenerating} className="bg-yellow-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-yellow-700 active:scale-[0.98] transition-all shadow-xl shadow-yellow-600/20">
                  {isVideoGenerating ? <Loader2 className="animate-spin" size={16} /> : <Video size={16} />}
                  3D VIEW
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center border-b-4 border-b-blue-500">
                <TrendingUp className="text-blue-500 mb-2" size={24} />
                <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Express Speed</span>
                <span className="text-2xl font-black text-slate-900">60+ <span className="text-xs font-medium text-slate-400">km/h</span></span>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center border-b-4 border-b-emerald-500">
                <ShieldCheck className="text-yellow-500 mb-2" size={24} />
                <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Isolation Score</span>
                <span className="text-2xl font-black text-emerald-500">100%</span>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center border-b-4 border-b-red-500">
                <ArrowRightLeft className="text-blue-500 mb-2" size={24} />
                <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Conflict Zone</span>
                <span className="text-2xl font-black text-red-500">NONE</span>
              </div>
            </div>

            {proposal && (
              <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="p-1 bg-red-700 flex items-center justify-between px-8 py-3">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Flow Integrity Analysis [v10.0]</span>
                  <Construction className="text-white/50" size={14} />
                </div>
                <div className="p-10 prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium text-lg">
                    {proposal}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-auto py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-t border-slate-200">
        UrbanTurn High-Capacity Suite &copy; 2025 | Zero-Obstruction Protocol
      </footer>
    </div>
  );
};

export default App;
