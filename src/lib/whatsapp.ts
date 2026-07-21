// Numéro WhatsApp du support (Ehonam), au format international sans "+".
export const WHATSAPP_NUMBER = "22891282590";
export const WHATSAPP_DISPLAY = "+228 91 28 25 90";

export function buildWhatsappUrl(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
