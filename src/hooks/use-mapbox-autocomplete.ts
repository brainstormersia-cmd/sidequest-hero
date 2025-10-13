import { useEffect, useMemo, useRef, useState } from "react";

export interface MapboxSuggestion {
  id: string;
  placeName: string;
  primaryText: string;
  secondaryText: string;
  longitude: number;
  latitude: number;
}

interface MapboxFeatureContext {
  id?: string;
  text?: string;
}

interface MapboxFeature {
  id?: string;
  place_name?: string;
  text?: string;
  center?: [number, number];
  context?: MapboxFeatureContext[];
  place_type?: string[];
}

interface MapboxGeocodeResponse {
  features?: MapboxFeature[];
}

interface UseMapboxAutocompleteOptions {
  proximity?: string;
  limit?: number;
  enabled?: boolean;
  language?: string;
}

interface UseMapboxAutocompleteResult {
  suggestions: MapboxSuggestion[];
  isLoading: boolean;
  error: string | null;
}

const MAPBOX_GEOCODING_BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places";

export function useMapboxAutocomplete(
  query: string,
  options: UseMapboxAutocompleteOptions = {}
): UseMapboxAutocompleteResult {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const normalizedOptions = useMemo(
    () => ({
      limit: options.limit ?? 6,
      proximity: options.proximity,
      enabled: options.enabled ?? true,
      language: options.language ?? "it",
    }),
    [options.enabled, options.language, options.limit, options.proximity]
  );

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!normalizedOptions.enabled) {
      setSuggestions([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError("Mapbox access token non configurato");
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    if (trimmedQuery.length < 3) {
      setSuggestions([]);
      setError(null);
      setIsLoading(false);
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    let isActive = true;

    const params = new URLSearchParams({
      access_token: token,
      autocomplete: "true",
      limit: normalizedOptions.limit.toString(),
      language: normalizedOptions.language,
      types: "address,place,locality,neighborhood,postcode",
    });

    if (normalizedOptions.proximity) {
      params.append("proximity", normalizedOptions.proximity);
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${MAPBOX_GEOCODING_BASE}/${encodeURIComponent(trimmedQuery)}.json?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Mapbox error ${response.status}`);
        }

        const data = (await response.json()) as MapboxGeocodeResponse;
        if (!isActive) {
          return;
        }

        const features = Array.isArray(data?.features) ? data.features : [];

        const mapped: MapboxSuggestion[] = features.map((feature) => {
          const context = Array.isArray(feature?.context)
            ? feature.context
                .map((ctx) => ctx?.text)
                .filter(Boolean)
                .join(" · ")
            : "";

          const secondary = context || feature.place_type?.[0] || "";

          const [lng, lat] = Array.isArray(feature?.center) && feature.center.length === 2
            ? feature.center
            : [0, 0];

          return {
            id: String(feature?.id ?? feature?.place_name ?? Math.random()),
            placeName: String(feature?.place_name ?? ""),
            primaryText: String(feature?.text ?? feature?.place_name ?? ""),
            secondaryText: context ? context : secondary,
            longitude: Number(lng),
            latitude: Number(lat),
          };
        });

        setSuggestions(mapped);
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        const message = error instanceof Error ? error.message : "Errore di geocoding";
        setError(message);
        setSuggestions([]);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      isActive = false;
      controller.abort();
      abortRef.current = null;
    };
  }, [normalizedOptions, query, token]);

  return {
    suggestions,
    isLoading,
    error,
  };
}
