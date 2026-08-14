// Numéro WhatsApp du support (Ehonam), au format international sans "+".
export const WHATSAPP_NUMBER = "22891282590";
export const WHATSAPP_DISPLAY = "+228 91 28 25 90";

export function buildWhatsappUrl(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** Lien WhatsApp vers un numéro tiers (ex. contacter un inscrit en liste d'attente). */
export function buildWhatsappUrlTo(phone: string, text: string) {
  const digits = (phone || "").replace(/[^\d+]/g, "").replace(/^\+/, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
