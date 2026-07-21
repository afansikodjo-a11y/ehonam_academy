"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageCircle, Check, ArrowLeft, Clock, ShieldCheck } from "lucide-react";
import { WHATSAPP_DISPLAY, buildWhatsappUrl } from "@/lib/whatsapp";

const SUBJECTS = [
  "Question sur une formation",
  "Accompagnement privé",
  "Partenariat",
  "Autre",
];

const inputClass =
  "w-full rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500/60 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors";

export default function ContactPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: SUBJECTS[0],
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [lastUrl, setLastUrl] = useState("");

  const update = (field: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lines = [
      "Nouveau message depuis Ehonam Academy",
      "",
      `Nom : ${form.name}`,
      `Email : ${form.email}`,
      form.phone ? `Téléphone : ${form.phone}` : "",
      `Sujet : ${form.subject}`,
      "",
      "Message :",
      form.message,
    ].filter((l) => l !== "");

    const url = buildWhatsappUrl(lines.join("\n"));
    setLastUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l'accueil
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
        {/* Left: intro + reassurance + direct WhatsApp */}
        <div className="lg:col-span-2 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-300">
            <Mail className="w-3.5 h-3.5" />
            Contact
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Parlons de votre <span className="gradient-text">projet</span>
          </h1>
          <p className="text-gray-400 leading-relaxed">
            Une question sur une formation, besoin d'un accompagnement sur-mesure ou d'une proposition de
            partenariat ? Votre message m'arrive directement sur WhatsApp et je vous réponds rapidement.
          </p>

          <ul className="space-y-4 pt-2">
            {[
              { icon: Clock, title: "Réponse sous 24h", desc: "Du lundi au samedi." },
              { icon: MessageCircle, title: "Réponse directe sur WhatsApp", desc: WHATSAPP_DISPLAY },
              { icon: ShieldCheck, title: "Données confidentielles", desc: "Vos informations restent privées." },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <a
            href={buildWhatsappUrl("Bonjour, je vous contacte depuis Ehonam Academy.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white gradient-btn shadow-md text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Discuter directement sur WhatsApp
          </a>
        </div>

        {/* Right: form card */}
        <div className="lg:col-span-3">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 gradient-btn"></div>

            {sent ? (
              <div className="py-10 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">WhatsApp s'ouvre…</h3>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto">
                    Votre message est pré-rempli. Appuyez simplement sur <span className="text-white font-semibold">Envoyer</span> dans
                    WhatsApp pour finaliser. Si rien ne s'est ouvert :
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <a
                    href={lastUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl font-bold text-white gradient-btn shadow-md text-sm inline-flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Ouvrir WhatsApp
                  </a>
                  <button
                    onClick={() => setSent(false)}
                    className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                  >
                    Modifier mon message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nom complet *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Votre nom"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="vous@email.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Téléphone / WhatsApp</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="Optionnel"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sujet</label>
                    <select
                      value={form.subject}
                      onChange={(e) => update("subject", e.target.value)}
                      className={inputClass}
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="Décrivez votre besoin ou votre question…"
                    className={`${inputClass} resize-y`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl font-bold text-white gradient-btn flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Envoyer sur WhatsApp
                </button>
                <p className="text-center text-xs text-gray-500">
                  Votre message s'ouvre dans WhatsApp, prêt à être envoyé.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
