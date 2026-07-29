"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { fetchPixelId } from "@/lib/settings-db";

/**
 * Pixel Facebook (Meta Ads) — suit les vues de page (y compris la navigation
 * côté client, en SPA) pour l'optimisation des campagnes publicitaires.
 * L'ID est réglable depuis /admin/campagnes (table app_settings), avec
 * repli sur NEXT_PUBLIC_FB_PIXEL_ID. Inactif si aucun des deux n'est défini.
 */
export default function FacebookPixel() {
  const pathname = usePathname();
  const firstRender = useRef(true);
  const [pixelId, setPixelId] = useState("");

  useEffect(() => {
    fetchPixelId().then(setPixelId);
  }, []);

  useEffect(() => {
    if (!pixelId) return;
    // Le premier PageView est déjà envoyé par le script d'init ci-dessous ;
    // on ne renvoie un PageView qu'aux changements de page suivants (SPA).
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq?.("track", "PageView");
  }, [pathname, pixelId]);

  if (!pixelId) return null;

  return (
    <>
      <Script id="fb-pixel-init" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
