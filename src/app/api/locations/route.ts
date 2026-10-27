// src/app/api/locations/route.ts
// Public read-only API endpoint for global countries, states/regions, and cities.
// Serves hierarchical selectors with zero external API dependencies.

import { NextRequest, NextResponse } from "next/server";
import {
  COUNTRIES,
  getStatesForCountry,
  getCitiesForState,
  resolveLocationAliases,
} from "@/lib/supabase/locations-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const state = searchParams.get("state");
    const query = searchParams.get("q");

    // 1. Alias expansion search
    if (query) {
      const resolved = resolveLocationAliases(query);
      return NextResponse.json({ query, matchedTerms: resolved });
    }

    // 2. Cities for a state
    if (country && state) {
      const cities = getCitiesForState(country, state);
      return NextResponse.json(cities, {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
      });
    }

    // 3. States for a country
    if (country) {
      const states = getStatesForCountry(country);
      return NextResponse.json(states, {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
      });
    }

    // 4. All supported countries
    return NextResponse.json(COUNTRIES, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch (error) {
    console.error("Error in /api/locations:", error);
    return NextResponse.json({ error: "Failed to load location data" }, { status: 500 });
  }
}
