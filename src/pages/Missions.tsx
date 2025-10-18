import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fallbackMissions as rawFallbackMissions } from "@/lib/dashboardFallback";
import { MissionCardV2 } from "@/components/MissionCardV2";
import {
  ArrowLeft,
  Search,
  Plus,
} from "lucide-react";

const PAGE_SIZE = 6;

type MissionCategoryKey = "delivery" | "pet" | "shopping" | "handyman" | "cleaning" | "moving" | "other";

interface MissionQueryRow {
  id: string;
  title: string;
  description: string;
  price: number | null;
  location: string;
  duration_hours: number | null;
  mission_categories: {
    name: string | null;
  } | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    rating_average: number | null;
  } | null;
}

interface MissionListItem {
  id: string;
  title: string;
  description: string;
  category: MissionCategoryKey;
  location: string;
  duration: string;
  price: number;
  ownerRating: number;
  ownerName: string;
}

const categoryNameToKey = (source?: string | null): MissionCategoryKey => {
  if (!source) return "other";
  const normalized = source.toLowerCase();
  if (normalized.includes("conseg")) return "delivery";
  if (normalized.includes("deliver")) return "delivery";
  if (normalized.includes("pet") || normalized.includes("dog")) return "pet";
  if (normalized.includes("spesa") || normalized.includes("shop") || normalized.includes("assist")) return "shopping";
  if (normalized.includes("puliz")) return "cleaning";
  if (normalized.includes("trasl") || normalized.includes("move")) return "moving";
  if (normalized.includes("mont") || normalized.includes("hand") || normalized.includes("faleg")) return "handyman";
  return "other";
};

const formatDuration = (hours: number | null | undefined): string => {
  if (!hours || hours <= 0) return "Durata flessibile";
  if (hours <= 1) return "~1h";
  if (hours <= 2) return "1-2h";
  if (hours <= 4) return "2-4h";
  return `${hours}h+`;
};

// MissionCard component removed - using MissionCardV2 instead

const FilterChip = ({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <Badge
    variant={active ? "default" : "outline"}
    className={`cursor-pointer transition-bounce hover:scale-105 ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-transparent text-muted-foreground hover:bg-muted border-border"
    }`}
    onClick={onClick}
  >
    {label}
  </Badge>
);

const filters = [
  { id: "all", label: "Tutte" },
  { id: "delivery", label: "Consegne" },
  { id: "pet", label: "Pet sitting" },
  { id: "shopping", label: "Spesa" },
  { id: "handyman", label: "Lavori" },
  { id: "cleaning", label: "Pulizie" },
  { id: "moving", label: "Traslochi" }
];

const Missions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const fallbackNotifiedRef = useRef(false);

  // Realtime subscription for new missions
  useEffect(() => {
    const channel = supabase
      .channel('missions-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'missions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['missions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const missionsQuery = useInfiniteQuery({
    queryKey: ['missions', searchQuery, activeFilter],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0, queryKey }) => {
      const [, searchTerm, filter] = queryKey as [string, string, string];
      const start = pageParam * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      let query = supabase
        .from('missions')
        .select(`
          id,
          title,
          description,
          price,
          location,
          duration_hours,
          mission_categories(name),
          profiles!missions_owner_id_fkey(first_name, last_name, rating_average)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .range(start, end);

      if (searchTerm) {
        const normalized = searchTerm.trim();
        query = query.or(`title.ilike.%${normalized}%,description.ilike.%${normalized}%,location.ilike.%${normalized}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const mapped = (data as MissionQueryRow[] | null)?.map((mission) => ({
        id: mission.id,
        title: mission.title,
        description: mission.description,
        category: categoryNameToKey(mission.mission_categories?.name),
        location: mission.location,
        duration: formatDuration(mission.duration_hours),
        price: Number(mission.price ?? 0),
        ownerRating: mission.profiles?.rating_average ?? 5,
        ownerName: `${mission.profiles?.first_name ?? ''} ${mission.profiles?.last_name ?? ''}`.trim() || 'SideQuest creator'
      })) ?? [];

      if (filter === 'all') {
        return mapped;
      }

      return mapped.filter((mission) => mission.category === filter);
    },
    getNextPageParam: (lastPage, pages) => (lastPage.length < PAGE_SIZE ? undefined : pages.length)
  });

  const missionsFromBackend = useMemo(() => missionsQuery.data?.pages.flat() ?? [], [missionsQuery.data]);

  const fallbackMissions = useMemo<MissionListItem[]>(() => {
    return rawFallbackMissions.map((mission) => ({
      id: mission.id,
      title: mission.title,
      description: mission.description,
      category: categoryNameToKey(mission.mission_categories?.name),
      location: mission.location,
      duration: "Durata flessibile",
      price: mission.price,
      ownerRating: mission.profiles?.rating_average ?? 5,
      ownerName: `${mission.profiles?.first_name ?? ''} ${mission.profiles?.last_name ?? ''}`.trim() || 'SideQuest creator'
    }));
  }, []);

  const normalizedSearch = searchQuery.toLowerCase();

  const filteredBackend = useMemo(() => {
    return missionsFromBackend.filter((mission) => {
      if (activeFilter !== 'all' && mission.category !== activeFilter) {
        return false;
      }
      return (
        mission.title.toLowerCase().includes(normalizedSearch) ||
        mission.description.toLowerCase().includes(normalizedSearch) ||
        mission.location.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [missionsFromBackend, normalizedSearch, activeFilter]);

  const filteredFallback = useMemo(() => {
    return fallbackMissions.filter((mission) => {
      if (activeFilter !== 'all' && mission.category !== activeFilter) {
        return false;
      }
      return (
        mission.title.toLowerCase().includes(normalizedSearch) ||
        mission.description.toLowerCase().includes(normalizedSearch) ||
        mission.location.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [fallbackMissions, normalizedSearch, activeFilter]);

  const usingFallback = filteredBackend.length === 0 && (
    missionsQuery.status === 'error' || (!missionsQuery.isLoading && missionsFromBackend.length === 0)
  );
  const missionsToDisplay = usingFallback ? filteredFallback : filteredBackend;

  useEffect(() => {
    if (!usingFallback || fallbackNotifiedRef.current) {
      return;
    }

    toast({
      title: 'Modalità demo attiva',
      description: 'Mostriamo missioni di esempio finché il catalogo non è disponibile.',
    });
    fallbackNotifiedRef.current = true;
  }, [usingFallback, toast]);

  return (
    <div className="min-h-screen bg-background lg:ml-64 pb-20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Missioni disponibili</h1>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca missioni per titolo, descrizione o zona"
              className="pl-10 bg-muted/50 border-0 focus:bg-card transition-smooth"
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              active={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            />
          ))}
        </div>

        {usingFallback && (
          <Badge variant="outline" className="w-fit">Modalità demo</Badge>
        )}

        {missionsQuery.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : missionsToDisplay.length ? (
          <div className="space-y-4">
            {missionsToDisplay.map((mission) => (
              <MissionCardV2
                key={mission.id}
                title={mission.title}
                description={mission.description}
                price={mission.price}
                escrowAmount={mission.price}
                isKYCVerified={false}
                rating={mission.ownerRating}
                reviewCount={0}
                location={mission.location}
                deadline={mission.duration}
                category={mission.category}
                onAccept={() => {
                  if (mission.id.startsWith('fallback-')) {
                    toast({
                      title: "Missione demo",
                      description: "Questa è una missione di esempio. Crea una missione reale per iniziare!",
                      variant: "default"
                    });
                    return;
                  }
                  navigate(`/missions/${mission.id}`);
                }}
              />
            ))}
            {!usingFallback && missionsQuery.hasNextPage && (
              <Button
                onClick={() => missionsQuery.fetchNextPage()}
                disabled={missionsQuery.isFetchingNextPage}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                {missionsQuery.isFetchingNextPage ? 'Caricamento...' : 'Carica altre missioni'}
              </Button>
            )}
          </div>
        ) : (
          <Card className="p-6 text-center bg-card border-dashed border-border/60">
            <h3 className="text-lg font-semibold text-foreground mb-2">Nessuna missione trovata</h3>
            <p className="text-sm text-muted-foreground">
              Prova a modificare i filtri o il termine di ricerca.
            </p>
          </Card>
        )}
      </div>

      <Button
        className="floating-button"
        onClick={() => navigate('/create-mission')}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default Missions;
