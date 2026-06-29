"use client";

import { useEffect, useState } from "react";
import { Shield, Smartphone, CreditCard, ArrowRight, Loader2, Check } from "lucide-react";
import { recordPurchase, type ItemType } from "@/lib/purchases-db";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  /** Name of the item being purchased (formation or accompagnement) */
  itemTitle: string;
  /** Formatted price, e.g. "45 000 FCFA" */
  price: string;
  /** Type & id of the item, used to record the purchase on the user's account */
  itemType: ItemType;
  itemId: string;
  /** Message shown on the success step */
  successMessage?: string;
}

type Step = "method" | "processing" | "success";

/**
 * Reusable Moneroo checkout flow (demo). Used for both formations and
 * accompagnement offers so the payment experience stays consistent.
 * NOTE: the transaction is simulated client-side; real integration must
 * create a Moneroo checkout and rely on the server webhook to grant access.
 */
export default function CheckoutModal({
  open,
  onClose,
  itemTitle,
  price,
  itemType,
  itemId,
  successMessage = "La transaction a été validée avec succès via Moneroo. Vous recevrez les détails par email.",
}: CheckoutModalProps) {
  const [step, setStep] = useState<Step>("method");

  // Restart the flow each time the modal is (re)opened.
  useEffect(() => {
    if (open) setStep("method");
  }, [open]);

  if (!open) return null;

  const selectMethod = (_method: "momo" | "card") => {
    setStep("processing");
    // Simulate the transaction, then record the purchase on the user's account.
    setTimeout(async () => {
      await recordPurchase({ itemType, itemId, title: itemTitle, price });
      setStep("success");
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl border-white/10 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-emerald-500 to-teal-500"></div>

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-black text-white">MONEROO CHECKOUT</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-white/5"
          >
            Fermer
          </button>
        </div>

        {step === "method" && (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <span className="text-xs text-gray-500">Montant à régler</span>
              <h3 className="text-2xl font-black text-white mt-1">{price}</h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">{itemTitle}</p>
            </div>

            <div className="space-y-3.5">
              <button
                onClick={() => selectMethod("momo")}
                className="w-full p-4 rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 flex items-center justify-between text-left group hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Mobile Money</h4>
                    <p className="text-xs text-gray-400">Orange Money, MTN, Moov, Wave, etc.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
              </button>

              <button
                onClick={() => selectMethod("card")}
                className="w-full p-4 rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 flex items-center justify-between text-left group hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Carte Bancaire</h4>
                    <p className="text-xs text-gray-400">Visa, Mastercard, etc.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="p-10 text-center space-y-6">
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
            <div className="space-y-2">
              <h4 className="text-md font-bold text-white">Traitement de la transaction...</h4>
              <p className="text-xs text-gray-400">Veuillez patienter pendant la validation de votre paiement.</p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto border border-emerald-500/30">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">Paiement Réussi !</h4>
              <p className="text-xs text-gray-400">{successMessage}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl font-bold text-white gradient-btn shadow-md"
            >
              Terminer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
