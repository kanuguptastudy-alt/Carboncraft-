/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";
import { calculateCarbonFootprint } from "./calculator";
import { CalculatorInputs } from "../types";

describe("Calculator Advanced Multi-dimensional Scenarios", () => {
  it("verifies accurate scaling across vehicle types", () => {
    const basis: CalculatorInputs = {
      mileage: 100,
      carType: "gas",
      publicTransitHours: 0,
      flightsShort: 0,
      flightsLong: 0,
      electricityBill: 0,
      cleanEnergyPercentage: 0,
      heatingSource: "none",
      dietType: "vegan",
      foodWaste: "low",
      recycling: []
    };

    const gasBreakdown = calculateCarbonFootprint(basis);
    const hybridBreakdown = calculateCarbonFootprint({ ...basis, carType: "hybrid" });
    const evBreakdown = calculateCarbonFootprint({ ...basis, carType: "electric" });
    const walkBreakdown = calculateCarbonFootprint({ ...basis, carType: "none" });

    // Assert descending emissions order (Gas > Hybrid > EV > Walk)
    expect(gasBreakdown.transport).toBeGreaterThan(hybridBreakdown.transport);
    expect(hybridBreakdown.transport).toBeGreaterThan(evBreakdown.transport);
    expect(evBreakdown.transport).toBeGreaterThan(walkBreakdown.transport);
    expect(walkBreakdown.transport).toBe(0);
  });

  it("verifies precise scaling of short-haul and long-haul flights", () => {
    const basis: CalculatorInputs = {
      mileage: 0,
      carType: "none",
      publicTransitHours: 0,
      flightsShort: 0,
      flightsLong: 0,
      electricityBill: 0,
      cleanEnergyPercentage: 0,
      heatingSource: "none",
      dietType: "vegan",
      foodWaste: "low",
      recycling: []
    };

    const zeroFlights = calculateCarbonFootprint(basis);
    const shortFlight = calculateCarbonFootprint({ ...basis, flightsShort: 2 });
    const longFlight = calculateCarbonFootprint({ ...basis, flightsLong: 1 });

    // 2 Short flights: 2 * 350 = 700 kg => 0.70 tonnes
    expect(shortFlight.transport).toBe(0.70);

    // 1 Long flight: 1 * 1200 = 1200 kg => 1.20 tonnes
    expect(longFlight.transport).toBe(1.20);

    expect(zeroFlights.transport).toBe(0);
  });

  it("verifies clean energy grid percentage contract reduction", () => {
    const basis: CalculatorInputs = {
      mileage: 0,
      carType: "none",
      publicTransitHours: 0,
      flightsShort: 0,
      flightsLong: 0,
      electricityBill: 150,
      cleanEnergyPercentage: 0,
      heatingSource: "none",
      dietType: "vegan",
      foodWaste: "low",
      recycling: []
    };

    const zeroClean = calculateCarbonFootprint({ ...basis, cleanEnergyPercentage: 0 });
    const halfClean = calculateCarbonFootprint({ ...basis, cleanEnergyPercentage: 50 });
    const totalClean = calculateCarbonFootprint({ ...basis, cleanEnergyPercentage: 100 });

    // Verify proportional linear reduction in energy sector emissions
    expect(zeroClean.energy).toBeGreaterThan(halfClean.energy);
    expect(halfClean.energy).toBeGreaterThan(totalClean.energy);
    expect(totalClean.energy).toBe(0); // 100% discount on electricity bill, heating source is "none"
  });

  it("verifies household heating fuels hierarchy and emissions", () => {
    const basis: CalculatorInputs = {
      mileage: 0,
      carType: "none",
      publicTransitHours: 0,
      flightsShort: 0,
      flightsLong: 0,
      electricityBill: 0,
      cleanEnergyPercentage: 0,
      heatingSource: "none",
      dietType: "vegan",
      foodWaste: "low",
      recycling: []
    };

    const gasHeatingObj = calculateCarbonFootprint({ ...basis, heatingSource: "gas" });
    const oilHeatingObj = calculateCarbonFootprint({ ...basis, heatingSource: "oil" });
    const elecHeatingObj = calculateCarbonFootprint({ ...basis, heatingSource: "electricity" });
    const districtHeatingObj = calculateCarbonFootprint({ ...basis, heatingSource: "none" });

    // Baselining: Oil (2900 kg / 2.9t) > Gas (1800 kg / 1.8t) > Electric (1200 kg / 1.2t) > None (0t)
    expect(oilHeatingObj.energy).toBe(2.90);
    expect(gasHeatingObj.energy).toBe(1.80);
    expect(elecHeatingObj.energy).toBe(1.20);
    expect(districtHeatingObj.energy).toBe(0.00);
  });

  it("verifies proper composition sums and total correctness", () => {
    const randomInputs: CalculatorInputs = {
      mileage: 231,
      carType: "hybrid",
      publicTransitHours: 9,
      flightsShort: 3,
      flightsLong: 1,
      electricityBill: 185,
      cleanEnergyPercentage: 35,
      heatingSource: "gas",
      dietType: "low-meat",
      foodWaste: "moderate",
      recycling: ["paper", "glass"]
    };

    const breakdown = calculateCarbonFootprint(randomInputs);

    // Sum of components must equal total within rounding threshold
    const sum = Number((breakdown.transport + breakdown.energy + breakdown.food + breakdown.waste).toFixed(2));
    expect(Math.abs(breakdown.total - sum)).toBeLessThanOrEqual(0.02);
  });
});
