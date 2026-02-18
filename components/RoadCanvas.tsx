
import React, { useMemo } from 'react';
import { DesignConfig } from '../types';

interface RoadCanvasProps {
  config: DesignConfig;
}

export const RoadCanvas: React.FC<RoadCanvasProps> = ({ config }) => {
  const roadWidth = 1100;
  const scale = 8; // 8px = 1m

  // Engineering Parameters
  const majorAxisVal = 64; // Fixed as per IRC spec
  const rx = (majorAxisVal / 2) * scale; 
  
  const entryTaper = 20 * scale;
  const medianOpening = 20 * scale;
  
  // Lane Widths (Scaled from config)
  const l1_W = config.l1Width * scale; 
  const l2_W = config.l2Width * scale; 
  const l3_W = config.l3Width * scale; 
  
  const carriagewayW = l1_W + l2_W + l3_W; 
  const medianPx = config.medianWidth * scale; 
  const paddingY = 140; 
  
  const topRoadY = paddingY;
  const medianY = topRoadY + carriagewayW;
  const bottomRoadY = medianY + medianPx;
  const totalHeight = bottomRoadY + carriagewayW + paddingY;

  const startX = 50; 

  const geometry = useMemo(() => {
    // Top side centers (Traffic moving East: Left to Right)
    const y_top_l1 = topRoadY + (carriagewayW - l1_W / 2);
    const y_top_l2 = topRoadY + (carriagewayW - l1_W - l2_W / 2);
    const y_top_l3 = topRoadY + (l3_W / 2);

    // Bottom side centers (Traffic moving West: Right to Left)
    const y_bot_l1 = bottomRoadY + (l1_W / 2);
    const y_bot_l2 = bottomRoadY + l1_W + (l2_W / 2);
    const y_bot_l3 = bottomRoadY + l1_W + l2_W + (l3_W / 2);

    const ry_path = (y_bot_l1 - y_top_l1) / 2;

    const taperEndX = startX + entryTaper;
    const ellipseEndX = taperEndX + (rx * 2);

    const uTurnPath = `
      M -150 ${y_top_l1} 
      L ${taperEndX} ${y_top_l1} 
      A ${rx} ${ry_path} 0 0 1 ${ellipseEndX} ${y_bot_l1} 
      L -150 ${y_bot_l1}
    `.replace(/\s+/g, ' ').trim();

    const ellipseInnerCore = `
      M ${taperEndX} ${y_top_l1 + l1_W/2} 
      A ${rx - l1_W/2} ${ry_path - l1_W/2} 0 0 1 ${ellipseEndX - l1_W/2} ${y_bot_l1 - l1_W/2} 
      L ${ellipseEndX - l1_W/2} ${medianY + medianPx/2} 
      L ${taperEndX} ${medianY + medianPx/2} 
      Z
    `.replace(/\s+/g, ' ').trim();

    const topThroughL2 = `M -150 ${y_top_l2} L ${roadWidth + 150} ${y_top_l2}`;
    const topThroughL3 = `M -150 ${y_top_l3} L ${roadWidth + 150} ${y_top_l3}`;

    const botThroughL2 = `M ${roadWidth + 150} ${y_bot_l2} L -150 ${y_bot_l2}`;
    const botThroughL3 = `M ${roadWidth + 150} ${y_bot_l3} L -150 ${y_bot_l3}`;

    return { 
      uTurnPath, ellipseInnerCore, topThroughL2, topThroughL3, botThroughL2, botThroughL3,
      taperEndX, ellipseEndX,
      y_top_l3, y_top_l2, y_top_l1,
      y_bot_l1, y_bot_l2, y_bot_l3,
      medianOpeningX: taperEndX + (rx * 2 - medianOpening) / 2
    };
  }, [topRoadY, bottomRoadY, carriagewayW, l1_W, l2_W, l3_W, rx, medianY, medianPx, medianOpening]);

  const speedFactor = 60 / config.trafficSpeed;

  return (
    <div className="w-full bg-slate-950 rounded-3xl overflow-hidden relative shadow-2xl border border-slate-800 transition-all duration-500">
      {/* Top Left Status */}
      <div className="absolute top-6 left-8 z-20 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] font-black text-slate-200 uppercase tracking-widest">IRC High-Capacity Turn</span>
        </div>
        <div className="text-[9px] text-yellow-500 font-mono tracking-tighter uppercase">Barricaded L1 Protection | {config.trafficSpeed} KM/H</div>
      </div>

      {/* Compass Overlay */}
      <div className="absolute top-6 right-8 z-20 w-16 h-16 pointer-events-none flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-full border border-white/10">
        <div className="relative w-full h-full flex items-center justify-center">
            <span className="absolute -top-1 text-[8px] font-bold text-slate-400">N</span>
            <span className="absolute -bottom-1 text-[8px] font-bold text-slate-400">S</span>
            <span className="absolute -left-1 text-[8px] font-bold text-slate-400">W</span>
            <span className="absolute -right-1 text-[8px] font-bold text-slate-400">E</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-pulse">
                <path d="M12 2L14 10H10L12 2Z" fill="#ef4444" />
                <path d="M12 22L10 14H14L12 22Z" fill="#cbd5e1" />
            </svg>
        </div>
      </div>

      <svg viewBox={`0 0 ${roadWidth} ${totalHeight}`} className="w-full h-auto select-none transition-all duration-500 ease-in-out">
        <defs>
          <pattern id="hatch-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#475569" strokeWidth="1" opacity="0.4" />
          </pattern>
          <pattern id="buffer-hatch" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#fde047" strokeWidth="2" opacity="0.6" />
          </pattern>
          <pattern id="barricade-stripes" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="5" height="10" fill="#f97316" />
            <rect x="5" width="5" height="10" fill="white" />
          </pattern>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
          </marker>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#fde047" />
          </marker>
        </defs>

        <rect width={roadWidth} height={totalHeight} fill="#020617" />
        
        {/* Road Surfaces */}
        <rect x="0" y={topRoadY} width={roadWidth} height={carriagewayW} fill="#1e293b" />
        <rect x="0" y={bottomRoadY} width={roadWidth} height={carriagewayW} fill="#1e293b" />

        {/* Protection Segregation Zones */}
        <rect x="0" y={topRoadY + carriagewayW - l1_W - 4} width={roadWidth} height="4" fill="url(#buffer-hatch)" />
        <rect x="0" y={bottomRoadY + l1_W} width={roadWidth} height="4" fill="url(#buffer-hatch)" />

        {/* L1 Dedicated Lane Visuals */}
        <rect x="0" y={topRoadY + (carriagewayW - l1_W)} width={roadWidth} height={l1_W} fill="#fde047" fillOpacity="0.1" />
        <rect x="0" y={bottomRoadY} width={roadWidth} height={l1_W} fill="#fde047" fillOpacity="0.1" />

        {/* Median */}
        <g>
          <rect x="0" y={medianY} width={geometry.medianOpeningX} height={medianPx} fill="#0f172a" />
          <rect x={geometry.medianOpeningX + medianOpening} y={medianY} width={roadWidth - (geometry.medianOpeningX + medianOpening)} height={medianPx} fill="#0f172a" />
        </g>

        {/* Inner Ellipse Island Core */}
        <path d={geometry.ellipseInnerCore} fill="url(#hatch-pattern)" stroke="#334155" strokeWidth="1" opacity="0.8" />

        {/* Lane Separation Markings */}
        <g stroke="white" opacity="0.3">
          <line x1="0" y1={topRoadY + l3_W} x2={roadWidth} y2={topRoadY + l3_W} strokeDasharray="10,15" />
          <line x1="0" y1={bottomRoadY + l1_W + l2_W} x2={roadWidth} y2={bottomRoadY + l1_W + l2_W} strokeDasharray="10,15" />
        </g>
        <line x1="0" y1={topRoadY + l3_W + l2_W} x2={roadWidth} y2={topRoadY + l3_W + l2_W} stroke="#fde047" strokeWidth="3" />
        <line x1="0" y1={bottomRoadY + l1_W} x2={roadWidth} y2={bottomRoadY + l1_W} stroke="#fde047" strokeWidth="3" />

        {/* ENTRANCE BARRICADE (Nose): Preventing Westbound traffic from entering L1 */}
        <g transform={`translate(${roadWidth - 200}, ${bottomRoadY})`}>
          {/* Visual Barricade Wall */}
          <rect x="0" y="0" width="100" height={l1_W} fill="#0f172a" opacity="0.6" />
          <rect x="0" y="-4" width="8" height={l1_W + 8} fill="url(#barricade-stripes)" stroke="#f97316" strokeWidth="1" />
          <path d={`M 8 -4 L 40 ${l1_W/2} L 8 ${l1_W + 4} Z`} fill="#f97316" opacity="0.8" />
          <text x="50" y={l1_W + 20} fill="#f97316" fontSize="8" fontWeight="black" textAnchor="middle">ONCOMING ENTRY BLOCKED</text>
        </g>

        {/* Dimensions Overlays */}
        <g fill="#94a3b8" stroke="#475569" fontSize="8" fontWeight="bold">
          <line x1={startX - 20} y1={topRoadY} x2={startX - 20} y2={topRoadY + l3_W} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
          <text x={startX - 25} y={topRoadY + l3_W/2} textAnchor="end" transform={`rotate(-90, ${startX-25}, ${topRoadY + l3_W/2})`}>{config.l3Width}m</text>
          
          <line x1={startX - 20} y1={topRoadY + l3_W} x2={startX - 20} y2={topRoadY + l3_W + l2_W} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
          <text x={startX - 25} y={topRoadY + l3_W + l2_W/2} textAnchor="end" transform={`rotate(-90, ${startX-25}, ${topRoadY + l3_W + l2_W/2})`}>{config.l2Width}m</text>
          
          <line x1={startX - 20} y1={topRoadY + l3_W + l2_W} x2={startX - 20} y2={topRoadY + carriagewayW} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
          <text x={startX - 25} y={topRoadY + l3_W + l2_W + l1_W/2} textAnchor="end" transform={`rotate(-90, ${startX-25}, ${topRoadY + l3_W + l2_W + l1_W/2})`} fill="#fde047">L1: {config.l1Width}m</text>

          <line x1={startX - 20} y1={medianY} x2={startX - 20} y2={medianY + medianPx} markerStart="url(#arrow)" markerEnd="url(#arrow)" stroke="#94a3b8" />
          <text x={startX - 30} y={medianY + medianPx/2} textAnchor="middle" transform={`rotate(-90, ${startX-30}, ${medianY + medianPx/2})`} fill="#cbd5e1">MEDIAN: {config.medianWidth}m</text>

          <line x1={geometry.taperEndX} y1={topRoadY - 40} x2={geometry.ellipseEndX} y2={topRoadY - 40} markerStart="url(#arrow-active)" markerEnd="url(#arrow-active)" stroke="#fde047" strokeWidth="2" />
          <text x={geometry.taperEndX + rx} y={topRoadY - 50} textAnchor="middle" className="font-black" fill="#fde047">64m MAJOR AXIS</text>
        </g>

        {/* Traffic Movement Animations */}
        <g>
           <animateMotion dur={`${4 * speedFactor}s`} repeatCount="indefinite" rotate="auto" path={geometry.topThroughL3} />
           <rect x="-15" y="-8" width="30" height="16" fill="#cbd5e1" rx="4" />
        </g>
        <g>
           <animateMotion dur={`${5 * speedFactor}s`} repeatCount="indefinite" rotate="auto" path={geometry.topThroughL2} begin="1s" />
           <rect x="-15" y="-8" width="30" height="16" fill="#94a3b8" rx="4" />
        </g>

        {/* U-Turning Vehicle */}
        <g>
          <animateMotion dur={`${12 * speedFactor}s`} repeatCount="indefinite" rotate="auto" path={geometry.uTurnPath} calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          <rect x="-48" y="-10" width="96" height="20" fill="#60a5fa" rx="4" className="filter drop-shadow-[0_0_12px_rgba(96,165,250,0.6)]" />
          <text y="-20" textAnchor="middle" fill="#fde047" fontSize="9" fontWeight="black">BUS (EXITING U-TURN)</text>
        </g>

        {/* Path Indicator */}
        <path d={geometry.uTurnPath} fill="none" stroke="#fde047" strokeWidth="2" strokeDasharray="5,10" opacity="0.3" />
      </svg>
      
      {/* Legend & Direction Hints */}
      <div className="absolute bottom-6 left-8 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col gap-2 pointer-events-none">
         <div className="flex items-center gap-3">
            <div className="w-6 h-1 bg-yellow-400"></div>
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Top Road: Eastbound (L→R)</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-6 h-1 bg-slate-500"></div>
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Bottom Road: Westbound (R→L)</span>
         </div>
      </div>
      
      <div className="absolute bottom-6 right-8 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col gap-2 pointer-events-none">
         <div className="flex items-center gap-3">
            <div className="w-6 h-3 bg-orange-600 rounded-sm"></div>
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Entry Control Barricade</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-6 h-1 bg-yellow-400"></div>
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">L1 Reserved Canal</span>
         </div>
      </div>
    </div>
  );
};
