// Mémorise un achat en cours avant un aller-retour OAuth (Google). Le fournisseur
// d'identité peut renvoyer l'utilisateur ailleurs que sur la page demandée (ex. si
// l'URL de retour n'est pas dans la liste blanche Supabase) : on reprend quand même
// le paiement grâce à cette trace, plutôt que de dépendre de l'URL de redirection.
export type PendingCheckout = { itemType: "course" | "coaching"; itemId: string; returnPath: string };

const KEY = "ea_pending_checkout";

export function setPendingCheckout(p: PendingCheckout) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

export function takePendingCheckout(): PendingCheckout | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    localStorage.removeItem(KEY);
    return JSON.parse(raw) as PendingCheckout;
  } catch {
    return null;
  }
}
