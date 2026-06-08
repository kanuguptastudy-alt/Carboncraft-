/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";
import { calculateCarbonFootprint, getComparativeAnalysis } from "./calculator";
import { CalculatorInputs } from "../types";

describe("calculateCarbonFootprint", () => {
  it("computes standard/default scenario with precision", () => {
    const defaultInputs: CalculatorInputs = {
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

    const breakdown = calculateCarbonFootprint(defaultInputs);

    // Assert transport portion calculation:
    // - Gas car: 120 miles/wk * 52 wks * 0.404 factor = 2520.96 kg
    // - Public transit: 2 hrs * 52 wks * 1.8 factor = 187.2 kg
    // - Short flight: 1 * 350 factor = 350 kg
    // - Long flight: 0 * 1200 factor = 0 kg
    //   Total transport kg = 2520.96 + 187.2 + 350 + 0 = 3058.16 kg => 3.058 Tonnes
    expect(breakdown.transport).toBe(3.06);

    // Assert energy portion calculation:
    // - Electric spend: $110 * 12 * 1.9 factor * (1 - 0) = 2508 kg
    // - Heating gas baseline: 1800 kg
    //   Total energy kg = 2508 + 1800 = 4308 kg => 4.308 Tonnes
    expect(breakdown.energy).toBe(4.31);

    // Assert food:
    // - Balanced food: 2200 kg => 2.20 Tonnes
    expect(breakdown.food).toBe(2.20);

    // Assert waste:
    // - Moderate base: 200 kg
    // - Recycling offsets: paper (-40), plastic (-50)
    //   Total waste kg = 200 - 40 - 50 = 110 kg => 0.11 Tonnes
    expect(breakdown.waste).toBe(0.11);

    // Overall total check: 3.06 + 4.31 + 2.20 + 0.11 = 9.68 Tonnes
    expect(breakdown.total).toBe(9.68);
  });

  it("handles highly eco-friendly lifestyles (EV, green offset, vegan diet, full recycling)", () => {
    const extremelyEcoInputs: CalculatorInputs = {
      mileage: 30, // low mileage
      carType: "electric",
      publicTransitHours: 0,
      flightsShort: 0,
      flightsLong: 0,
      electricityBill: 50, // low bill
      cleanEnergyPercentage: 100, // 100% clean contract offset!
      heatingSource: "electricity", // standard electric base (1200)
      dietType: "vegan", // lowest food emission
      foodWaste: "low", // 50 kg
      recycling: ["paper", "plastic", "glass", "metal", "compost"] // maximum offsets: -40 - 50 - 30 - 60 - 80 = -260 offset!
    };

    const breakdown = calculateCarbonFootprint(extremelyEcoInputs);

    // Transport math:
    // - EV car: 30 * 52 * 0.09 = 140.4 kg
    //   Total transport kg = 140.4 kg => 0.14 Tonnes
    expect(breakdown.transport).toBe(0.14);

    // Energy math:
    // - Electric spend: $50 * 12 * 1.9 * (1 - 100/100) = 0 kg
    // - Heating electric baseline: 1200 kg
    //   Total energy kg = 0 + 1200 = 1200 => 1.20 Tonnes
    expect(breakdown.energy).toBe(1.20);

    // Food math:
    // - Vegan food: 1100 kg => 1.10 Tonnes
    expect(breakdown.food).toBe(1.10);

    // Waste math check:
    // - Low food waste: 50 kg
    // - Recycling offsets: -260 kg
    //   Total waste would be -210 kg, but Math.max(10, ...) ensures we floor at 10kg => 0.01 Tonnes
    expect(breakdown.waste).toBe(0.01);

    // Total check: 0.14 + 1.20 + 1.10 + 0.01 = 2.45 Tonnes
    expect(breakdown.total).toBe(2.45);
  });

  it("calculates high emission setups (long flights, hybrid heating oil, heavy meat diet)", () => {
    const heavyEmittingInputs: CalculatorInputs = {
      mileage: 300,
      carType: "gas",
      publicTransitHours: 5,
      flightsShort: 4,
      flightsLong: 3,
      electricityBill: 250,
      cleanEnergyPercentage: 10,
      heatingSource: "oil", // 2900 kg base
      dietType: "heavy-meat", // 3300 kg base
      foodWaste: "high", // 400 kg base
      recycling: [] // no recycling offsets
    };

    const breakdown = calculateCarbonFootprint(heavyEmittingInputs);

    // Transport check:
    // - Gas car: 300 * 52 * 0.404 = 6302.4 kg
    // - Transit: 5 * 52 * 1.8 = 468 kg
    // - flight short: 4 * 350 = 1400 kg
    // - flight long: 3 * 1200 = 3600 kg
    //   Total = 6302.4 + 468 + 1400 + 3600 = 11770.4 kg => 11.77 Tonnes
    expect(breakdown.transport).toBe(11.77);

    // Energy check:
    // - Electric: $250 * 12 * 1.9 * (1 - 10/100) = 5700 * 0.9 = 5130 kg
    // - Heating oil: 2900 kg
    //   Total = 5130 + 2900 = 8030 kg => 8.03 Tonnes
    expect(breakdown.energy).toBe(8.03);

    // Food check: 3.3 Tonnes
    expect(breakdown.food).toBe(3.30);

    // Waste check: 400 kg => 0.40 Tonnes
    expect(breakdown.waste).toBe(0.40);

    // Total check: 11.77 + 8.03 + 3.30 + 0.40 = 23.50 Tonnes
    expect(breakdown.total).toBe(23.50);
  });
});

describe("getComparativeAnalysis", () => {
  it("correctly buckets Earth Climate Heros for <= 2.0 tCO2e/year", () => {
    const analysis = getComparativeAnalysis(1.8);
    expect(analysis.rating).toBe("Earth Climate Hero");
    expect(analysis.colorClass).toContain("emerald");
    expect(analysis.badgeClass).toContain("emerald");
  });

  it("correctly buckets Low Carbon Guardians for <= 4.5 tCO2e/year", () => {
    const analysis = getComparativeAnalysis(3.5);
    expect(analysis.rating).toBe("Low Carbon Guardian");
    expect(analysis.colorClass).toContain("teal");
    expect(analysis.badgeClass).toContain("teal");
  });

  it("correctly buckets Moderate Footprints for <= 10.0 tCO2e/year", () => {
    const analysis = getComparativeAnalysis(8.2);
    expect(analysis.rating).toBe("Moderate Footprint");
    expect(analysis.colorClass).toContain("amber");
    expect(analysis.badgeClass).toContain("amber");
  });

  it("correctly buckets High Footprint Contributors for > 10.0 tCO2e/year", () => {
    const analysis = getComparativeAnalysis(14.5);
    expect(analysis.rating).toBe("High Footprint Contributor");
    expect(analysis.colorClass).toContain("rose");
    expect(analysis.badgeClass).toContain("rose");
  });
});
