/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";
import { CUSTOM_CHALLENGES, EMISSION_FACTORS } from "./carbonActions";

describe("CUSTOM_CHALLENGES Integrity", () => {
  it("must contain a non-empty set of eco challenges", () => {
    expect(CUSTOM_CHALLENGES).toBeDefined();
    expect(CUSTOM_CHALLENGES.length).toBeGreaterThan(5);
  });

  it("checks structure schema is exactly adhered to by all challenges", () => {
    CUSTOM_CHALLENGES.forEach((challenge) => {
      // Required parameters
      expect(challenge.id).toBeTypeOf("string");
      expect(challenge.title).toBeTypeOf("string");
      expect(challenge.description).toBeTypeOf("string");
      expect(challenge.category).toBeTypeOf("string");
      expect(challenge.impactCategory).toBeTypeOf("string");
      expect(challenge.annualSavingsKg).toBeTypeOf("number");
      expect(challenge.difficulty).toBeTypeOf("string");
      expect(Array.isArray(challenge.tips)).toBe(true);
      expect(challenge.tips.length).toBeGreaterThanOrEqual(1);

      // Value logic validation
      expect(challenge.annualSavingsKg).toBeGreaterThan(0);
      expect(["transport", "energy", "food", "consumption"]).toContain(challenge.category);
      expect(["high", "medium", "low"]).toContain(challenge.impactCategory);
      expect(["easy", "medium", "hard"]).toContain(challenge.difficulty);
    });
  });

  it("has unique IDs for all configured activities", () => {
    const ids = CUSTOM_CHALLENGES.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });
});

describe("EMISSION_FACTORS Integrity", () => {
  it("guarantees typical positive multipliers", () => {
    // Check standard transportation multipliers
    expect(EMISSION_FACTORS.gasCarPerMile).toBeGreaterThan(0);
    expect(EMISSION_FACTORS.hybridCarPerMile).toBeGreaterThan(0);
    expect(EMISSION_FACTORS.electricCarPerMile).toBeGreaterThan(0);
    expect(EMISSION_FACTORS.publicTransitPerHour).toBeGreaterThan(0);

    // Assert hybrid car is lower emission than gas car and higher than electric standard
    expect(EMISSION_FACTORS.gasCarPerMile).toBeGreaterThan(EMISSION_FACTORS.hybridCarPerMile);
    expect(EMISSION_FACTORS.hybridCarPerMile).toBeGreaterThan(EMISSION_FACTORS.electricCarPerMile);
  });

  it("guarantees household baseline standards are positive parameters", () => {
    expect(EMISSION_FACTORS.heatingGasAnnualBase).toBeGreaterThanOrEqual(0);
    expect(EMISSION_FACTORS.heatingOilAnnualBase).toBeGreaterThanOrEqual(0);
    expect(EMISSION_FACTORS.heatingElectricAnnualBase).toBeGreaterThanOrEqual(0);
    expect(EMISSION_FACTORS.heatingNone).toBe(0);

    // Fuel oil produces more emissions than natural gas and electricity
    expect(EMISSION_FACTORS.heatingOilAnnualBase).toBeGreaterThan(EMISSION_FACTORS.heatingGasAnnualBase);
    expect(EMISSION_FACTORS.heatingGasAnnualBase).toBeGreaterThan(EMISSION_FACTORS.heatingElectricAnnualBase);
  });

  it("guarantees proper dietary baseline progression", () => {
    const baselines = EMISSION_FACTORS.dietBaseline;
    expect(baselines["heavy-meat"]).toBeGreaterThan(baselines["balanced"]);
    expect(baselines["balanced"]).toBeGreaterThan(baselines["low-meat"]);
    expect(baselines["low-meat"]).toBeGreaterThan(baselines["vegetarian"]);
    expect(baselines["vegetarian"]).toBeGreaterThan(baselines["vegan"]);
  });

  it("guarantees recycling offsets remain subtractive parameters", () => {
    const offsets = EMISSION_FACTORS.recyclingOffets;
    expect(offsets.paper).toBeLessThan(0);
    expect(offsets.plastic).toBeLessThan(0);
    expect(offsets.glass).toBeLessThan(0);
    expect(offsets.metal).toBeLessThan(0);
    expect(offsets.compost).toBeLessThan(0);
  });
});
