import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MAPBOX_TOKEN = Deno.env.get('MAPBOX_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!MAPBOX_TOKEN) {
      console.error('[places] MAPBOX_TOKEN not configured');
      throw new Error('MAPBOX_TOKEN not configured');
    }

    const url = new URL(req.url);
    const query = url.searchParams.get("q") ?? "";
    const city = url.searchParams.get("city") ?? "";
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? "10"), 1), 10);

    // Validate minimum query length
    if (query.length < 3) {
      console.log('[places] Query too short:', query.length);
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[places] Query: "${query}", City: "${city}", Limit: ${limit}`);

    // Build Mapbox Geocoding API request
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      autocomplete: "true",
      language: "it",
      country: "IT", // Limit to Italy
      types: "address,street,place,locality,neighborhood",
      limit: String(limit)
    });

    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`;
    
    const response = await fetch(mapboxUrl);
    
    if (!response.ok) {
      console.error(`[places] Mapbox API error: ${response.status}`);
      return new Response(JSON.stringify([]), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();

    // Normalize Mapbox results
    const suggestions = (data.features ?? []).map((feature: any) => {
      // Extract context (city, province, postal code, country)
      const context = (feature.context ?? []).reduce((acc: any, c: any) => {
        const type = c.id.split(".")[0];
        acc[type] = c.text;
        return acc;
      }, {});

      return {
        label: feature.place_name,           // "Via Roma 10, 20121 Milano MI, Italia"
        street: feature.text ?? "",          // "Via Roma"
        number: (feature.address ?? "") + "", // "10"
        city: context.place || context.locality || "",
        province: context.region || "",
        postal_code: context.postcode || "",
        country: context.country || "Italia",
        lon: feature.center?.[0] ?? null,
        lat: feature.center?.[1] ?? null,
        provider_id: feature.id
      };
    });

    console.log(`[places] Returning ${suggestions.length} suggestions`);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[places] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
