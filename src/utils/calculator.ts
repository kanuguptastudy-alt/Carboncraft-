/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalculatorInputs, CarbonBreakdown } from "../types";
import { EMISSION_FACTORS } from "../data/carbonActions";

export const DEFAULT_INPUTS: CalculatorInputs = {
  mileage: 120,
  carType: "gas",
  publicTransitHours: 2,
  flightsShort: 1,
  flightsLong: 0,
  electricityBill: 110,
  cleanEnergyPercentage: 0,
  heatingSource: "gas",
  dietType: "balanced",
  foodWaste: "moderate",
  recycling: ["paper", "plastic"]
};

export function calculateCarbonFootprint(inputs: CalculatorInputs): CarbonBreakdown {
  // 1. TRANSPORT (Convert to Metric Tonnes: kg / 1000)
  let carFactor = 0;
  if (inputs.carType === "gas") carFactor = EMISSION_FACTORS.gasCarPerMile;
  else if (inputs.carType === "hybrid") carFactor = EMISSION_FACTORS.hybridCarPerMile;
  else if (inputs.carType === "electric") carFactor = EMISSION_FACTORS.electricCarPerMile;

  const annualCarMiles = inputs.mileage * 52;
  const carCO2 = annualCarMiles * carFactor;

  const transitCO2 = inputs.publicTransitHours * 52 * EMISSION_FACTORS.publicTransitPerHour;
  const shortFlightCO2 = inputs.flightsShort * EMISSION_FACTORS.flightShort;
  const longFlightCO2 = inputs.flightsLong * EMISSION_FACTORS.flightLong;

  const transportTotalTonnes = (carCO2 + transitCO2 + shortFlightCO2 + longFlightCO2) / 1000;

  // 2. ENERGY (Convert to Metric Tonnes: kg / 1000)
  // Monthly bill * 12 to get annual spending
  const annualElectricitySpend = inputs.electricityBill * 12;
  // Apply a clean energy percentage discount
  const electricCO2 = annualElectricitySpend * EMISSION_FACTORS.electricityPerDollar * (1 - inputs.cleanEnergyPercentage / 100);

  let heatingCO2 = 0;
  if (inputs.heatingSource === "gas") heatingCO2 = EMISSION_FACTORS.heatingGasAnnualBase;
  else if (inputs.heatingSource === "oil") heatingCO2 = EMISSION_FACTORS.heatingOilAnnualBase;
  else if (inputs.heatingSource === "electricity") heatingCO2 = EMISSION_FACTORS.heatingElectricAnnualBase;

  const energyTotalTonnes = (electricCO2 + heatingCO2) / 1000;

  // 3. FOOD
  // Baseline is in kg of CO2 per year
  const foodBase = EMISSION_FACTORS.dietBaseline[inputs.dietType as keyof typeof EMISSION_FACTORS.dietBaseline] || 2200;
  const foodTotalTonnes = foodBase / 1000;

  // 4. WASTE & CONSUMPTION (kg / 1000)
  const wasteBase = EMISSION_FACTORS.foodWasteMultiplier[inputs.foodWaste as keyof typeof EMISSION_FACTORS.foodWasteMultiplier] || 200;
  
  // Recycling offsets are negative kg
  let recycleOffset = 0;
  inputs.recycling.forEach(item => {
    const offset = EMISSION_FACTORS.recyclingOffets[item as keyof typeof EMISSION_FACTORS.recyclingOffets] || 0;
    recycleOffset += offset; // offset is negative
  });

  const wasteTotalTonnes = Math.max(10, wasteBase + recycleOffset) / 1000;

  // Total
  const totalTonnes = transportTotalTonnes + energyTotalTonnes + foodTotalTonnes + wasteTotalTonnes;

  return {
    transport: Number(transportTotalTonnes.toFixed(2)),
    energy: Number(energyTotalTonnes.toFixed(2)),
    food: Number(foodTotalTonnes.toFixed(2)),
    waste: Number(wasteTotalTonnes.toFixed(2)),
    total: Number(totalTonnes.toFixed(2))
  };
}

export function getComparativeAnalysis(totalFootprint: number): {
  rating: string;
  comparisonText: string;
  colorClass: string;
  badgeClass: string;
} {
  // Let's compare with worldwide benchmarks
  // Target Paris Agreement: < 2.0 tonnes/year
  // World average: ~4.5 tonnes/year
  // US average: ~15.0 tonnes/year
  if (totalFootprint <= 2.0) {
    return {
      rating: "Earth Climate Hero",
      comparisonText: "Incredible! Your carbon footprint aligns with the global target needed to halt climate warming (< 2 tonnes/yr). Keep motivating others!",
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200",
      badgeClass: "bg-emerald-600 text-white"
    };
  } else if (totalFootprint <= 4.5) {
    return {
      rating: "Low Carbon Guardian",
      comparisonText: "Excellent work! Your footprint is lower than the worldwide average (4.5 tonnes/yr). You are actively walking the eco path.",
      colorClass: "text-teal-600 bg-teal-50 border-teal-200",
      badgeClass: "bg-teal-600 text-white"
    };
  } else if (totalFootprint <= 10.0) {
    return {
      rating: "Moderate Footprint",
      comparisonText: "Solid baseline, but room for reduction. Your emissions are below typical Western averages (~15 tonnes/yr) but exceed the global warming caps.",
      colorClass: "text-amber-600 bg-amber-50 border-amber-200",
      badgeClass: "bg-amber-500 text-white"
    };
  } else {
    return {
      rating: "High Footprint Contributor",
      comparisonText: "Your emissions exceed 10 tonnes/yr. This is consistent with intensive energy use. Transition to easy energy or travel adjustments to start reducing today.",
      colorClass: "text-rose-600 bg-rose-50 border-rose-200",
      badgeClass: "bg-rose-500 text-white"
    };
  }
}
