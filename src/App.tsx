/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { CalculatorInputs, UserChallengeState } from "./types";
import { DEFAULT_INPUTS, calculateCarbonFootprint } from "./utils/calculator";
import { CUSTOM_CHALLENGES } from "./data/carbonActions";
import { MetricDashboard } from "./components/MetricDashboard";
import { CalculatorForm } from "./components/CalculatorForm";
import { ChallengeActionCard } from "./components/ChallengeActionCard";
import { DiagnosticsPanel } from "./components/DiagnosticsPanel";
import { Leaf, Eye, ClipboardList, Award, Sparkles, Activity } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "calculator" | "challenges" | "diagnostics">("dashboard");

  // Load state from localStorage or use defaults
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    const saved = localStorage.getItem("carbon_user_inputs");
    return saved ? JSON.parse(saved) : DEFAULT_INPUTS;
  });

  const [userChallenges, setUserChallenges] = useState<UserChallengeState[]>(() => {
    const saved = localStorage.getItem("carbon_user_challenges");
    if (saved) return JSON.parse(saved);
    // Initialize with a default pledged challenge to make the interface look lively immediately
    return [
      {
        challengeId: "smart_thermostat",
        committedAt: new Date().toISOString(),
        status: "committed"
      }
    ];
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem("carbon_user_inputs", JSON.stringify(inputs));
  }, [inputs]);

  useEffect(() => {
    localStorage.setItem("carbon_user_challenges", JSON.stringify(userChallenges));
  }, [userChallenges]);

  // Dynamically calculate footprint as inputs change
  const breakdown = useMemo(() => {
    return calculateCarbonFootprint(inputs);
  }, [inputs]);

  // Handle Eco Challenge Pledges
  const handleCommitChallenge = (challengeId: string) => {
    if (userChallenges.some((uc) => uc.challengeId === challengeId && uc.status !== "abandoned")) {
      return; // Already active or done
    }
    const newPledge: UserChallengeState = {
      challengeId,
      committedAt: new Date().toISOString(),
      status: "committed"
    };
    setUserChallenges((prev) => [...prev, newPledge]);
  };

  const handleCompleteChallenge = (challengeId: string) => {
    setUserChallenges((prev) =>
      prev.map((uc) =>
        uc.challengeId === challengeId
          ? { ...uc, status: "completed", completedAt: new Date().toISOString() }
          : uc
      )
    );
  };

  const handleAbandonChallenge = (challengeId: string) => {
    setUserChallenges((prev) => prev.filter((uc) => uc.challengeId !== challengeId));
  };

  return (
    <div className="min-h-screen bg-slate-50/65 text-slate-800 flex flex-col font-sans" id="app-root">
      
      {/* 1. TOP PREMIUM HEADER */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-600 rounded-2xl text-white shadow-sm flex items-center justify-center">
              <Leaf size={20} className="stroke-white stroke-[2.5]" />
            </div>
            <div>
              <span className="font-sans font-extrabold text-lg text-slate-900 tracking-tight block">CarbonCraft</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Decarbonize Life</span>
            </div>
          </div>

          {/* Real-time Indicator Pill */}
          <div className="hidden sm:flex items-center gap-3 bg-emerald-50/60 border border-emerald-100/50 py-1.5 px-4 rounded-full text-xs">
            <span className="text-emerald-700 font-semibold flex items-center gap-1.5 font-sans">
              <Sparkles size={13} className="text-emerald-500 fill-emerald-500" /> Current: <strong className="font-mono">{breakdown.total} t</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">Paris Target: <strong className="font-mono text-emerald-800">≤2.0 t</strong></span>
          </div>

        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="workspace">

        {/* Tab Switcher controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-3 border border-slate-100 shadow-xs" id="tabs-navigation-panel">
          
          {/* Menu items */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "dashboard", label: "My Footprint Dashboard", icon: <Eye size={15} /> },
              { id: "calculator", label: "Configure Emissions", icon: <ClipboardList size={15} /> },
              { id: "challenges", label: "Eco Action Hub", icon: <Award size={15} /> },
              { id: "diagnostics", label: "System Diagnostics", icon: <Activity size={15} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-4 rounded-2xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-sm font-bold scale-[1.02]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
                id={`navigation-tab-trigger-${tab.id}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick micro stats helper summary */}
          <div className="text-[11px] font-mono text-slate-400 text-right md:block">
            {userChallenges.filter(c => c.status === 'committed').length} committed pledges • {userChallenges.filter(c => c.status === 'completed').length} completed steps
          </div>
        </div>

        {/* 3. DYNAMIC TAB CONTAINER */}
        <div className="transition-all duration-300" id="tabs-active-viewport">
          {activeTab === "dashboard" && (
            <MetricDashboard
              breakdown={breakdown}
              userChallenges={userChallenges}
              challengesList={CUSTOM_CHALLENGES}
            />
          )}

          {activeTab === "calculator" && (
            <CalculatorForm
              inputs={inputs}
              onChange={setInputs}
            />
          )}

          {activeTab === "challenges" && (
            <ChallengeActionCard
              challengesList={CUSTOM_CHALLENGES}
              userChallenges={userChallenges}
              onCommit={handleCommitChallenge}
              onComplete={handleCompleteChallenge}
              onAbandon={handleAbandonChallenge}
            />
          )}

          {activeTab === "diagnostics" && (
            <DiagnosticsPanel />
          )}
        </div>

      </main>

      {/* 4. FOOTER CREDITS */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 text-xs text-slate-400 space-y-1">
          <p>© 2026 CarbonCraft • Decarbonization Platform & Sustainability Analytics Optimizer</p>
          <p className="font-mono text-[10px]">Challenge 3 Entry for PromptWar Challenge Series</p>
        </div>
      </footer>

    </div>
  );
}
