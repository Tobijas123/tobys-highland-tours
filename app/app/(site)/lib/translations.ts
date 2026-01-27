import { useLanguage, type Lang } from './LanguageContext'

// Supported languages: EN (default) + ES
type TranslatedLang = 'en' | 'es'

const translations = {
  // Navigation
  'nav.home': { en: 'Home', es: 'Inicio' },
  'nav.about': { en: 'About', es: 'Nosotros' },
  'nav.tours': { en: 'Tours', es: 'Tours' },
  'nav.transfers': { en: 'Transfers', es: 'Traslados' },

  // Hero
  'hero.title': {
    en: 'Private Tours from Inverness',
    es: 'Tours Privados desde Inverness',
  },
  'hero.subtitle': {
    en: 'Luxury comfort • Local stories • Flexible stops',
    es: 'Confort de lujo • Historias locales • Paradas flexibles',
  },
  'hero.tagline': {
    en: '— flexible stops, local stories, no crowds.',
    es: '— paradas flexibles, historias locales, sin multitudes.',
  },
  'hero.cta': { en: 'Check availability', es: 'Ver disponibilidad' },
  'hero.whatsapp': { en: 'WhatsApp us', es: 'Escríbenos por WhatsApp' },
  'hero.reviews': { en: '5.0 Google Reviews', es: '5.0 Reseñas en Google' },
  'hero.chip.localGuide': { en: 'Local guide', es: 'Guía local' },
  'hero.chip.privateTours': { en: 'Private tours', es: 'Tours privados' },
  'hero.chip.flexibleStops': { en: 'Flexible stops', es: 'Paradas flexibles' },
  'hero.chip.people': { en: '1–7 people', es: '1–7 personas' },

  // Sections
  'section.ourTours': { en: 'Our Tours', es: 'Nuestros Tours' },
  'section.viewAllTours': { en: 'View all tours', es: 'Ver todos los tours' },
  'section.transfers': { en: 'Transfer Services', es: 'Servicios de Traslado' },
  'section.viewAllTransfers': { en: 'View all transfers', es: 'Ver todos los traslados' },
  'section.reviews': { en: 'What guests say', es: 'Lo que dicen nuestros clientes' },

  // Pricing
  'price.1to3': { en: '1–3 people', es: '1–3 personas' },
  'price.4to7': { en: '4–7 people', es: '4–7 personas' },

  // Contact
  'contact.title': { en: 'Contact us', es: 'Contáctanos' },
  'contact.subtitle': {
    en: 'Questions, custom itineraries, last-minute availability—send a message.',
    es: 'Preguntas, itinerarios personalizados, disponibilidad de última hora—envía un mensaje.',
  },
  'contact.name': { en: 'Your name *', es: 'Tu nombre *' },
  'contact.email': { en: 'Your email *', es: 'Tu email *' },
  'contact.phone': { en: 'Phone (optional)', es: 'Teléfono (opcional)' },
  'contact.message': { en: 'Your message *', es: 'Tu mensaje *' },
  'contact.send': { en: 'Send message', es: 'Enviar mensaje' },

  // About page
  'about.title': { en: "About Toby's Highland Tours", es: "Sobre Toby's Highland Tours" },
  'about.intro': {
    en: 'We offer authentic, private tours through the Scottish Highlands. No crowds, no rush — just you, your guide, and the open road.',
    es: 'Ofrecemos tours auténticos y privados por las Tierras Altas de Escocia. Sin multitudes, sin prisas — solo tú, tu guía y el camino abierto.',
  },
  'about.bullet.private': { en: 'Private tours', es: 'Tours privados' },
  'about.bullet.doorToDoor': { en: 'Door-to-door pickup', es: 'Recogida puerta a puerta' },
  'about.bullet.flexible': { en: 'Flexible stops', es: 'Paradas flexibles' },
  'about.whyTitle': { en: 'Why book with us', es: 'Por qué reservar con nosotros' },
  'about.why.smallGroups': { en: 'Small groups', es: 'Grupos pequeños' },
  'about.why.smallGroupsDesc': {
    en: 'Maximum 7 passengers per tour. Personal attention guaranteed.',
    es: 'Máximo 7 pasajeros por tour. Atención personalizada garantizada.',
  },
  'about.why.localKnowledge': { en: 'Local knowledge', es: 'Conocimiento local' },
  'about.why.localKnowledgeDesc': {
    en: 'Your guide knows every hidden gem and local story worth sharing.',
    es: 'Tu guía conoce cada joya oculta e historia local que vale la pena compartir.',
  },
  'about.why.photoStops': { en: 'Photo stops', es: 'Paradas para fotos' },
  'about.why.photoStopsDesc': {
    en: "We stop whenever you see something worth capturing. Your pace, your photos.",
    es: 'Paramos siempre que veas algo que vale la pena capturar. Tu ritmo, tus fotos.',
  },
  'about.why.stressFree': { en: 'Stress-free logistics', es: 'Logística sin estrés' },
  'about.why.stressFreeDesc': {
    en: 'We handle everything — pickup, route, stops. You just enjoy the journey.',
    es: 'Nos encargamos de todo — recogida, ruta, paradas. Tú solo disfruta el viaje.',
  },
  'about.ctaTitle': { en: 'Ready to explore the Highlands?', es: '¿Listo para explorar las Highlands?' },
  'about.ctaSubtitle': {
    en: "Browse our tours or get in touch — we're happy to help plan your perfect trip.",
    es: 'Explora nuestros tours o contáctanos — estaremos encantados de ayudarte a planificar tu viaje perfecto.',
  },
  'about.viewTours': { en: 'View tours', es: 'Ver tours' },
  'about.contactUs': { en: 'Contact us', es: 'Contacto' },

  // Tours page
  'tours.title': { en: 'Tours', es: 'Tours' },
  'tours.subtitle': { en: 'Pick a tour and see details + booking sidebar.', es: 'Elige un tour y ve los detalles + barra de reserva.' },
  'tours.noTours': { en: 'No tours available yet.', es: 'No hay tours disponibles aún.' },
  'tours.filter.all': { en: 'All', es: 'Todos' },
  'tours.filter.popular': { en: 'Most popular', es: 'Más populares' },
  'tours.filter.halfDay': { en: 'Half-day', es: 'Medio día' },
  'tours.filter.fullDay': { en: 'Full-day', es: 'Día completo' },
  'tours.showing': { en: 'Showing', es: 'Mostrando' },
  'tours.tour': { en: 'tour', es: 'tour' },
  'tours.tours': { en: 'tours', es: 'tours' },
  'tours.noMatch': { en: 'No tours match this filter', es: 'No hay tours que coincidan con este filtro' },
  'tours.tryAnother': { en: 'Try another filter or view all tours.', es: 'Prueba otro filtro o ve todos los tours.' },
  'tours.viewAll': { en: 'View all', es: 'Ver todos' },

  // Transfers page
  'transfers.title': { en: 'Transfers', es: 'Traslados' },
  'transfers.subtitle': { en: 'Airport pickups, hotel transfers and more.', es: 'Recogida en aeropuerto, traslados a hotel y más.' },
  'transfers.noTransfers': { en: 'No transfers yet.', es: 'No hay traslados aún.' },

  // Common
  'common.noDescription': { en: 'No description yet.', es: 'Sin descripción aún.' },
  'common.noImage': { en: 'No image', es: 'Sin imagen' },
  'common.tour': { en: 'Tour', es: 'Tour' },
  'common.transfer': { en: 'Transfer', es: 'Traslado' },
  'common.backToTours': { en: '← Back to Tours', es: '← Volver a Tours' },
  'common.highlights': { en: 'Highlights', es: 'Destacados' },

  // Booking widget
  'booking.duration': { en: 'Duration', es: 'Duración' },
  'booking.partySize': { en: 'Party size', es: 'Tamaño del grupo' },
  'booking.people': { en: 'people', es: 'personas' },
  'booking.pickDate': { en: 'Pick a date', es: 'Elige una fecha' },
  'booking.selectedDate': { en: 'Selected date:', es: 'Fecha seleccionada:' },
  'booking.pickupDetails': { en: 'Pickup details', es: 'Detalles de recogida' },
  'booking.yourDetails': { en: 'Your details', es: 'Tus datos' },
  'booking.pax': { en: 'Pax *', es: 'Pasajeros *' },
  'booking.pickupLocation': { en: 'Pickup location *', es: 'Lugar de recogida *' },
  'booking.dropoffLocation': { en: 'Drop-off location *', es: 'Lugar de entrega *' },
  'booking.yourName': { en: 'Your name *', es: 'Tu nombre *' },
  'booking.yourEmail': { en: 'Your email *', es: 'Tu email *' },
  'booking.phone': { en: 'Phone (optional)', es: 'Teléfono (opcional)' },
  'booking.requestBooking': { en: 'Request a booking', es: 'Solicitar reserva' },
  'booking.sending': { en: 'Sending...', es: 'Enviando...' },
  'booking.orContactUs': { en: 'Or contact us directly:', es: 'O contáctanos directamente:' },
  'booking.openGmail': { en: 'Open Gmail', es: 'Abrir Gmail' },
  'booking.openMailApp': { en: 'Open mail app', es: 'Abrir app de correo' },
  'booking.copyEmail': { en: 'Copy email text', es: 'Copiar texto del email' },
  'booking.copied': { en: 'Copied ✓', es: 'Copiado ✓' },
  'booking.requestSent': { en: 'Request Sent!', es: '¡Solicitud enviada!' },
  'booking.confirmationText': {
    en: "We've received your booking request. We'll confirm by email shortly.",
    es: 'Hemos recibido tu solicitud de reserva. Te confirmaremos por email pronto.',
  },
  'booking.bookingId': { en: 'Booking ID:', es: 'ID de reserva:' },
  'booking.fullyBookedMessage': {
    en: "We're fully booked on some dates. Contact us and we'll try to arrange an alternative:",
    es: 'Estamos completos en algunas fechas. Contáctanos e intentaremos buscar una alternativa:',
  },
  'booking.errorTimeout': {
    en: 'Request timed out. Server may be busy. Please try again or use the email option below.',
    es: 'Tiempo de espera agotado. El servidor puede estar ocupado. Inténtalo de nuevo o usa la opción de email.',
  },
  'booking.errorNetwork': {
    en: 'Network error. Please try again or use the email option below.',
    es: 'Error de red. Inténtalo de nuevo o usa la opción de email.',
  },
} as const

type TranslationKey = keyof typeof translations

export function t(key: TranslationKey, lang: Lang): string {
  const entry = translations[key]
  const effectiveLang: TranslatedLang = lang === 'es' ? 'es' : 'en'
  return entry?.[effectiveLang] ?? entry?.en ?? key
}

/**
 * Hook for translations - automatically re-renders when language changes
 */
export function useT() {
  const { lang } = useLanguage()
  return (key: TranslationKey): string => {
    const entry = translations[key]
    const effectiveLang: TranslatedLang = lang === 'es' ? 'es' : 'en'
    return entry?.[effectiveLang] ?? entry?.en ?? key
  }
}

export { translations }
export type { TranslationKey }
