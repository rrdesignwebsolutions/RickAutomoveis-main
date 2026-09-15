export const WHATSAPP_NUMBER = "553591823222"; // +55 35 9182-3222
export const PHONE_DISPLAY = "(35) 9182-3222";
export const CONTACT_EMAIL = "rick@rickautomoveis.com.br";

export function whatsappLink(message?: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export const ADDRESS_LINE1 = "R. Dr. Luiz Rennó, 225 - Avenida";
export const ADDRESS_LINE2 = "Itajubá - MG, 37504-050";
export const ADDRESS_FULL = "R. Dr. Luiz Rennó, 225 - Avenida, Itajubá - MG, 37504-050";

const MAPS_QUERY = encodeURIComponent(ADDRESS_FULL);
export const GOOGLE_MAPS_EMBED_SRC = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`;
export const GOOGLE_MAPS_DIRECTIONS_LINK = `https://www.google.com/maps/dir/?api=1&destination=${MAPS_QUERY}`;

// iOS opens Apple Maps' own app-linking scheme; other platforms fall back to Google Maps
export function getDirectionsLink(): string {
  if (typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    return `https://maps.apple.com/?daddr=${MAPS_QUERY}`;
  }
  return GOOGLE_MAPS_DIRECTIONS_LINK;
}

