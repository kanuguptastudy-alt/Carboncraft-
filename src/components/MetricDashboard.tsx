/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { CarbonBreakdown, Challenge, UserChallengeState } from "../types";
import { getComparativeAnalysis } from "../utils/calculator";
import { Flame, Zap, Car, Utensils, Trash2, TrendingDown } from "lucide-react";

interface MetricDashboardProps {
  breakdown: CarbonBreakdown;
  userChallenges: UserChallengeState[];
  challengesList: Challenge[];
}

export function MetricDashboard({ breakdown, userChallenges, challengesList }: MetricDashboardProps) {
  const analysis = useMemo(() => getComparativeAnalysis(breakdown.total), [breakdown.total]);

  // Calculate pledged annual CO2 offsets
  const totalOffsetKg = useMemo(() => {
    let sum = 0;
    userChallenges.forEach((uc) => {
      if (uc.status === "completed" || uc.status === "committed") {
        const challenge = challengesList.find((c) => c.id === uc.challengeId);
        if (challenge) {
          sum += challenge.annualSavingsKg;
        }
      }
    });
    return sum;
  }, [userChallenges, challengesList]);

  const offsetTonnes = Number((totalOffsetKg / 1000).toFixed(2));
  const potentialRemainingFootprint = Math.max(0.1, Number((breakdown.total - offsetTonnes).toFixed(2)));

  // Gauge constants
  const gaugePercent = Math.min(100, Math.max(5, (breakdown.total / 18) * 100)); // normalized up to 18 tonnes
  const circumference = 2 * Math.PI * 50; // radius = 50, circum ~314
  const strokeDashoffset = circumference - (gaugePercent / 100) * circumference;

  // Let's identify the largest component
  const largestCategory = useMemo(() => {
    const keys = ["transport", "energy", "food", "waste"] as const;
    let maxKey: typeof keys[number] = "transport";
    let maxVal = breakdown.transport;

    keys.forEach((k) => {
      if (breakdown[k] > maxVal) {
        maxVal = breakdown[k];
        maxKey = k;
      }
    });

    return { category: maxKey, amount: maxVal };
  }, [breakdown]);

  // Generate SVG coordinates for dynamic path trend line
  const forecastCoords = useMemo(() => {
    // We will show a line from current footprint to reduced footprint
    // 5 steps: Initial, Step 1, Step 2, Step 3, Target
    const stepsCount = 5;
    const initial = breakdown.total;
    const offsetStep = offsetTonnes / (stepsCount - 1);
    
    const points: { x: number; y: number; val: number }[] = [];
    for (let i = 0; i < stepsCount; i++) {
      const val = Math.max(0.2, initial - i * offsetStep);
      const x = i * 80 + 30; // 30 to 350
      // Map 0 to 20 tonnes to 150 to 20 height on SVG
      const y = 150 - (val / 20) * 130;
      points.push({ x, y, val });
    }
    return points;
  }, [breakdown.total, offsetTonnes]);

  const rawLinePath = forecastCoords.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="space-y-6" id="metric-dashboard">
      {/* Overview Card */}
      <div className="bg-white rounded-3xl border border-emerald-50 shadow-md p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center" id="dashboard-hero">
        
        {/* Left: Interactive Radial Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4" id="circular-gauge-container">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* SVG Circle Track */}
            <svg className="w-full h-full transform -rotate-95">
              {/* Outer light track */}
              <circle
                cx="96"
                cy="96"
                r="74"
                className="stroke-slate-100 fill-none"
                strokeWidth="10"
              />
              {/* Colored active stroke */}
              <circle
                cx="96"
                cy="96"
                r="74"
                className="fill-none transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="465"
                strokeDashoffset={465 - (Math.min(100, Math.max(5, (breakdown.total / 18) * 100)) / 100) * 465}
                stroke={
                  breakdown.total <= 2.0
                    ? "#10b981" // emerald
                    : breakdown.total <= 4.5
                    ? "#14b8a6" // teal
                    : breakdown.total <= 10.0
                    ? "#f59e0b" // amber
                    : "#f43f5e" // rose
                }
              />
            </svg>
            
            {/* Inner text content */}
            <div className="absolute text-center flex flex-col justify-center items-center">
              <span className="text-4xl lg:text-5xl font-sans font-bold tracking-tight text-slate-800">
                {breakdown.total}
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-1">
                tonnes CO₂e/yr
              </span>
            </div>
          </div>
          
          <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-semibold ${analysis.badgeClass}`}>
            {analysis.rating}
          </div>
        </div>

        {/* Right: Comparative Analysis & Summary */}
        <div className="md:col-span-7 space-y-4" id="comparison-details">
          <div className="space-y-1">
            <h2 className="text-sm font-mono uppercase tracking-wider text-emerald-600 font-bold">Your Climate Analysis</h2>
            <p className="text-2xl font-sans font-bold tracking-tight text-slate-800">How you influence global health</p>
          </div>
          
          <p className="text-slate-600 text-sm leading-relaxed border-l-4 border-emerald-500 pl-4 py-1">
            {analysis.comparisonText}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
              <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Paris Target</div>
              <div className="text-lg font-sans font-bold text-emerald-600">≤ 2.0 t</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Carbon neutral limit</div>
            </div>
            <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
              <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">World Average</div>
              <div className="text-lg font-sans font-bold text-slate-600">~ 4.5 t</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Global per-capita rate</div>
            </div>
            <div className="col-span-2 md:col-span-1 bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
              <div className="text-[10px] font-mono tracking-wider text-emerald-700 uppercase font-semibold">Active Offsets</div>
              <div className="text-lg font-sans font-bold text-emerald-800">
                -{offsetTonnes} t
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">{userChallenges.filter(u => u.status === 'committed' || u.status === 'completed').length} challenge paths</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Category Breakdown vs reduction trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-bento">
        
        {/* Category Breakdown Bars */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-emerald-50 p-6 shadow-sm space-y-6" id="category-breakdown-card">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <div>
              <h3 className="text-base font-sans font-semibold text-slate-800">Sector Breakdown</h3>
              <p className="text-xs text-slate-400">Review emissions by consumption category</p>
            </div>
            {largestCategory.amount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-mono bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-full font-semibold">
                <Flame size={12} className="animate-pulse" /> Largest: {largestCategory.category}
              </span>
            )}
          </div>

          <div className="space-y-4" id="metric-bars-group">
            {/* Direct Transport Bar */}
            <div className="space-y-1.5" id="sector-transport">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5"><Car size={14} className="text-blue-500" /> Transportation</span>
                <span className="font-mono text-slate-500">{breakdown.transport} tCO₂e</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, (breakdown.transport / breakdown.total || 0) * 100))}%` }}
                />
              </div>
            </div>

            {/* Direct energy Bar */}
            <div className="space-y-1.5" id="sector-energy">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5"><Zap size={14} className="text-amber-500" /> Utility & Heating</span>
                <span className="font-mono text-slate-500">{breakdown.energy} tCO₂e</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-700" 
                  style={{ width: `${Math.min(100, Math.max(0, (breakdown.energy / breakdown.total || 0) * 100))}%` }}
                />
              </div>
            </div>

            {/* Direct food Bar */}
            <div className="space-y-1.5" id="sector-food">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5"><Utensils size={14} className="text-emerald-500" /> Diet & Food</span>
                <span className="font-mono text-slate-500">{breakdown.food} tCO₂e</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                  style={{ width: `${Math.min(100, Math.max(0, (breakdown.food / breakdown.total || 0) * 100))}%` }}
                />
              </div>
            </div>

            {/* Direct trash/recycling bar */}
            <div className="space-y-1.5" id="sector-waste">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5"><Trash2 size={14} className="text-purple-500" /> Trash & Consumer Goods</span>
                <span className="font-mono text-slate-500">{breakdown.waste} tCO₂e</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-700" 
                  style={{ width: `${Math.min(100, Math.max(0, (breakdown.waste / breakdown.total || 0) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/40 rounded-xl p-4 text-xs text-emerald-800 leading-relaxed border border-emerald-100/60" id="calculator-hint-box">
            <span className="font-bold block mb-0.5">💡 Sustainable Strategy:</span>
            Your highest emission sector is <span className="font-bold underline">{largestCategory.category}</span>. Adjusting preferences in this section (e.g. carpooling, eating less meat, or lowering water thermostats) will yield the fastest pathways to decarbonization.
          </div>
        </div>

        {/* Reduction Trend & Impact Forecasting Map */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-emerald-50 p-6 shadow-sm flex flex-col justify-between" id="savings-forecast-card">
          <div className="space-y-1 border-b border-slate-50 pb-3 flex justify-between items-start">
            <div>
              <h3 className="text-base font-sans font-semibold text-slate-800 flex items-center gap-1.5">
                <TrendingDown size={18} className="text-emerald-500" /> Reduction Forecast
              </h3>
              <p className="text-xs text-slate-400">Stepwise target transition with active pledges</p>
            </div>
            {offsetTonnes > 0 && (
              <span className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded font-mono font-bold">
                -{offsetTonnes} tonnes/yr potential savings
              </span>
            )}
          </div>

          {/* SVG Line plot */}
          <div className="my-4 flex justify-center" id="trend-line-chart">
            <div className="relative w-full max-w-sm h-48 bg-slate-50/50 rounded-2xl border border-slate-100/50 p-4">
              <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible">
                {/* Y-Axis lines */}
                <line x1="20" y1="20" x2="380" y2="20" className="stroke-slate-100" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1="85" x2="380" y2="85" className="stroke-slate-100" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1="150" x2="380" y2="150" className="stroke-slate-100" strokeWidth="1" strokeDasharray="3 3"/>

                <span className="absolute top-[10px] left-1 text-[9px] font-mono text-slate-400">20t</span>
                <span className="absolute top-[75px] left-1 text-[9px] font-mono text-slate-400">10t</span>
                <span className="absolute top-[140px] left-1 text-[9px] font-mono text-slate-400">0t</span>

                {/* Plot Area Shading */}
                <path
                  d={`M 30,150 L ${rawLinePath} L 350,150 Z`}
                  fill="url(#emerald-gradient)"
                  opacity="0.15"
                />

                {/* Line Path */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={rawLinePath}
                  className="transition-all duration-1000"
                />

                {/* Interactive Points circles */}
                {forecastCoords.map((coord, idx) => (
                  <g key={idx} className="group cursor-help">
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r="5"
                      className="fill-emerald-500 stroke-white"
                      strokeWidth="2"
                    />
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r="9"
                      className="fill-none group-hover:stroke-emerald-200 transition-all duration-200"
                      strokeWidth="2"
                    />
                  </g>
                ))}

                {/* Definitions for Gradient */}
                <defs>
                  <linearGradient id="emerald-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Floating Labels */}
              <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] font-mono text-slate-400">
                <span>Start ({breakdown.total}t)</span>
                <span>Active Plan ({potentialRemainingFootprint}t)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border-t border-slate-100 p-4 -mx-6 -mb-6 rounded-b-3xl grid grid-cols-2 gap-4 text-center">
            <div>
              <span className="block text-slate-500 text-[10px] font-mono uppercase tracking-wider">Unpledged Base</span>
              <span className="text-xl font-sans font-bold text-slate-700">{breakdown.total} t</span>
            </div>
            <div className="border-l border-slate-200/60">
              <span className="block text-emerald-600 text-[10px] font-mono uppercase tracking-wider font-semibold">Reduced Goal</span>
              <span className="text-xl font-sans font-bold text-emerald-600">{potentialRemainingFootprint} t</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
