"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, LogOut, Loader2, ListChecks, Clock, BookOpen, Sparkles, Mail, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured, fetchAllCourses, upsertCourse, type AdminCourse } from "@/lib/courses-db";
import { fetchAllCoaching, upsertCoaching, type AdminCoachingOffer } from "@/lib/coaching-db";
import { fetchWaitlistSignups, type WaitlistSignupRow } from "@/lib/waitlist-db";
import { isCurrentUserAdmin } from "@/lib/auth";
import AdminTabs from "@/components/AdminTabs";

type ClosableItem =
  | { kind: "course"; data: AdminCourse }
  | { kind: "coaching"; data: AdminCoachingOffer };

export default function AdminListeAttentePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [offers, setOffers] = useState<AdminCoachingOffer[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [signups, setSignups] = useState<WaitlistSignupRow[]>([]);
  const [loadingSignups, setLoadingSignups] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      if (!(await isCurrentUserAdmin())) {
        router.replace("/");
        return;
      }
      setAuthed(true);
      setReady(true);
      load();
    });
  }, [router]);

  const load = async () => {
    setLoadingItems(true);
    setLoadingSignups(true);
    const [c, o, s] = await Promise.all([fetchAllCourses(), fetchAllCoaching(), fetchWaitlistSignups()]);
    setCourses(c);
    setOffers(o);
    setSignups(s);
    setLoadingItems(false);
    setLoadingSignups(false);
  };

  const items: ClosableItem[] = [
    ...courses.map((data): ClosableItem => ({ kind: "course", data })),
    ...offers.map((data): ClosableItem => ({ kind: "coaching", data })),
  ];

  const toggleClosed = async (item: ClosableItem) => {
    const id = item.data.id;
    setSavingId(id);
    if (item.kind === "course") {
      const updated = { ...item.data, closed: !item.data.closed };
      const err = await upsertCourse(updated);
      if (!err) setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } else {
      const updated = { ...item.data, closed: !item.data.closed };
      const err = await upsertCoaching(updated);
      if (!err) setOffers((prev) => prev.map((o) => (o.id === id ? updated : o)));
    }
    setSavingId(null);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (!ready) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    );
  }
  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">
        Supabase n'est pas configuré.
      </div>
    );
  }
  if (!authed) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <AdminTabs />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Espace Formateur
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Liste d'attente</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Clôturez les inscriptions d'une formation ou d'un accompagnement pour afficher un formulaire de liste d'attente à la place du bouton d'achat.
          </p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 flex items-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>

      {/* Clôture des formations / accompagnements */}
      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-400" />
          <h2 className="text-sm font-bold text-white">Clôturer les inscriptions</h2>
        </div>
        <div className="divide-y divide-white/5">
          {loadingItems ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            </div>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">Aucune formation ni accompagnement pour le moment.</p>
          ) : (
            items.map((item) => (
              <div key={`${item.kind}-${item.data.id}`} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    {item.kind === "course" ? (
                      <BookOpen className="w-4.5 h-4.5 text-emerald-400" />
                    ) : (
                      <Sparkles className="w-4.5 h-4.5 text-orange-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.data.title}</p>
                    <p className="text-xs text-gray-500">{item.kind === "course" ? "Formation" : "Accompagnement"}</p>
                  </div>
                </div>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-300 cursor-pointer shrink-0">
                  {savingId === item.data.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                  ) : (
                    <input
                      type="checkbox"
                      checked={item.data.closed === true}
                      onChange={() => toggleClosed(item)}
                      className="w-4 h-4 accent-orange-500"
                    />
                  )}
                  Clôturé
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inscrits liste d'attente */}
      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Inscrits en liste d'attente</h2>
        </div>
        {loadingSignups ? (
          <div className="p-8 text-center text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        ) : signups.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">Personne pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-3">Nom</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Formation / accompagnement</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {signups.map((s) => (
                  <tr key={s.id}>
                    <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">{s.name}</td>
                    <td className="px-6 py-4 text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        {s.email}
                      </div>
                      {s.phone && (
                        <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                          <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          {s.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{s.item_title || s.item_id}</td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(s.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
