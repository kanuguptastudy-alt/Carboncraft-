/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CalculatorInputs {
  // Transport
  mileage: number; // Miles driven per week
  carType: string; // "gas", "hybrid", "electric", "none"
  publicTransitHours: number; // Hours per week (bus/train)
  flightsShort: number; // Flights per year (< 4 hours)
  flightsLong: number; // Flights per year (>= 4 hours)

  // Home/Energy
  electricityBill: number; // Average monthly electric bill ($USD)
  cleanEnergyPercentage: number; // 0 to 100 percentage of clean energy contract
  heatingSource: string; // "gas", "electricity", "oil", "none"

  // Food & Waste
  dietType: string; // "heavy-meat", "balanced", "low-meat", "vegetarian", "vegan"
  foodWaste: string; // "high", "moderate", "low"
  recycling: string[]; // ["paper", "plastic", "glass", "metal", "compost"]
}

export interface ActivityLog {
  id: string;
  date: string;
  category: "transport" | "energy" | "food" | "consumption";
  title: string;
  co2SavedKg: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: "transport" | "energy" | "food" | "consumption";
  impactCategory: "high" | "medium" | "low";
  annualSavingsKg: number; // kg of CO2 saved per year if maintained
  difficulty: "easy" | "medium" | "hard";
  tips: string[];
}

export interface UserChallengeState {
  challengeId: string;
  committedAt: string;
  status: "committed" | "completed" | "abandoned";
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface CarbonBreakdown {
  transport: number; // tonnes CO2e / yr
  energy: number;    // tonnes CO2e / yr
  food: number;      // tonnes CO2e / yr
  waste: number;     // tonnes CO2e / yr
  total: number;     // tonnes CO2e / yr
}

export interface AICoachResponse {
  insights: string[];
  reductionPlan: {
    targetFootprint: number;
    recommendedActions: string[];
    monthlySavingsForecastKg: number;
  };
}
