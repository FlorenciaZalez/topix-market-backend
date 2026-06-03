const WHATSAPP_PHONE = '5491169382561';

export function buildWhatsAppHref(message?: string) {
  if (!message) {
    return `https://wa.me/${WHATSAPP_PHONE}`;
  }

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
