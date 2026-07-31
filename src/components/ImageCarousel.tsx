"use client";

// Galerie en défilement continu, réutilisée par les pages de vente
// (formation-affiche-ia, formation-photo-portrait-ia). Accepte un nombre
// illimité d'images ; tant qu'un fichier n'existe pas encore dans /public,
// la carte retombe sur un mockup de remplacement — aucun risque d'image
// cassée pendant que le contenu réel est ajouté progressivement.
import { useState } from "react";

export interface GalleryItem {
  src: string;
  tag: string;
}

function GalleryCard({
  src,
  tag,
  cardClassName,
  Fallback,
  fallbackIndex,
}: {
  src: string;
  tag: string;
  cardClassName: string;
  Fallback: React.ComponentType<{ type: number }>;
  fallbackIndex: number;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cardClassName}>
      {failed ? (
        <Fallback type={fallbackIndex} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={tag}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      {!failed && (
        <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
          {tag}
        </span>
      )}
    </div>
  );
}

export function ImageCarousel({
  items,
  fallbackCount,
  Fallback,
  cardClassName = "w-40 sm:w-52 aspect-[3/4] rounded-xl overflow-hidden shadow-lg shrink-0 relative",
}: {
  items: GalleryItem[];
  /** Nombre de variantes visuelles du mockup de remplacement (pour varier le repli). */
  fallbackCount: number;
  Fallback: React.ComponentType<{ type: number }>;
  cardClassName?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="vibe-marquee">
      <div className="vibe-marquee-track gap-4">
        {doubled.map((item, i) => (
          <GalleryCard
            key={i}
            src={item.src}
            tag={item.tag}
            cardClassName={cardClassName}
            Fallback={Fallback}
            fallbackIndex={i % fallbackCount}
          />
        ))}
      </div>
    </div>
  );
}
