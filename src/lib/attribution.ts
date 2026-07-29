// Attribution publicitaire (UTM + fbclid) capturée à l'arrivée sur le site,
// et identifiant de visiteur anonyme — utilisés pour rattacher les évènements
// pixel à une campagne dans le journal interne (voir /admin/campagnes).
export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
};

const ATTRIBUTION_KEY = "ea_attribution";
const VISITOR_KEY = "ea_visitor_id";
const UTM_FIELDS: (keyof Attribution)[] = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];

/** À appeler une fois au chargement : mémorise l'attribution "first-touch". */
export function captureAttributionFromUrl() {
  try {
    if (localStorage.getItem(ATTRIBUTION_KEY)) return; // déjà capturée (first-touch)
    const params = new URLSearchParams(window.location.search);
    const attribution: Attribution = {};
    for (const field of UTM_FIELDS) {
      const value = params.get(field);
      if (value) attribution[field] = value;
    }
    if (Object.keys(attribution).length > 0) {
      localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
    }
  } catch {}
}

export function getAttribution(): Attribution {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}

export function getOrCreateVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}
