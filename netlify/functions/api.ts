/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export default async (req: Request) => {
  // CORS & Security headers to support rich environments
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  // Handle standard PREFLIGHT requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  // 1. Health check endpoint
  if (pathname.includes("/health")) {
    return new Response(
      JSON.stringify({ status: "ok", time: new Date().toISOString() }),
      { headers, status: 200 }
    );
  }

  // 2. AI Personalized Insights Blueprint
  if (pathname.includes("/ai/insights")) {
    try {
      if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
          headers,
          status: 405,
        });
      }

      const body = await req.json();
      const { inputs, breakdown } = body;

      if (!inputs || !breakdown) {
        return new Response(JSON.stringify({ error: "Missing required footprint details" }), {
          headers,
          status: 400,
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return new Response(
          JSON.stringify({
            error: "Gemini API key is not configured in Netlify Environment Variables.",
          }),
          { headers, status: 500 }
        );
      }

      const prompt = `The user has evaluated their annual carbon footprint.
Breakdown (in Metric Tonnes CO2e/year):
- Transport: ${breakdown.transport} t
- Household Energy: ${breakdown.energy} t
- Diet & Food Choices: ${breakdown.food} t
- Trash & Recycling: ${breakdown.waste} t
---
Total Footprint: ${breakdown.total} tCO2e/year (Local average limits: world avg ~4.5t, US/Western standard avg ~15t, Climate stability goal ~2.0t).

User Habits & Inputs:
- Commuting: Drivers roughly ${inputs.mileage} miles per week in a ${inputs.carType} car.
- Transit: Spends ${inputs.publicTransitHours} hours riding bus/rail weekly.
- Flights: Flies roughly ${inputs.flightsShort} short flights (<4 hrs) and ${inputs.flightsLong} long flights (>=4 hrs) per year.
- Home power: Electric bill is $${inputs.electricityBill}/month, with a clean energy offset contract of ${inputs.cleanEnergyPercentage}%.
- Household heating source: ${inputs.heatingSource}.
- Diet choice: ${inputs.dietType}.
- Grocery organic waste: ${inputs.foodWaste}.
- Materials routinely recycled: ${inputs.recycling.join(", ") || "None listed yet"}.

As a passionate, expert Environmental Sustainability & Energy Coach, analyze this footprint and build a highly customized carbon reduction analysis. Return a strictly validated JSON structure corresponding exactly to this TypeScript interface:

interface AICoachResponse {
  insights: string[]; // Exactly 3 punchy, customized tips. Point out their largest emitting category first, provide a creative heating/electric hack, and give one highly interesting dietary tip with a stat.
  reductionPlan: {
    targetFootprint: number; // Suggested lower CO2 footprint target (in tonnes) that they can hit in 6 months by committing to 2-3 standard remedies.
    recommendedActions: string[]; // Exactly 3 highly specific, action-oriented recommendations matching their profile.
    monthlySavingsForecastKg: number; // Approximate total kg of CO2 they would preserve every month if they execute these.
  };
}

Return ONLY raw JSON. Do not write any markdown blocks, wrappers, or other comments.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text || "{}";
      const cleanData = JSON.parse(responseText.trim());
      return new Response(JSON.stringify(cleanData), { headers, status: 200 });
    } catch (error: any) {
      console.error("AI Insights Error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to generate AI insights on Netlify.",
          details: error.message || String(error),
        }),
        { headers, status: 500 }
      );
    }
  }

  // 3. AI Eco-Coach Intelligent Chat
  if (pathname.includes("/ai/chat")) {
    try {
      if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
          headers,
          status: 405,
        });
      }

      const body = await req.json();
      const { messages, breakdown, inputs } = body;

      if (!messages || !Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: "Missing or invalid messages trace" }), {
          headers,
          status: 400,
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return new Response(
          JSON.stringify({
            error: "Gemini API key is not configured in Netlify Environment Variables.",
          }),
          { headers, status: 500 }
        );
      }

      // Format current history
      const formattedHistory = messages.map((m: any) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const contextString = breakdown
        ? `User Carbon Background: Current Footprint: ${breakdown.total} tonnes CO2e/yr (Transport: ${breakdown.transport}t, Energy: ${breakdown.energy}t, Food: ${breakdown.food}t, Waste: ${breakdown.waste}t). Diet is ${inputs?.dietType}, vehicle is ${inputs?.carType || "unknown"}.`
        : "User is checking carbon metrics.";

      const systemInstruction = `You are a warm, highly certified Environmental Sustainability Coach helping individuals reduce their personal carbon impact.
- Give constructive, actionable advice that remains encouraging, realistic, and scientifically precise.
- Use simple analogies (like equating metric tonnes to car miles on the street, tree growth absorption capacity, or energy units).
- Context: ${contextString}
- Keep responses compact, elegant, and clearly formatted with clean markdown bullet points where appropriate (max 180 words).`;

      // Call Gemini Chat
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedHistory,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return new Response(JSON.stringify({ text: response.text }), { headers, status: 200 });
    } catch (error: any) {
      console.error("AI Coach Chat Error:", error);
      return new Response(
        JSON.stringify({
          error: "Could not answer chat on Netlify.",
          details: error.message || String(error),
        }),
        { headers, status: 500 }
      );
    }
  }

  // Fallback 404
  return new Response(JSON.stringify({ error: "API Route not found" }), {
    headers,
    status: 404,
  });
};
