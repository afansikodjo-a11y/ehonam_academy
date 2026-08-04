import { ExternalLink } from "lucide-react";
import type { PortfolioProduct } from "@/lib/portfolio";

/** Carte "fenêtre de navigateur" pour présenter une réalisation (SaaS en production). */
export default function BrowserFrame({ image, name, tag, desc, Icon, accent, url }: PortfolioProduct) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-panel rounded-2xl border-white/10 overflow-hidden shadow-xl glass-panel-hover group block cursor-pointer"
    >
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5 bg-black/40">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        <div className="ml-3 flex-1 h-5 rounded-md bg-white/5 border border-white/5" />
      </div>
      <div className="aspect-[16/10] overflow-hidden bg-black/20 border-b border-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover object-top group-hover:scale-[1.04] transition-transform duration-700"
        />
      </div>
      <div className="px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${accent}`} />
            <h4 className="text-white font-bold">{name}</h4>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors shrink-0" />
        </div>
        <p className="text-[11px] uppercase tracking-wide text-gray-500 mt-0.5">{tag}</p>
        <p className="text-gray-400 text-xs mt-2 leading-relaxed">{desc}</p>
      </div>
    </a>
  );
}
