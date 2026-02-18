
import React, { useMemo } from 'react';
import { DesignConfig } from '../types';

interface RoadCanvasProps {
  config: DesignConfig;
}

export const RoadCanvas: React.FC<RoadCanvasProps> = ({ config }) => {
  const roadWidth = 1100;
  const scale = 8; // 8px = 1m

  // Engineering Parameters
  const majorAxisVal = 64; // 64m length
  const minorAxisVal = 28; // 28m depth (theoretical footprint)
  
  const rx = (majorAxisVal / 2) * scale; 
  // To keep it non-obstructive, the vertical radius MUST fit within the two L1 lanes and the median.
  // We'll calculate the actual distance between L1 centers for the path.
  
  const entryTaper = 20 * scale;
  const medianOpening = 20 * scale;
  
  // Lane Widths (3 Lanes per side)
  const l1_W = 7.0 * scale; // Clubbed Reserved U-Turn Lane (Extra wide for heavy vehicles)
  const l2_W = 3.5 * scale; // Through Traffic
  const l3_W = 3.5 * scale; // Through Traffic
  
  const carriagewayW = l1_W + l2_W + l3_W; 
  const medianPx = 2.0 * scale; 
  const paddingY = 120;
  
  const topRoadY = paddingY;
  const medianY = topRoadY + carriagewayW;
  const bottomRoadY = medianY + medianPx;
  const totalHeight = bottomRoadY + carriagewayW + paddingY;

  const startX = 50; 

  const geometry = useMemo(() => {
    // Lane centers (Top side - L1 is closest to median)
    const y_top_l1 = topRoadY + (carriagewayW - l1_W / 2);
    const y_top_l2 = topRoadY + (carriagewayW - l1_W - l2_W / 2);
    const y_top_l3 = topRoadY + (l3_W / 2);

    // Bottom side centers (L1 is closest to median)
    const y_bot_l1 = bottomRoadY + (l1_W / 2);
    const y_bot_l2 = bottomRoadY + l1_W + (l2_W / 2);
    const y_bot_l3 = bottomRoadY + l1_W + l2_W + (l3_W / 2);

    const ry_path = (y_bot_l1 - y_top_l1) / 2;

    const taperEndX = startX + entryTaper;
    const ellipseEndX = taperEndX + (rx * 2);

    // FIXED U-TURN PATH: Continuous flow without the jump.
    // Approach -> Taper -> Semi-Ellipse -> Exit
    const uTurnPath = `
      M -100 ${y_top_l1} 
      L ${taperEndX} ${y_top_l1} 
      A ${rx} ${ry_path} 0 0 1 ${ellipseEndX} ${y_bot_l1} 
      L -100 ${y_bot_l1}
    `.replace(/\s+/g, ' ').trim();

    // Geometry for the Shaded Inner Eclipse Island (The core area)
    const ellipseInnerCore = `
      M ${taperEndX} ${y_top_l1 + l1_W/2} 
      A ${rx - l1_W/2} ${ry_path - l1_W/2} 0 0 1 ${ellipseEndX - l1_W/2} ${y_bot_l1 - l1_W/2} 
      L ${ellipseEndX - l1_W/2} ${medianY + medianPx/2} 
      L ${taperEndX} ${medianY + medianPx/2} 
      Z
    `.replace(/\s+/g, ' ').trim();

    const topThroughL2 = `M -100 ${y_top_l2} L ${roadWidth + 100} ${y_top_l2}`;
    const topThroughL3 = `M -100 ${y_top_l3} L ${roadWidth + 100} ${y_top_l3}`;

    return { 
      uTurnPath, ellipseInnerCore, topThroughL2, topThroughL3,
      taperEndX, ellipseEndX,
      y_top_l3, y_top_l2, y_top_l1,
      y_bot_l1, y_bot_l2, y_bot_l3,
      medianOpeningX: taperEndX + (rx * 2 - medianOpening) / 2
    };
  }, [medianY, bottomRoadY, rx]);

  return (
    <div className="w-full bg-slate-950 rounded-3xl overflow-hidden relative shadow-2xl border border-slate-800">
      <div className="absolute top-6 left-8 z-20 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] font-black text-slate-200 uppercase tracking-widest">IRC Segregated Corridor</span>
        </div>
        <div className="text-[9px] text-yellow-500 font-mono tracking-tighter uppercase">Fixed L1 Trajectory | Zero Express Encroachment</div>
      </div>

      <svg viewBox={`0 0 ${roadWidth} ${totalHeight}`} className="w-full h-auto select-none">
        <defs>
          <pattern id="hatch-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#475569" strokeWidth="1" opacity="0.4" />
          </pattern>
          <pattern id="buffer-hatch" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#fde047" strokeWidth="2" opacity="0.6" />
          </pattern>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
          </marker>
        </defs>

        <rect width={roadWidth} height={totalHeight} fill="#020617" />
        
        {/* Road Surfaces - Main Asphalt */}
        <rect x="0" y={topRoadY} width={roadWidth} height={carriagewayW} fill="#1e293b" />
        <rect x="0" y={bottomRoadY} width={roadWidth} height={carriagewayW} fill="#1e293b" />

        {/* PROTECTED ZONE: Buffer between L1 and L2 */}
        <rect x="0" y={topRoadY + carriagewayW - l1_W - 4} width={roadWidth} height="4" fill="url(#buffer-hatch)" />
        <rect x="0" y={bottomRoadY + l1_W} width={roadWidth} height="4" fill="url(#buffer-hatch)" />

        {/* Painted U-Turn Road (L1 Surface) */}
        <rect x="0" y={topRoadY + (carriagewayW - l1_W)} width={roadWidth} height={l1_W} fill="#fde047" fillOpacity="0.1" />
        <rect x="0" y={bottomRoadY} width={roadWidth} height={l1_W} fill="#fde047" fillOpacity="0.1" />

        {/* Median */}
        <g>
          <rect x="0" y={medianY} width={geometry.medianOpeningX} height={medianPx} fill="#0f172a" />
          <rect x={geometry.medianOpeningX + medianOpening} y={medianY} width={roadWidth - (geometry.medianOpeningX + medianOpening)} height={medianPx} fill="#0f172a" />
        </g>

        {/* Shaded Inner Eclipse Part (The "Island" Core) */}
        <path d={geometry.ellipseInnerCore} fill="url(#hatch-pattern)" stroke="#334155" strokeWidth="1" opacity="0.8" />

        {/* Lane Markings */}
        <g stroke="white">
          <line x1="0" y1={topRoadY + l3_W} x2={roadWidth} y2={topRoadY + l3_W} strokeDasharray="10,15" opacity="0.3" />
          <line x1="0" y1={topRoadY + l3_W + l2_W} x2={roadWidth} y2={topRoadY + l3_W + l2_W} stroke="#fde047" strokeWidth="3" />
          
          <line x1="0" y1={bottomRoadY + l1_W} x2={roadWidth} y2={bottomRoadY + l1_W} stroke="#fde047" strokeWidth="3" />
          <line x1="0" y1={bottomRoadY + l1_W + l2_W} x2={roadWidth} y2={bottomRoadY + l1_W + l2_W} strokeDasharray="10,15" opacity="0.3" />
        </g>

        {/* Lane Labels */}
        <g fill="#94a3b8" fontSize="8" fontWeight="bold">
          <text x="10" y={geometry.y_top_l3 + 3}>L3 EXPRESS (3.5m)</text>
          <text x="10" y={geometry.y_top_l2 + 3}>L2 EXPRESS (3.5m)</text>
          <text x="10" y={geometry.y_top_l1 + 3} fill="#fde047">L1 U-TURN (7m)</text>
          <text x="10" y={geometry.y_bot_l1 + 3} fill="#fde047">L1 EXIT (7m)</text>
        </g>

        {/* Dimension Lines */}
        <g fill="#64748b" stroke="#475569" fontSize="9">
          <line x1={geometry.taperEndX} y1={paddingY - 50} x2={geometry.ellipseEndX} y2={paddingY - 50} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
          <text x={geometry.taperEndX + rx} y={paddingY - 60} textAnchor="middle" className="font-black">64m MAJOR AXIS CORRIDOR</text>
        </g>

        {/* Through Traffic */}
        <g>
           <animateMotion dur="4s" repeatCount="indefinite" rotate="auto" path={geometry.topThroughL3} />
           <rect x="-15" y="-8" width="30" height="16" fill="#cbd5e1" rx="2" />
        </g>
        <g>
           <animateMotion dur="5s" repeatCount="indefinite" rotate="auto" path={geometry.topThroughL2} begin="1s" />
           <rect x="-15" y="-8" width="30" height="16" fill="#94a3b8" rx="2" />
        </g>

        {/* U-Turning Vehicles (Blue Bus) - Strictly in L1 */}
        <g>
          <animateMotion dur="14s" repeatCount="indefinite" rotate="auto" path={geometry.uTurnPath} />
          <rect x="-48" y="-10" width="96" height="20" fill="#60a5fa" rx="4" className="filter drop-shadow-[0_0_12px_rgba(96,165,250,0.6)]" />
          <text y="-20" textAnchor="middle" fill="#fde047" fontSize="9" fontWeight="black">BUS (STAYS IN L1)</text>
        </g>

        {/* Path Indicator */}
        <path d={geometry.uTurnPath} fill="none" stroke="#fde047" strokeWidth="2" strokeDasharray="5,10" opacity="0.4" />
      </svg>
      
      <div className="absolute bottom-6 right-8 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
         <div className="flex items-center gap-3">
            <div className="w-4 h-1 bg-yellow-400"></div>
            <span className="text-[10px] font-bold text-white uppercase">Solid Protection Line</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-4 h-3 bg-emerald-500/50"></div>
            <span className="text-[10px] font-bold text-white uppercase">Zero Encroachment Zone</span>
         </div>
      </div>
    </div>
  );
};
