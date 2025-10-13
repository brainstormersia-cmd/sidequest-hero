import { useState } from "react";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const LocationAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Inizia a digitare via o città..." 
}: LocationAutocompleteProps) => {
  const [search, setSearch] = useState(value);
  
  const { data: suggestions = [] } = useQuery({
    queryKey: ['streets-autocomplete', search],
    queryFn: async () => {
      if (search.length < 3) return [];
      
      const { data, error } = await supabase
        .from('streets')
        .select('id, street_name, city, postal_code')
        .or(`street_name.ilike.%${search}%,city.ilike.%${search}%`)
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: search.length >= 3
  });
  
  return (
    <Command className="border rounded-lg">
      <CommandInput
        placeholder={placeholder}
        value={search}
        onValueChange={(val) => {
          setSearch(val);
          onChange(val);
        }}
      />
      <CommandList>
        <CommandEmpty>
          {search.length < 3 
            ? "Inserisci almeno 3 caratteri..." 
            : "Nessuna via trovata"}
        </CommandEmpty>
        {suggestions.map((s) => (
          <CommandItem
            key={s.id}
            onSelect={() => {
              const full = `${s.street_name}, ${s.city} ${s.postal_code}`;
              setSearch(full);
              onChange(full);
            }}
          >
            <span className="font-medium">{s.street_name}</span>
            <span className="text-muted-foreground ml-2">{s.city} {s.postal_code}</span>
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  );
};
