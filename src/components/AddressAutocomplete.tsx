import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AddressSuggestion {
  label: string;
  street: string;
  number: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  lat: number | null;
  lon: number | null;
  provider_id: string;
}

interface AddressAutocompleteProps {
  city?: string;
  value: string;
  onSelect: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
}

function useDebounced(value: string, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function AddressAutocomplete({
  city,
  value,
  onSelect,
  placeholder = "Via e numero civico...",
  className
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value ?? "");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedQuery = useDebounced(query, 300);

  useEffect(() => {
    async function fetchSuggestions(term: string) {
      if (term.length < 3) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const baseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        const url = new URL(`${baseUrl}/functions/v1/places`);
        url.searchParams.set("q", term);
        if (city) url.searchParams.set("city", city);
        url.searchParams.set("limit", "8");

        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setSuggestions(data);
        setIsOpen(data.length > 0);
      } catch (error) {
        console.error('[AddressAutocomplete] Error:', error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, city]);

  const handleSelect = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.label);
    setIsOpen(false);
    onSelect(suggestion);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 200);
          }}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-md border bg-background shadow-lg">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.provider_id}
              className="px-4 py-3 hover:bg-accent cursor-pointer transition-colors border-b last:border-b-0"
              onMouseDown={() => handleSelect(suggestion)}
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {suggestion.street} {suggestion.number}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {suggestion.postal_code} {suggestion.city} {suggestion.province}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && suggestions.length === 0 && query.length >= 3 && !isLoading && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg p-4">
          <p className="text-sm text-muted-foreground text-center">
            Nessun indirizzo trovato
          </p>
        </div>
      )}
    </div>
  );
}
