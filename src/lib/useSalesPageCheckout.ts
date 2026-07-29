"use client";

// Plomberie commune aux pages de vente sur mesure (/vibe-coding-mastery,
// /formation-affiche-ia) : état de la modale de paiement, CTA sticky au
// scroll, tracking ViewContent, synchronisation prix/titre depuis Supabase,
// et reprise du paiement après un retour de connexion Google (?checkout=1).
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchCourseById } from "@/lib/courses-db";
import { getCourse } from "@/lib/courses";
import { trackFbEvent, parsePriceFCFA } from "@/lib/fb-pixel";

export interface SalesPageInfo {
  price: string;
  originalPrice: string;
  title: string;
}

export function useSalesPageCheckout(courseId: string) {
  const staticCourse = getCourse(courseId);
  const fallback: SalesPageInfo = {
    price: staticCourse?.price ?? "",
    originalPrice: staticCourse?.originalPrice ?? "",
    title: staticCourse?.title ?? "",
  };

  const [info, setInfo] = useState<SalesPageInfo>(fallback);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 720);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    trackFbEvent("ViewContent", {
      value: parsePriceFCFA(fallback.price),
      currency: "XOF",
      content_ids: [courseId],
      content_type: "product",
      content_name: fallback.title,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchCourseById(courseId).then((c) => {
      if (c) setInfo({ price: c.price, originalPrice: c.originalPrice, title: c.title });
    });
  }, [courseId]);

  // Retour d'une connexion Google lancée depuis la modale de paiement : on
  // rouvre directement le paiement, sans repasser par une étape de connexion.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "1") return;
    params.delete("checkout");
    const qs = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setCheckoutOpen(true);
    });
  }, []);

  const handleBuy = () => setCheckoutOpen(true);

  return { info, checkoutOpen, setCheckoutOpen, showSticky, handleBuy };
}
