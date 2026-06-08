/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";
import { calculateCarbonFootprint } from "./calculator";
import { CalculatorInputs } from "../types";

describe("calculateCarbonFootprint - Extreme Boundary Conditions", () => {
  it("forces absolute zero/empty input bounds gracefully", () => {
    const zeroInputs: CalculatorInputs = {
      mileage: 0,
      carType: "none",
      publicTransitHours: 0,
      flightsShort: 0,
      flightsLong: 0,
      electricityBill: 0,
      cleanEnergyPercentage: 100,
      heatingSource: "none",
      dietType: "vegan",
      foodWaste: "low",
      recycling: ["paper", "plastic", "glass", "metal", "compost"]
    };

    const breakdown = calculateCarbonFootprint(zeroInputs);

    // Baseline dietary Vegan footprint remains = 1100 kg
    // Low food waste remains = 50 kg
    // Total offsets subtraction from recycling = -260 kg
    // Expected food = 1.1 tonnes, Expected waste = 10kg floor
    // Overall total: 1.10 (food) + 0.01 (waste) + 0 (transport) + 0 (energy) = 1.11 Tonnes
    expect(breakdown.transport).toBe(0);
    expect(breakdown.energy).toBe(0);
    expect(breakdown.food).toBe(1.10);
    expect(breakdown.waste).toBe(0.01); // floored to 10kg => 0.01t
    expect(breakdown.total).toBe(1.11);
  });

  it("safeguards overflowing limits mathematically", () => {
    const hyperExtremeInputs: CalculatorInputs = {
      mileage: 999999, // ultra large
      carType: "gas",
      publicTransitHours: 24 * 7, // full continuous week commuting
      flightsShort: 500, // impossible flights
      flightsLong: 200,
      electricityBill: 1000000, // $1M electric bill monthly
      cleanEnergyPercentage: 0,
      heatingSource: "oil",
      dietType: "heavy-meat",
      foodWaste: "high",
      recycling: []
    };

    const breakdown = calculateCarbonFootprint(hyperExtremeInputs);

    // Let's ensure calculations evaluate to a final normal positive number instead of NaN or Infinity
    expect(breakdown.total).toBeGreaterThan(1000);
    expect(Number.isFinite(breakdown.total)).toBe(true);
    expect(breakdown.transport).toBeGreaterThan(0);
    expect(breakdown.energy).toBeGreaterThan(0);
  });

  it("handles negative values defensively in case of database glitches", () => {
    const glitchInputs: CalculatorInputs = {
      mileage: -100, // glitch negative
      carType: "gas",
      publicTransitHours: -5,
      flightsShort: -2,
      flightsLong: -1,
      electricityBill: -50,
      cleanEnergyPercentage: 120, // 120% green contract
      heatingSource: "gas",
      dietType: "vegan",
      foodWaste: "low",
      recycling: ["paper", "plastic"]
    };

    const breakdown = calculateCarbonFootprint(glitchInputs);

    // Our math engine should floor negative mileage or transport hours to 0 instead of subtracting emissions!
    expect(breakdown.transport).toBeGreaterThanOrEqual(0);
    expect(breakdown.energy).toBeGreaterThanOrEqual(0);
    expect(breakdown.food).toBeGreaterThanOrEqual(0);
    expect(breakdown.waste).toBeGreaterThanOrEqual(0);
    expect(breakdown.total).toBeGreaterThanOrEqual(0);
  });
});
