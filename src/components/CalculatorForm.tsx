/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CalculatorInputs } from "../types";
import { Car, Zap, Utensils, Plane, Trash, RefreshCw } from "lucide-react";

interface CalculatorFormProps {
  inputs: CalculatorInputs;
  onChange: (updated: CalculatorInputs) => void;
}

export function CalculatorForm({ inputs, onChange }: CalculatorFormProps) {
  const updateField = (field: keyof CalculatorInputs, value: any) => {
    onChange({
      ...inputs,
      [field]: value,
    });
  };

  const toggleRecycling = (material: string) => {
    const list = [...inputs.recycling];
    const index = list.indexOf(material);
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(material);
    }
    updateField("recycling", list);
  };

  return (
    <div className="space-y-8" id="calculator-config">
      
      {/* 1. TRANSPORT SECTION */}
      <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6" id="calc-transport-section">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Car size={20} />
          </div>
          <div>
            <h3 className="text-base font-sans font-bold text-slate-800">Transportation Commuting</h3>
            <p className="text-xs text-slate-400">Specify your personal travel, driving, and flying details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Weekly Vehicle Miles */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 flex justify-between">
              <span>Weekly Driving Distance</span>
              <span className="font-bold text-slate-800">{inputs.mileage} miles</span>
            </label>
            <input
              type="range"
              id="input-range-mileage"
              aria-label="Weekly Driving Distance in Miles"
              aria-valuemin={0}
              aria-valuemax={400}
              aria-valuenow={inputs.mileage}
              min="0"
              max="400"
              step="10"
              value={inputs.mileage}
              onChange={(e) => updateField("mileage", Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 mi</span>
              <span>150 mi (average)</span>
              <span>400 mi+</span>
            </div>
          </div>

          {/* Powertrain Type */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 block">
              Vehicle Fuel Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: "gas", label: "Gasoline" },
                { key: "hybrid", label: "Hybrid" },
                { key: "electric", label: "Electric" },
                { key: "none", label: "None / Walk" },
              ].map((car) => (
                <button
                  key={car.key}
                  type="button"
                  onClick={() => updateField("carType", car.key)}
                  className={`py-2 px-1 text-xs rounded-xl font-medium border text-center transition-all ${
                    inputs.carType === car.key
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/10"
                      : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {car.label}
                </button>
              ))}
            </div>
          </div>

          {/* Public Transit Intensity */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 flex justify-between">
              <span>Public Transit Weekly Use</span>
              <span className="font-bold text-slate-800">{inputs.publicTransitHours} hours</span>
            </label>
            <input
              type="range"
              id="input-range-transit"
              aria-label="Public Transit Weekly Use in Hours"
              aria-valuemin={0}
              aria-valuemax={35}
              aria-valuenow={inputs.publicTransitHours}
              min="0"
              max="35"
              step="1"
              value={inputs.publicTransitHours}
              onChange={(e) => updateField("publicTransitHours", Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0h (None)</span>
              <span>10 hrs</span>
              <span>35 hrs+</span>
            </div>
          </div>

          {/* Flights Counters */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 block">
              Annual Aviation Trips
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Short Flights */}
              <div className="flex items-center justify-between border border-slate-100 rounded-2xl p-2.5 bg-slate-50/20">
                <div className="text-left">
                  <span className="block text-[11px] font-sans font-semibold text-slate-700">Short Haul</span>
                  <span className="text-[10px] text-slate-400">&lt; 4 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateField("flightsShort", Math.max(0, inputs.flightsShort - 1))}
                    className="w-7 h-7 bg-white rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 active:scale-95"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-mono font-bold text-slate-800">{inputs.flightsShort}</span>
                  <button
                    type="button"
                    onClick={() => updateField("flightsShort", inputs.flightsShort + 1)}
                    className="w-7 h-7 bg-white rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Long Flights */}
              <div className="flex items-center justify-between border border-slate-100 rounded-2xl p-2.5 bg-slate-50/20">
                <div className="text-left">
                  <span className="block text-[11px] font-sans font-semibold text-slate-700">Long Haul</span>
                  <span className="text-[10px] text-slate-400">&gt; 4 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateField("flightsLong", Math.max(0, inputs.flightsLong - 1))}
                    className="w-7 h-7 bg-white rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 active:scale-95"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-mono font-bold text-slate-800">{inputs.flightsLong}</span>
                  <button
                    type="button"
                    onClick={() => updateField("flightsLong", inputs.flightsLong + 1)}
                    className="w-7 h-7 bg-white rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. UTILITY & ENERGY SECTION */}
      <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6" id="calc-energy-section">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-base font-sans font-bold text-slate-800">Utility Power & Heating</h3>
            <p className="text-xs text-slate-400">Examine home electricity bills, clean power contracts, and fuel choices</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Monthly Electric Bill */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 flex justify-between">
              <span>Monthly Electricity Bill</span>
              <span className="font-bold text-slate-800">${inputs.electricityBill} / mo</span>
            </label>
            <input
              type="range"
              id="input-range-electricity"
              aria-label="Monthly Electricity Bill in Dollars"
              aria-valuemin={0}
              aria-valuemax={400}
              aria-valuenow={inputs.electricityBill}
              min="0"
              max="400"
              step="10"
              value={inputs.electricityBill}
              onChange={(e) => updateField("electricityBill", Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$0</span>
              <span>$120 (average)</span>
              <span>$400+</span>
            </div>
          </div>

          {/* Clean energy offset percentage */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 flex justify-between">
              <span>Green energy mix contract</span>
              <span className="font-semibold text-emerald-600 font-mono">{inputs.cleanEnergyPercentage}% Clean</span>
            </label>
            <input
              type="range"
              id="input-range-clean-energy"
              aria-label="Green Energy Mix Contract Percentage"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={inputs.cleanEnergyPercentage}
              min="0"
              max="100"
              step="5"
              value={inputs.cleanEnergyPercentage}
              onChange={(e) => updateField("cleanEnergyPercentage", Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Standard Fossil Grid)</span>
              <span>50% (Eco Blend)</span>
              <span>100% (Pure Solar/Wind Plan)</span>
            </div>
          </div>

          {/* Main Heating Source */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 block mb-2">
              Primary Home Heating Fuel
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { key: "gas", label: "Natural Gas Burner" },
                { key: "oil", label: "Heating Fuel Oil" },
                { key: "electricity", label: "Electrical / Heat Pump" },
                { key: "none", label: "District / Zero Emission" },
              ].map((h) => (
                <button
                  key={h.key}
                  type="button"
                  onClick={() => updateField("heatingSource", h.key)}
                  className={`py-2.5 px-2 text-xs rounded-xl font-medium border text-center transition-all ${
                    inputs.heatingSource === h.key
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/10"
                      : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. DIET, TRASH & RECYCLING SECTION */}
      <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6" id="calc-food-waste-section">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Utensils size={20} />
          </div>
          <div>
            <h3 className="text-base font-sans font-bold text-slate-800">Dietary & Waste Audit</h3>
            <p className="text-xs text-slate-400">Evaluate meat consumption scales, and trash recycling habits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diet Preferences */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 block mb-2">
              Primary Dietary Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { key: "heavy-meat", label: "Heavy Meat", desc: "Frequent beef/pork" },
                { key: "balanced", label: "Balanced", desc: "Poultry, mixed meat" },
                { key: "low-meat", label: "Low Meat", desc: "Occasional animal protein" },
                { key: "vegetarian", label: "Vegetarian", desc: "Dairy/eggs, zero meat" },
                { key: "vegan", label: "Strict Vegan", desc: "Fully plant-based food" },
              ].map((diet) => (
                <button
                  key={diet.key}
                  type="button"
                  onClick={() => updateField("dietType", diet.key)}
                  className={`p-3 text-xs rounded-2xl font-medium border text-center flex flex-col items-center justify-center transition-all ${
                    inputs.dietType === diet.key
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/10"
                      : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-semibold block">{diet.label}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{diet.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grocery Wastage */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 block">
              Organic Food Waste Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "high", label: "High", desc: "Spoil or throw frequently" },
                { key: "moderate", label: "Moderate", desc: "Standard leftovers" },
                { key: "low", label: "Low / None", desc: "Meticulous planning" },
              ].map((waste) => (
                <button
                  key={waste.key}
                  type="button"
                  onClick={() => updateField("foodWaste", waste.key)}
                  className={`py-2 px-1 text-xs rounded-xl font-medium border text-center transition-all flex flex-col justify-center items-center ${
                    inputs.foodWaste === waste.key
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/10"
                      : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-semibold">{waste.label}</span>
                  <span className="text-[9px] text-slate-400">{waste.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Recycling checklists */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 block">
              Routinely Separated Materials
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "paper", label: "📄 Paper & Board" },
                { key: "plastic", label: "🧴 Plastics" },
                { key: "glass", label: "🍾 Glass Bottles" },
                { key: "metal", label: "🥫 Tin & Aluminum" },
                { key: "compost", label: "🍌 Food Composting" },
              ].map((item) => {
                const isActive = inputs.recycling.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleRecycling(item.key)}
                    className={`py-1.5 px-3 text-xs rounded-full border transition-all ${
                      isActive
                        ? "bg-emerald-600 border-emerald-600 text-white font-semibold"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
