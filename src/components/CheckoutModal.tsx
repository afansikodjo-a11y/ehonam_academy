"use client";

import { useEffect, useState } from "react";
import { Shield, Loader2, AlertCircle, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { type ItemType } from "@/lib/purchases-db";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  itemTitle: string;
  price: string;
  itemType: ItemType;
  itemId: string;
  /** Unused now (success is handled on return from Moneroo) — kept for compatibility. */
  successMessage?: string;
}

/**
 * Initialises a real Moneroo payment for the signed-in user and redirects to
 * the hosted checkout (card / Mobile Money). Access is granted by the webhook
 * once the payment is confirmed.
 */
export default function CheckoutModal({ open, onClose, itemTitle, price, itemType, itemId }: CheckoutModalProps) {
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    let active = true;

    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        window.location.href = "/login";
        return;
      }
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sess.session.access_token}`,
          },
          body: JSON.stringify({ itemType, itemId }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.checkoutUrl) {
          throw new Error(data.error || "Le paiement n'a pas pu être initié.");
        }
        // Mémorise l'ID du paiement pour le confirmer au retour (filet de
        // sécurité indépendant du webhook).
        if (data.paymentId) {
          try {
            localStorage.setItem("ea_pending_payment", String(data.paymentId));
          } catch {}
        }
        window.location.href = data.checkoutUrl; // → page de paiement Moneroo
      } catch (e: any) {
        if (active) setError(e.message || "Le paiement n'a pas pu être initié.");
      }
    })();

    return () => {
      active = false;
    };
  }, [open, itemType, itemId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl border-white/10 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-emerald-500 to-teal-500"></div>

        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-black text-white">PAIEMENT SÉCURISÉ</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-white/5"
          >
            Fermer
          </button>
        </div>

        {error ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertCircle className="w-7 h-7 text-rose-400" />
            </div>
            <p className="text-sm text-gray-300">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-white gradient-btn shadow-md text-sm"
            >
              Réessayer plus tard
            </button>
          </div>
        ) : (
          <div className="p-10 text-center space-y-6">
            <div className="text-center">
              <span className="text-xs text-gray-500">Montant</span>
              <h3 className="text-2xl font-black text-white mt-1">{price}</h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">{itemTitle}</p>
            </div>
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="text-md font-bold text-white flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                Redirection vers le paiement…
              </h4>
              <p className="text-xs text-gray-400">
                Vous allez être redirigé vers la page sécurisée Moneroo (Carte / Mobile Money).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
