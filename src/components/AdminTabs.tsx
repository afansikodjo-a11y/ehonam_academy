"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Sparkles, Newspaper } from "lucide-react";

const TABS = [
  { href: "/admin", label: "Formations", icon: BookOpen },
  { href: "/admin/accompagnements", label: "Accompagnements", icon: Sparkles },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
];

export default function AdminTabs() {
  const pathname = usePathname();
  return (
    <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 gap-1">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
              active
                ? "gradient-btn text-white shadow-md"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
