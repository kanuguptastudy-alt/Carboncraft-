/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Challenge } from "../types";

export const CUSTOM_CHALLENGES: Challenge[] = [
  {
    id: "eat_plant_based",
    title: "Eco-Chew: Go Plant-Based for 3 Days a Week",
    description: "Shift your lunches or dinners to vegan/vegetarian meals. Animal farming is a primary contributor to agricultural greenhouse gases.",
    category: "food",
    impactCategory: "high",
    annualSavingsKg: 650,
    difficulty: "medium",
    tips: [
      "Start with familiar meals like beans and rice, lentil soup, or vegetable stir-fry.",
      "Explore plant-based proteins such as tofu, chickpeas, and green peas.",
      "Use online recipe guides for easy 15-minute vegan dinner inspiration."
    ]
  },
  {
    id: "smart_thermostat",
    title: "Dial It Down: Adjust Heating/Cooling by 2°F",
    description: "Lower your thermostat by 2 degrees in winter or raise it by 2 degrees in summer. Small changes result in significant power savings.",
    category: "energy",
    impactCategory: "medium",
    annualSavingsKg: 320,
    difficulty: "easy",
    tips: [
      "Layer blankets and wear warm socks during chillier months.",
      "Program your thermostat to automatically go eco-mode when you are asleep or at work.",
      "Check window seals for drafts to preserve room temperatures naturally."
    ]
  },
  {
    id: "replace_leds",
    title: "Bright Idea: Swap 10 Bulbs for LEDs",
    description: "Replace high-heat halogen or incandescent lightbulbs with compact smart LED bulbs. They use 80% less energy.",
    category: "energy",
    impactCategory: "low",
    annualSavingsKg: 150,
    difficulty: "easy",
    tips: [
      "Target high-traffic rooms first: kitchen, living room, and porch lights.",
      "LEDs last up to 25 times longer, saving you replacement utility costs as well.",
      "Remember to recycle your old bulbs at a specialized municipal depot."
    ]
  },
  {
    id: "transit_commute",
    title: "Pedal & Pass: Shift 2 Car Trips to Transit or Bike",
    description: "Avoid driving for errands or work commutes twice a week. Travel by light rail, bus, bicycle, or walk.",
    category: "transport",
    impactCategory: "high",
    annualSavingsKg: 850,
    difficulty: "medium",
    tips: [
      "Combine multiple errands into a single circular trip.",
      "Try bicycle commutes for trips under 5 miles—it doubles as a cardio workout!",
      "Read or catch up on emails when riding a train or bus."
    ]
  },
  {
    id: "cold_wash_dry",
    title: "Air Fresh: Cold Water Wash & Air Dry",
    description: "Wash garments at 30°C/80°F and line-dry them instead of using a heated tumble dryer.",
    category: "consumption",
    impactCategory: "medium",
    annualSavingsKg: 240,
    difficulty: "easy",
    tips: [
      "Modern laundry detergents dissolve and sanitize fully in cold cycles.",
      "Line drying keeps fabrics looking crisp and extends clothing lifespan.",
      "Hang shirts on hangers directly to air-dry and reduce the need for ironing."
    ]
  },
  {
    id: "zero_food_waste",
    title: "Plate Clean: Reduce Kitchen Food Waste by 90%",
    description: "Plan meals, store food correctly (freeze surplus), and reuse leftovers to minimize organic waste that rots in organic landfill.",
    category: "food",
    impactCategory: "medium",
    annualSavingsKg: 380,
    difficulty: "medium",
    tips: [
      "Create a weekly grocery shopping list and purchase strictly what you need.",
      "Establish a 'First-In, First-Out' produce basket in the refrigerator.",
      "Learn simple pickling or vegetable broth tricks to use raw leftovers."
    ]
  },
  {
    id: "thrift_shopper",
    title: "Second Love: Purchase Outfits Pre-owned Only",
    description: "Ditch fast fashion. Pledge to buy clothing pre-owned or swap with acquaintances for the next 3 months.",
    category: "consumption",
    impactCategory: "medium",
    annualSavingsKg: 200,
    difficulty: "hard",
    tips: [
      "Visit flea markets, vintage clothing setups, or thrift platforms.",
      "Organize an evening dress or jacket swap event with close peers.",
      "Focus on quality over volume—mend garments instead of replacing them."
    ]
  },
  {
    id: "electric_wheels",
    title: "Clean Cruise: Practice Smart Efficiency Driving",
    description: "Avoid sudden braking, maintain steady highway speeds (60mph vs 75mph), and turn off your main engine during idle stops.",
    category: "transport",
    impactCategory: "medium",
    annualSavingsKg: 210,
    difficulty: "easy",
    tips: [
      "Maintain inflated tires—low pressure increases friction and fuel usage.",
      "Use cruise control on long, flat expressways.",
      "Remove roof racks or luggage boxes when not in active use to reduce aerodynamic drag."
    ]
  }
];

export const EMISSION_FACTORS = {
  // Transport multipliers (kg CO2e per unit)
  gasCarPerMile: 0.404,  // Standard average passenger gasoline vehicle
  hybridCarPerMile: 0.21, // Standard hybrid
  electricCarPerMile: 0.09, // EV on average electric grid
  publicTransitPerHour: 1.8, // Hourly emissions on bus / local light-rail

  // Flight emissions (kg CO2e per Flight)
  flightShort: 350,  // Short domestic flight
  flightLong: 1200, // Long international flight

  // Household Energy multipliers
  electricityPerDollar: 1.9, // Estimated average kWh per dollar (~5.2 kWh / $) x 0.38 kg/kWh
  heatingGasAnnualBase: 1800, // Average home gas heating emissions kg
  heatingOilAnnualBase: 2900, // Average heating oil emissions kg
  heatingElectricAnnualBase: 1200, // Electric heating
  heatingNone: 0,

  // Foods (kg CO2e per person annual baseline)
  dietBaseline: {
    "heavy-meat": 3300,
    "balanced": 2200,
    "low-meat": 1700,
    "vegetarian": 1500,
    "vegan": 1100
  },

  // Waste & landfill habits
  foodWasteMultiplier: {
    "high": 400,
    "moderate": 200,
    "low": 50
  },

  // Recycling offsets (kg CO2 subtracted per year)
  recyclingOffets: {
    "paper": -40,
    "plastic": -50,
    "glass": -30,
    "metal": -60,
    "compost": -80
  }
};
