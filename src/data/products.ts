import { BoostPerk } from "@/components/BoostShopCard";

export type Product = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  durationLabel: string;
  perks: BoostPerk[];
  coverUrl: string;
  imageFit?: "cover" | "contain";
  imagePosition?: "center" | "top" | "bottom" | "left" | "right";
  headerHeight?: number | string;
};

export const products: Product[] = [
  {
    id: "boost-daily",
    title: "BOOST Giornaliero",
    subtitle: "Spinta immediata 24h",
    description: "Priorità feed/mappa e +10% payout su missioni idonee.",
    price: "€2,99",
    oldPrice: "€3,79",
    badge: "-20% OGGI",
    durationLabel: "Attivo per 24h",
    perks: [
      { label: "+10% payout (idonee)" },
      { label: "Priorità feed/mappa" },
      { label: "Badge 'Boost Attivo'" }
    ],
    coverUrl: "/images/boost-daily.png",
    imageFit: "cover",
    headerHeight: 220,
  },
  {
    id: "boost-48h",
    title: "BOOST 48h",
    subtitle: "Due giorni di priorità",
    description: "Perfetto per weekend intensi.",
    price: "€4,49",
    oldPrice: "€6,99",
    badge: "-35% WEEKEND",
    durationLabel: "Attivo per 48h",
    perks: [
      { label: "+10% payout (idonee)" },
      { label: "Priorità feed/mappa" }
    ],
    coverUrl: "/images/boost-48h.png",
    imageFit: "cover",
    headerHeight: 220,
  },
  {
    id: "starter-pack",
    title: "Starter Pack",
    subtitle: "Parti con il turbo",
    description: "3× Boost Daily + 2× Skip Cooldown.",
    price: "€6,99",
    oldPrice: "€9,99",
    badge: "PACK",
    durationLabel: "Usi a pacchetto",
    perks: [
      { label: "3× Boost" },
      { label: "2× Skip" }
    ],
    coverUrl: "/images/starter-pack.png",
    imageFit: "contain",
    headerHeight: 200,
  },
  {
    id: "skip-3",
    title: "Skip Cooldown 3×",
    subtitle: "Salta le attese",
    description: "Evita tempi morti tra una missione e l'altra.",
    price: "€1,49",
    badge: "Nuovo",
    durationLabel: "3 usi",
    perks: [
      { label: "Niente attese" }
    ],
    coverUrl: "/images/skip-3.png",
    imageFit: "contain",
    headerHeight: 180,
  },
  {
    id: "scan-plus",
    title: "Scan Radius+",
    subtitle: "Trova missioni più lontane",
    description: "Estende il raggio di ricerca di +3km per 24h.",
    price: "€1,29",
    durationLabel: "24h",
    perks: [
      { label: "+3km raggio" }
    ],
    coverUrl: "/images/scan-plus.png",
    imageFit: "cover",
    headerHeight: 200,
  },
  {
    id: "sidequest-plus",
    title: "SideQuest+ (Mensile)",
    subtitle: "Livello Pro",
    description: "+payout fisso, priorità leggera, pin illimitati, badge pro.",
    price: "€4,99/mese",
    badge: "ABBONAMENTO",
    durationLabel: "Rinnovo mensile",
    perks: [
      { label: "+payout fisso" },
      { label: "Pin illimitati" },
      { label: "Badge Pro" }
    ],
    coverUrl: "/images/sidequest-plus.png",
    imageFit: "cover",
    headerHeight: 220,
  },
];
