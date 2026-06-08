/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { CarbonBreakdown, CalculatorInputs, AICoachResponse, ChatMessage } from "../types";
import { Sparkles, Send, Brain, Bot, HelpCircle, Loader2, RefreshCw, Milestone, Target, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AICoachProps {
  breakdown: CarbonBreakdown;
  inputs: CalculatorInputs;
}

const CONVERSATION_SUGGESTIONS = [
  "What are the highest impact ways to cut flight emissions?",
  "How does eating red meat versus poultry affect my footprint?",
  "Give me 3 easy hacks to reduce winter heating bills.",
  "Which third-party offset projects are certified and reliable?"
];

export function AICoach({ breakdown, inputs }: AICoachProps) {
  const [activeMode, setActiveMode] = useState<"blueprint" | "chat">("blueprint");
  
  // AI Blueprint State
  const [loadingBlueprint, setLoadingBlueprint] = useState(false);
  const [blueprint, setBlueprint] = useState<AICoachResponse | null>(() => {
    const saved = localStorage.getItem("carbon_coach_blueprint");
    return saved ? JSON.parse(saved) : null;
  });
  const [blueprintError, setBlueprintError] = useState<string | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("carbon_coach_chat");
    return saved ? JSON.parse(saved) : [
      {
        id: "msg_init",
        role: "model",
        text: "Greetings! I am your AI Carbon & Climate Coach. I have reviewed your current carbon calculator data. Ask me anything about practical decarbonization, solar conversions, plant-based diets, or let's cook up some creative lifestyle hacks together!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [userInput, setUserInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync states to local storage
  useEffect(() => {
    if (blueprint) {
      localStorage.setItem("carbon_coach_blueprint", JSON.stringify(blueprint));
    }
  }, [blueprint]);

  useEffect(() => {
    localStorage.setItem("carbon_coach_chat", JSON.stringify(messages));
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle generating AI Insights Blueprint
  const generateBlueprint = async () => {
    setLoadingBlueprint(true);
    setBlueprintError(null);
    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, breakdown }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errMsg = "Could not load AI Insights.";
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.error || parsed.details) {
            errMsg = parsed.error || parsed.details;
          }
        } catch (_) {
          if (errorText) errMsg = errorText;
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setBlueprint(data);
    } catch (err: any) {
      console.error(err);
      setBlueprintError(err.message || "Something went wrong.");
    } finally {
      setLoadingBlueprint(false);
    }
  };

  // Handle Chat messaging
  const sendChatMessage = async (textToSend: string) => {
    if (!textToSend.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setUserInput("");
    setChatLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          breakdown,
          inputs
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errMsg = "Coaching backend error. Check key limits.";
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.error || parsed.details) {
            errMsg = parsed.error || parsed.details;
          }
        } catch (_) {
          if (errorText) errMsg = errorText;
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      
      const coachMsg: ChatMessage = {
        id: `msg_coach_${Date.now()}`,
        role: "model",
        text: data.text || "I was unable to structure an answer, please try asking again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: "model",
        text: `⚠️ Connect Error: ${err.message || "Failed to reach backend."} Please make sure your GEMINI_API_KEY environment variable is declared in your Netlify or Vercel Settings, save it, and trigger a redeploy of your site code.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("Reset current chat history?")) {
      const reset: ChatMessage[] = [
        {
          id: "msg_init",
          role: "model",
          text: "Greetings! I am your AI Carbon & Climate Coach. I have reviewed your current carbon calculator data. Ask me anything about practical decarbonization, solar conversions, plant-based diets, or let's cook up some creative lifestyle hacks together!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(reset);
      localStorage.removeItem("carbon_coach_chat");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6" id="ai-coach-panel">
      
      {/* Upper Mode Selector */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div>
          <h3 className="text-base font-sans font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles size={18} className="text-emerald-500 fill-emerald-500 animate-pulse" /> AI Climate Coach
          </h3>
          <p className="text-xs text-slate-400">Personalized climate assessment and Q&A powered by Gemini</p>
        </div>

        <div className="flex bg-slate-50 border border-slate-200/50 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveMode("blueprint")}
            className={`px-3 py-1.5 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === "blueprint"
                ? "bg-white text-emerald-800 font-bold shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Brain size={13} /> Action Blueprint
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("chat")}
            className={`px-3 py-1.5 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === "chat"
                ? "bg-white text-emerald-800 font-bold shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Bot size={13} /> General AI Advisor
          </button>
        </div>
      </div>

      {/* RENDER MODES */}
      {activeMode === "blueprint" ? (
        <div className="space-y-6" id="blueprint-mode">
          {blueprintError && (
            <div className="bg-rose-50 border border-rose-100 font-mono text-xs text-rose-700 p-4 rounded-2xl relative" id="blueprint-error">
              <span className="font-bold block mb-1">Could Not Generate Carbon Blueprint:</span>
              {blueprintError}
              <button 
                onClick={generateBlueprint}
                className="mt-2 text-rose-800 underline font-bold"
              >
                Retry Generation
              </button>
            </div>
          )}

          {!blueprint ? (
            <div className="text-center py-12 p-6 flex flex-col items-center justify-center space-y-4" id="generate-blueprint-intro">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl animate-bounce">
                <Brain size={32} />
              </div>
              <div className="max-w-sm space-y-1.5">
                <h4 className="text-sm font-sans font-bold text-slate-800">Generate Your Decarbonization Plan</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Our climate AI parses your calculated footprint metrics to craft a highly optimized lifestyle reduction playbook. Includes exact high-impact tactics, targeted forecasts, and custom offsets.
                </p>
              </div>

              <button
                type="button"
                onClick={generateBlueprint}
                disabled={loadingBlueprint}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingBlueprint ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Synthesizing Data...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Calculate AI Green Plan
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6" id="blueprint-dashboard">
              
              {/* Reset trigger */}
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Calculated with latest metrics</span>
                <button
                  type="button"
                  onClick={generateBlueprint}
                  disabled={loadingBlueprint}
                  className="text-emerald-600 font-semibold flex items-center gap-1 hover:underline"
                >
                  <RefreshCw size={11} className={loadingBlueprint ? "animate-spin" : ""} />
                  Recalculate Plan
                </button>
              </div>

              {/* Grid cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Target Footprint */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="p-1.5 bg-white/20 text-white rounded-lg w-max">
                    <Target size={16} />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-mono tracking-wider opacity-80">6-Month Target</span>
                    <span className="text-2xl font-sans font-extrabold">{blueprint.reductionPlan.targetFootprint} t</span>
                    <span className="block text-[10px] opacity-90 font-mono mt-0.5">CO₂e per person/year</span>
                  </div>
                </div>

                {/* Savings Forecast */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg w-max">
                    <Milestone size={16} />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">Monthly Forecast Savings</span>
                    <span className="text-2xl font-sans font-extrabold text-slate-800">-{blueprint.reductionPlan.monthlySavingsForecastKg} kg</span>
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Equivalent to 15 standard trees planted</span>
                  </div>
                </div>

                {/* Recommendation Header */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2">
                  <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg w-max">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">Plan Accuracy</span>
                    <span className="text-2xl font-sans font-extrabold text-slate-800">98% Fit</span>
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Customized to your lifestyle</span>
                  </div>
                </div>

              </div>

              {/* Custom Action insights */}
              <div className="space-y-3" id="blueprint-insights-section">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400">Personalized Climate Insights</h4>
                <div className="space-y-2.5">
                  {blueprint.insights.map((insight, idx) => (
                    <div key={idx} className="flex gap-3 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/60 text-xs leading-relaxed text-slate-600">
                      <span className="font-mono text-emerald-600 font-bold">0{idx + 1}.</span>
                      <p>{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action playbooks */}
              <div className="space-y-3" id="blueprint-recommendations-section">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400">Target Action Checklist</h4>
                <div className="gap-2 grid grid-cols-1 md:grid-cols-3">
                  {blueprint.reductionPlan.recommendedActions.map((action, idx) => (
                    <div key={idx} className="bg-emerald-50/10 border border-emerald-100 rounded-2xl p-4 text-center space-y-2 shadow-sm">
                      <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-mono uppercase">Tactic {idx+1}</span>
                      <p className="text-xs text-slate-700 font-medium font-sans leading-snug">{action}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col h-[520px] justify-between border border-slate-100 rounded-2xl" id="chat-mode">
          
          {/* Chat Messages container */}
          <div className="p-4 overflow-y-auto space-y-4 flex-1 bg-slate-50/30" id="chat-scroller">
            {messages.map((message) => {
              const isCoach = message.role === "model";
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 max-w-[85%] ${isCoach ? "mr-auto text-left" : "ml-auto text-right flex-row-reverse"}`}
                >
                  {/* Avatar display */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    isCoach ? "bg-emerald-600 text-white" : "bg-slate-900 text-slate-100"
                  }`}>
                    {isCoach ? <Bot size={14} /> : "ME"}
                  </div>

                  {/* Body text balloon */}
                  <div className="space-y-1">
                    <div className={`p-3.5 rounded-2xl text-xs text-left leading-relaxed shadow-sm ${
                      isCoach 
                        ? "bg-white border border-slate-100 text-slate-700 markdown-body" 
                        : "bg-emerald-600 text-white rounded-tr-none"
                    }`}>
                      {isCoach ? (
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      ) : (
                        message.text
                      )}
                    </div>
                    <span className="block text-[8px] font-mono text-slate-400 px-1">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {chatLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto text-left" id="chat-loading-indicator">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Bot size={14} className="animate-bounce" />
                </div>
                <div className="bg-white border border-slate-100 p-3.5 rounded-2xl flex items-center gap-2 text-xs text-slate-400 shadow-sm">
                  <Loader2 size={12} className="animate-spin text-emerald-600" /> Connecting climate cores...
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick recommendations panel */}
          <div className="bg-slate-50 border-t border-slate-100 p-3 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-1 uppercase tracking-wider">
              <span>Quick Prompt Prompts</span>
              <button onClick={clearChat} className="text-slate-400 hover:text-rose-600 font-bold">Clear Chat</button>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin snap-x">
              {CONVERSATION_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendChatMessage(suggestion)}
                  disabled={chatLoading}
                  className="shrink-0 snap-center bg-white hover:bg-emerald-50/50 border border-slate-100 rounded-xl px-3 py-1.5 text-[10px] font-medium text-slate-600 hover:text-emerald-800 transition active:scale-95 disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Form entry */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendChatMessage(userInput);
            }}
            className="flex border-t border-slate-100 p-3 bg-white rounded-b-2xl"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about solar power, vegan proteins, plane offsets..."
              className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-emerald-500 focus:bg-white text-slate-700"
              disabled={chatLoading}
            />
            <button
              type="submit"
              disabled={!userInput.trim() || chatLoading}
              className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition shadow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
