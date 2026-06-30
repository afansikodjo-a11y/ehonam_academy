// ──────────────────────────────────────────────────────────────
// Notifications d'achat (côté serveur uniquement).
// Envoie une alerte WhatsApp à l'admin via CallMeBot à chaque NOUVELLE vente.
// Activé seulement si WHATSAPP_PHONE + CALLMEBOT_APIKEY sont définis,
// sinon c'est un no-op (rien ne casse avant configuration).
// ──────────────────────────────────────────────────────────────

const PHONE = process.env.WHATSAPP_PHONE || "";
const APIKEY = process.env.CALLMEBOT_APIKEY || "";

export interface PurchaseNotice {
  title: string;
  price: string;
  email: string;
  itemType: string; // "course" | "coaching"
}

/** Envoie l'alerte WhatsApp. Best-effort : n'interrompt jamais le flux d'achat. */
export async function notifyNewPurchase(p: PurchaseNotice): Promise<void> {
  if (!PHONE || !APIKEY) return; // non configuré → on ne fait rien

  try {
    const type = p.itemType === "coaching" ? "Accompagnement" : "Formation";
    const when = new Date().toLocaleString("fr-FR", { timeZone: "Africa/Lome" });
    const text =
      `🟢 Nouvelle vente — Ehonam Academy\n\n` +
      `📚 ${type} : ${p.title || "—"}\n` +
      `💰 ${p.price || "—"}\n` +
      `📧 ${p.email || "—"}\n` +
      `🕒 ${when}`;

    const url =
      `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(PHONE)}` +
      `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(APIKEY)}`;

    await fetch(url, { method: "GET" });
  } catch (err) {
    console.error("[notify] échec notification WhatsApp:", err);
  }
}
