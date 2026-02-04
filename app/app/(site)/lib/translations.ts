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

  // Bespoke tours
  'bespoke.cardTitle': { en: 'Bespoke Tours', es: 'Tours Personalizados' },
  'bespoke.cardSubtitle': { en: 'Create your perfect Highland adventure', es: 'Crea tu aventura perfecta en las Highlands' },
  'bespoke.title': { en: 'Bespoke Tours', es: 'Tours Personalizados' },
  'bespoke.subtitle': {
    en: 'Design your own Highland experience — choose your destinations, set your pace, and let us handle the rest.',
    es: 'Diseña tu propia experiencia en las Highlands — elige tus destinos, marca tu ritmo y nosotros nos encargamos del resto.',
  },
  'bespoke.galleryTitle': { en: 'Inspiration gallery', es: 'Galería de inspiración' },
  'bespoke.descTitle': { en: 'What you can customise', es: 'Qué puedes personalizar' },
  'bespoke.descIntro': {
    en: "Every bespoke tour is unique. Tell us what you'd love to see and we'll craft the perfect itinerary.",
    es: 'Cada tour personalizado es único. Cuéntanos qué te gustaría ver y crearemos el itinerario perfecto.',
  },
  'bespoke.descBullet1': { en: 'Pick your destinations — Loch Ness, Skye, whisky distilleries, or hidden gems', es: 'Elige tus destinos — Loch Ness, Skye, destilerías de whisky o joyas ocultas' },
  'bespoke.descBullet2': { en: 'Set your own pace — half-day, full-day, or multi-day adventures', es: 'Marca tu propio ritmo — medio día, día completo o aventuras de varios días' },
  'bespoke.descBullet3': { en: 'Special requests welcome — photography stops, accessibility needs, child-friendly routes', es: 'Solicitudes especiales bienvenidas — paradas fotográficas, necesidades de accesibilidad, rutas para niños' },
  'bespoke.whatsappCta': { en: 'Chat on WhatsApp', es: 'Chatea por WhatsApp' },
  'bespoke.orFillForm': { en: 'Or fill out the form below:', es: 'O completa el formulario:' },

  // Transfers page
  'transfers.title': { en: 'Transfers', es: 'Traslados' },
  'transfers.subtitle': { en: 'Airport pickups, hotel transfers and more.', es: 'Recogida en aeropuerto, traslados a hotel y más.' },
  'transfers.noTransfers': { en: 'No transfers yet.', es: 'No hay traslados aún.' },

  // Transfer request / quote
  'transferRequest.cardTitle': { en: 'Request a Quote', es: 'Solicitar Presupuesto' },
  'transferRequest.cardSubtitle': { en: 'Custom transfer to any destination', es: 'Traslado personalizado a cualquier destino' },
  'transferRequest.title': { en: 'Request a Custom Transfer', es: 'Solicita un Traslado Personalizado' },
  'transferRequest.subtitle': {
    en: "Need a transfer to a destination not listed? Tell us where and when - we'll arrange everything.",
    es: '¿Necesitas un traslado a un destino no listado? Dinos dónde y cuándo - nosotros organizamos todo.',
  },
  'transferRequest.galleryTitle': { en: 'We cover all of Scotland', es: 'Cubrimos toda Escocia' },
  'transferRequest.descTitle': { en: 'What to include in your request', es: 'Qué incluir en tu solicitud' },
  'transferRequest.bullet1': { en: 'Pickup location and destination (airport, hotel, cruise port, etc.)', es: 'Lugar de recogida y destino (aeropuerto, hotel, puerto de cruceros, etc.)' },
  'transferRequest.bullet2': { en: 'Date, time and number of passengers', es: 'Fecha, hora y número de pasajeros' },
  'transferRequest.bullet3': { en: 'Any special requirements (child seats, wheelchair access, extra luggage)', es: 'Requisitos especiales (sillas para niños, acceso para silla de ruedas, equipaje extra)' },
  'transferRequest.whatsappCta': { en: 'Chat on WhatsApp', es: 'Chatea por WhatsApp' },
  'transferRequest.orFillForm': { en: 'Or fill out the form below:', es: 'O completa el formulario:' },

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
  'booking.openWhatsApp': { en: 'Open WhatsApp', es: 'Abrir WhatsApp' },
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
  'booking.noVehicles': {
    en: 'No vehicles available for this date. Please choose another date.',
    es: 'No hay vehículos disponibles para esta fecha. Por favor elige otra fecha.',
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
