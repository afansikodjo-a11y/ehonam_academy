// Mémorise qu'une connexion Google vient d'être lancée depuis /login. Si
// Supabase renvoie l'utilisateur ailleurs que sur /login au retour (URL de
// retour non déclarée dans sa liste blanche, changement de domaine, etc.),
// <AuthLandingResume> détecte ce marqueur et renvoie quand même vers la
// bonne page selon le rôle, plutôt que de le laisser sur la page d'accueil.
const KEY = "ea_awaiting_login_redirect";

export function markAwaitingLoginRedirect() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {}
}

export function takeAwaitingLoginRedirect(): boolean {
  try {
    if (sessionStorage.getItem(KEY) !== "1") return false;
    sessionStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}
