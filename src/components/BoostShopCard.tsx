import * as React from "react";
import { ShoppingCart, Zap } from "lucide-react";

export type BoostPerk = { icon?: React.ReactNode; label: string };

export type BoostCardProps = {
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  price?: string;
  oldPrice?: string;
  durationLabel?: string;
  perks?: BoostPerk[];
  legalNote?: string;
  onBuy?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  coverUrl?: string;
  /** cover = riempi sempre; contain = tutta visibile (con possibili bande) */
  imageFit?: "cover" | "contain";
  /** posizione del soggetto nell'immagine */
  imagePosition?: "center" | "top" | "bottom" | "left" | "right";
  /** altezza header (px o CSS length, es. 220 o "14rem" o "30vh") */
  headerHeight?: number | string;
  imageLoading?: "lazy" | "eager";
  className?: string;
};

export function BoostShopCard({
  badge = "-20% OGGI",
  title = "BOOST Giornaliero",
  subtitle = "Potenziatore di energia",
  description = "Aumenta la tua concentrazione per 24 ore. Ottieni +10% di energia e visibilità nelle missioni.",
  price = "€2.99",
  oldPrice = "€3.79",
  durationLabel = "Attivo per 24h",
  perks = [
    { label: "+10% payout su missioni idonee" },
    { label: "Priorità nel feed e nella mappa" },
    { label: "Badge profilo 'Boost Attivo'" },
  ],
  legalNote = "Il bonus si applica solo alle missioni aderenti. Termini e condizioni applicabili.",
  onBuy,
  coverUrl,
  imageFit = "cover",
  imagePosition = "center",
  headerHeight = 220,
  imageLoading = "lazy",
  className = "",
}: BoostCardProps) {
  const [imgError, setImgError] = React.useState(false);

  const headerStyle: React.CSSProperties = {
    height: typeof headerHeight === "number" ? `${headerHeight}px` : headerHeight,
  };

  const objectPosition =
    imagePosition === "top" ? "top" :
    imagePosition === "bottom" ? "bottom" :
    imagePosition === "left" ? "left" :
    imagePosition === "right" ? "right" : "center";

  return (
    <div
      className={[
        "w-[380px] max-w-full h-full flex flex-col rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden hover:scale-[1.01] transition-transform duration-300",
        "focus-within:ring-2 focus-within:ring-black/10",
        className,
      ].join(" ")}
      role="region"
      aria-label={title}
    >
      {/* HEADER: il riquadro è quello della card; l'immagine lo ricopre al 100% */}
      <div
        className="relative overflow-hidden bg-gradient-to-b from-yellow-50 to-orange-100"
        style={headerStyle}
      >
        {/* Immagine a tutta area, tagliata ai bordi del riquadro */}
        {coverUrl && !imgError ? (
          <img
            src={coverUrl}
            alt={title ?? "Immagine prodotto"}
            loading={imageLoading}
            decoding="async"
            className="absolute inset-0 w-full h-full block z-0"
            style={{
              objectFit: imageFit,         // "cover" per riempire sempre il riquadro
              objectPosition,              // posizione del soggetto
            }}
            onError={() => setImgError(true)}
            sizes="(max-width: 420px) 100vw, 380px"
          />
        ) : (
          <div className="absolute inset-0 z-0 flex items-center justify-center text-sm text-black/40 select-none">
            Nessuna immagine
          </div>
        )}

        {/* Sottile glow sopra immagine, sotto i badge */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-transparent to-white/20" />

        {/* Badge sconto: sopra l'immagine */}
        {badge ? (
          <div className="absolute top-4 right-4 z-20 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            {badge}
          </div>
        ) : null}

        {/* Tag Boost: sopra l'immagine */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-full">
          <Zap size={14} aria-hidden />
          <span>Boost</span>
        </div>
      </div>

      {/* CORPO */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-2xl font-extrabold text-gray-900">{title}</h3>
          {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
          {description ? (
            <p className="text-sm text-gray-700 mt-3 leading-snug h-[42px] overflow-hidden">{description}</p>
          ) : null}

          {(price || oldPrice) && (
            <div className="h-12 flex items-end gap-2 mt-4 mb-6">
            {price ? (
              <span className="text-4xl font-extrabold text-gray-900">{price}</span>
            ) : null}
            {oldPrice ? (
              <span className="text-base line-through text-gray-400 font-semibold">{oldPrice}</span>
            ) : null}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onBuy}
          disabled={!onBuy}
          aria-label="Acquista ora"
          className={[
            "w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-2xl font-semibold",
            "hover:bg-gray-800 active:scale-[0.98] transition-all",
            !onBuy ? "opacity-60 cursor-not-allowed" : "",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40",
          ].join(" ")}
        >
          <ShoppingCart size={18} aria-hidden />
          <span>Acquista ora</span>
        </button>

        {durationLabel && (
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>{durationLabel}</span>
            <span>Pagamenti sicuri</span>
          </div>
        )}

        {perks?.length ? (
          <ul className="mt-4 space-y-1 text-xs text-gray-700 min-h-[60px]">
            {perks.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                {p.icon ? <span className="mt-[1px]">{p.icon}</span> : <span>•</span>}
                <span>{p.label}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {legalNote ? (
          <p className="mt-4 text-[11px] text-gray-400 leading-snug">{legalNote}</p>
        ) : null}
      </div>
    </div>
  );
}
