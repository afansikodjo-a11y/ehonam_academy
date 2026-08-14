"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2, AlertCircle, CheckCircle2, MessageCircle, Mail, User } from "lucide-react";
import { type ItemType } from "@/lib/purchases-db";
import { submitWaitlistSignup } from "@/lib/waitlist-db";
import { buildWhatsappUrl } from "@/lib/whatsapp";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
  itemTitle: string;
  itemType: ItemType;
  itemId: string;
}

const inputClass =
  "w-full rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/60 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors";

/**
 * Affichée à la place de CheckoutModal quand une formation/un accompagnement
 * est marqué "clôturé" (voir /admin/liste-attente) : recueille les
 * coordonnées pour la prochaine session, avec un accès direct au contact
 * WhatsApp pour ceux qui veulent un accompagnement individuel plus tôt.
 */
export default function WaitlistModal({ open, onClose, itemTitle, itemType, itemId }: WaitlistModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setPhone("");
    setError("");
    setDone(false);
    setLoading(false);
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const err = await submitWaitlistSignup({ itemType, itemId, itemTitle, name, email, phone: phone || undefined });
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setDone(true);
  };

  const individualHref = buildWhatsappUrl(
    `Bonjour, les inscriptions pour « ${itemTitle} » sont fermées mais je souhaiterais un accompagnement individuel. C'est possible ?`
  );

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl border-white/10 overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-emerald-500 to-teal-500"></div>

        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" />
            <span className="text-sm font-black text-white">INSCRIPTIONS FERMÉES</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-white/5"
          >
            Fermer
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Vous êtes sur la liste !</h3>
              <p className="text-sm text-gray-400">
                Vous serez averti(e) dès l'ouverture de la prochaine session pour « {itemTitle} ».
              </p>
            </div>
            <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-white gradient-btn shadow-md text-sm">
              Fermer
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-300 text-center">
              Les inscriptions pour <strong className="text-white">« {itemTitle} »</strong> sont actuellement fermées.
              Laissez vos coordonnées pour être averti(e) à la prochaine session.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@email.com"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Téléphone / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Optionnel"
                  className={inputClass}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white gradient-btn flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clock className="w-5 h-5" />}
                {loading ? "Envoi…" : "Rejoindre la liste d'attente"}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 pt-2 border-t border-white/5">
              Besoin d'un accompagnement individuel plus tôt ?{" "}
              <a
                href={individualHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 inline-flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Contactez-moi sur WhatsApp
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
