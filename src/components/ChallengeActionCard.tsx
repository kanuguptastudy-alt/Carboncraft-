/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Challenge, UserChallengeState } from "../types";
import { Trophy, Plus, Check, Undo2, Bike, Zap, Apple, Trash2, Compass } from "lucide-react";

interface ChallengeActionCardProps {
  challengesList: Challenge[];
  userChallenges: UserChallengeState[];
  onCommit: (challengeId: string) => void;
  onComplete: (challengeId: string) => void;
  onAbandon: (challengeId: string) => void;
}

export function ChallengeActionCard({
  challengesList,
  userChallenges,
  onCommit,
  onComplete,
  onAbandon
}: ChallengeActionCardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const categories = useMemo(() => ["all", "transport", "energy", "food", "consumption"], []);

  // Filter challenges
  const filteredChallenges = useMemo(() => {
    return challengesList.filter((c) => {
      const matchCat = selectedCategory === "all" || c.category === selectedCategory;
      const matchDiff = selectedDifficulty === "all" || c.difficulty === selectedDifficulty;
      return matchCat && matchDiff;
    });
  }, [challengesList, selectedCategory, selectedDifficulty]);

  // Group user action statuses
  const challengeStatesMap = useMemo(() => {
    const map: Record<string, UserChallengeState["status"]> = {};
    userChallenges.forEach((item) => {
      map[item.challengeId] = item.status;
    });
    return map;
  }, [userChallenges]);

  // Icon mapping
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "transport":
        return <Bike className="text-blue-500" size={16} />;
      case "energy":
        return <Zap className="text-amber-500" size={16} />;
      case "food":
        return <Apple className="text-emerald-500" size={16} />;
      default:
        return <Trash2 className="text-purple-500" size={16} />;
    }
  };

  const getImpactBadge = (impact: Challenge["impactCategory"]) => {
    switch (impact) {
      case "high":
        return <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase">High Impact</span>;
      case "medium":
        return <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase">Med Impact</span>;
      default:
        return <span className="bg-slate-50 text-slate-500 border border-slate-100 text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold uppercase">Low Impact</span>;
    }
  };

  return (
    <div className="space-y-6" id="challenges-manager">
      
      {/* Category filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4" id="challenges-filters">
        <div>
          <h3 className="text-base font-sans font-bold text-slate-800">Carbon Reduction Actions</h3>
          <p className="text-xs text-slate-400">Pledge clean actions and record offsets real-time</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Categories Selector */}
          <div className="flex bg-slate-50 border border-slate-200/60 rounded-xl p-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all uppercase tracking-wider ${
                  selectedCategory === cat
                    ? "bg-white text-emerald-800 font-bold shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty Selection Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-medium px-3 py-1.5 rounded-xl text-slate-700 focus:outline-emerald-500"
          >
            <option value="all">Any Difficulty</option>
            <option value="easy">Easy Tasks</option>
            <option value="medium">Medium Tasks</option>
            <option value="hard">Expert Challenges</option>
          </select>
        </div>
      </div>

      {/* Grid of Action Cards */}
      {filteredChallenges.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100" id="empty-challenges">
          <Compass size={24} className="mx-auto text-slate-300 stroke-1 mb-2 animate-spin-slow" />
          <p className="text-sm">No green activities found matching these filter settings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="challenges-grid">
          {filteredChallenges.map((challenge) => {
            const status = challengeStatesMap[challenge.id];

            return (
              <div
                key={challenge.id}
                id={`challenge-card-${challenge.id}`}
                className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between hover:shadow-md ${
                  status === "completed"
                    ? "border-emerald-500 bg-emerald-50/10"
                    : status === "committed"
                    ? "border-emerald-200 shadow-sm"
                    : "border-slate-100"
                }`}
              >
                {/* Header info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-mono capitalize tracking-wide text-slate-500">
                      {getCategoryIcon(challenge.category)}
                      {challenge.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {getImpactBadge(challenge.impactCategory)}
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium capitalize">
                        {challenge.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-sans font-bold text-slate-800 leading-snug">
                      {challenge.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {challenge.description}
                    </p>
                  </div>

                  {/* Tips nested */}
                  <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-mono text-emerald-700 block font-bold uppercase tracking-wider">Eco Tips Checklist:</span>
                    <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1 leading-snug pl-1">
                      {challenge.tips.slice(0, 2).map((tip, idx) => (
                        <li key={idx} className="line-clamp-2">{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Savings Weight & Action Bar */}
                <div className="mt-5 border-t border-slate-50 pt-3 flex items-center justify-between">
                  <div className="text-left">
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">Annual Offset Goal</span>
                    <span className="text-sm font-sans font-extrabold text-emerald-600 font-mono">
                      -{challenge.annualSavingsKg} kg CO₂ <span className="text-xs font-normal text-slate-400">/ yr</span>
                    </span>
                  </div>

                  {/* Button Controls */}
                  <div className="flex gap-2">
                    {status === "completed" ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                        <Trophy size={14} className="text-amber-500 animate-bounce" /> Fully Accomplished
                      </div>
                    ) : status === "committed" ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onAbandon(challenge.id)}
                          className="p-2 border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
                          title="Abandon Pledge"
                        >
                          <Undo2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onComplete(challenge.id)}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition"
                        >
                          <Check size={14} /> Finish
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onCommit(challenge.id)}
                        className="flex items-center gap-1 bg-slate-900 hover:bg-emerald-800 text-white hover:text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition active:scale-95"
                      >
                        <Plus size={14} /> Pledge Action
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
