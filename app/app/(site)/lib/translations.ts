import type { Lang } from './LanguageContext'

// Only en and pl have actual translations; other languages fallback to en
type TranslatedLang = 'en' | 'pl'

const translations = {
  // Navigation
  'nav.home': { en: 'Home', pl: 'Strona' },
  'nav.about': { en: 'About', pl: 'O nas' },
  'nav.tours': { en: 'Tours', pl: 'Wycieczki' },
  'nav.transfers': { en: 'Transfers', pl: 'Transfery' },

  // Hero
  'hero.title': {
    en: 'Private Tours from Inverness',
    pl: 'Prywatne wycieczki z Inverness',
  },
  'hero.subtitle': {
    en: 'Luxury comfort \u2022 Local stories \u2022 Flexible stops',
    pl: 'Luksusowy komfort \u2022 Lokalne historie \u2022 Elastyczne przystanki',
  },
  'hero.tagline': {
    en: '\u2014 flexible stops, local stories, no crowds.',
    pl: '\u2014 elastyczne przystanki, lokalne historie, bez t\u0142um\u00f3w.',
  },
  'hero.cta': { en: 'Check availability', pl: 'Sprawd\u017a dost\u0119pno\u015b\u0107' },
  'hero.whatsapp': { en: 'WhatsApp us', pl: 'Napisz na WhatsApp' },
  'hero.reviews': { en: '5.0 Google Reviews', pl: '5.0 Opinie Google' },
  'hero.chip.localGuide': { en: 'Local guide', pl: 'Lokalny przewodnik' },
  'hero.chip.privateTours': { en: 'Private tours', pl: 'Prywatne wycieczki' },
  'hero.chip.flexibleStops': { en: 'Flexible stops', pl: 'Elastyczne przystanki' },
  'hero.chip.people': { en: '1\u20137 people', pl: '1\u20137 os\u00f3b' },

  // Sections
  'section.ourTours': { en: 'Our Tours', pl: 'Nasze wycieczki' },
  'section.viewAllTours': { en: 'View all tours', pl: 'Zobacz wszystkie' },
  'section.transfers': { en: 'Transfer Services', pl: 'Us\u0142ugi transferowe' },
  'section.viewAllTransfers': { en: 'View all transfers', pl: 'Zobacz wszystkie' },
  'section.reviews': { en: 'What guests say', pl: 'Co m\u00f3wi\u0105 go\u015bcie' },

  // Pricing
  'price.1to3': { en: '1\u20133 people', pl: '1\u20133 osoby' },
  'price.4to7': { en: '4\u20137 people', pl: '4\u20137 os\u00f3b' },

  // Contact
  'contact.title': { en: 'Contact us', pl: 'Skontaktuj si\u0119' },
  'contact.subtitle': {
    en: 'Questions, custom itineraries, last-minute availability\u2014send a message.',
    pl: 'Pytania, niestandardowe trasy, dost\u0119pno\u015b\u0107 last minute\u2014napisz wiadomo\u015b\u0107.',
  },
  'contact.name': { en: 'Your name *', pl: 'Twoje imi\u0119 *' },
  'contact.email': { en: 'Your email *', pl: 'Tw\u00f3j email *' },
  'contact.phone': { en: 'Phone (optional)', pl: 'Telefon (opcjonalnie)' },
  'contact.message': { en: 'Your message *', pl: 'Twoja wiadomo\u015b\u0107 *' },
  'contact.send': { en: 'Send message', pl: 'Wy\u015blij wiadomo\u015b\u0107' },

  // About page
  'about.title': { en: "About Toby's Highland Tours", pl: "O Toby's Highland Tours" },
  'about.intro': {
    en: 'We offer authentic, private tours through the Scottish Highlands. No crowds, no rush \u2014 just you, your guide, and the open road.',
    pl: 'Oferujemy autentyczne, prywatne wycieczki po szkockich Highlands. Bez t\u0142um\u00f3w, bez po\u015bpiechu \u2014 tylko Ty, Tw\u00f3j przewodnik i otwarta droga.',
  },
  'about.bullet.private': { en: 'Private tours', pl: 'Prywatne wycieczki' },
  'about.bullet.doorToDoor': { en: 'Door-to-door pickup', pl: 'Odbi\u00f3r spod drzwi' },
  'about.bullet.flexible': { en: 'Flexible stops', pl: 'Elastyczne przystanki' },
  'about.whyTitle': { en: 'Why book with us', pl: 'Dlaczego my' },
  'about.why.smallGroups': { en: 'Small groups', pl: 'Ma\u0142e grupy' },
  'about.why.smallGroupsDesc': {
    en: 'Maximum 7 passengers per tour. Personal attention guaranteed.',
    pl: 'Maksymalnie 7 pasa\u017cer\u00f3w. Gwarantujemy indywidualne podej\u015bcie.',
  },
  'about.why.localKnowledge': { en: 'Local knowledge', pl: 'Lokalna wiedza' },
  'about.why.localKnowledgeDesc': {
    en: 'Your guide knows every hidden gem and local story worth sharing.',
    pl: 'Tw\u00f3j przewodnik zna ka\u017cdy ukryty skarb i lokaln\u0105 histori\u0119.',
  },
  'about.why.photoStops': { en: 'Photo stops', pl: 'Przystanki na zdj\u0119cia' },
  'about.why.photoStopsDesc': {
    en: "We stop whenever you see something worth capturing. Your pace, your photos.",
    pl: 'Zatrzymujemy si\u0119 kiedy widzisz co\u015b wartego uwiecznienia. Tw\u00f3j rytm, Twoje zdj\u0119cia.',
  },
  'about.why.stressFree': { en: 'Stress-free logistics', pl: 'Logistyka bez stresu' },
  'about.why.stressFreeDesc': {
    en: 'We handle everything \u2014 pickup, route, stops. You just enjoy the journey.',
    pl: 'Zajmujemy si\u0119 wszystkim \u2014 odbi\u00f3r, trasa, przystanki. Ty ciesz si\u0119 podr\u00f3\u017c\u0105.',
  },
  'about.ctaTitle': { en: 'Ready to explore the Highlands?', pl: 'Gotowy na odkrywanie Highlands?' },
  'about.ctaSubtitle': {
    en: "Browse our tours or get in touch \u2014 we're happy to help plan your perfect trip.",
    pl: 'Przejrzyj nasze wycieczki lub napisz \u2014 ch\u0119tnie pomo\u017cemy zaplanowa\u0107 idealn\u0105 podr\u00f3\u017c.',
  },
  'about.viewTours': { en: 'View tours', pl: 'Zobacz wycieczki' },
  'about.contactUs': { en: 'Contact us', pl: 'Kontakt' },

  // Tours page
  'tours.title': { en: 'Tours', pl: 'Wycieczki' },
  'tours.subtitle': { en: 'Pick a tour and see details + booking sidebar.', pl: 'Wybierz wycieczk\u0119 i zobacz szczeg\u00f3\u0142y.' },
  'tours.noTours': { en: 'No tours available yet.', pl: 'Brak dost\u0119pnych wycieczek.' },
  'tours.filter.all': { en: 'All', pl: 'Wszystkie' },
  'tours.filter.popular': { en: 'Most popular', pl: 'Najpopularniejsze' },
  'tours.filter.halfDay': { en: 'Half-day', pl: 'P\u00f3\u0142dniowe' },
  'tours.filter.fullDay': { en: 'Full-day', pl: 'Ca\u0142odniowe' },

  // Transfers page
  'transfers.title': { en: 'Transfers', pl: 'Transfery' },
  'transfers.subtitle': { en: 'Airport pickups, hotel transfers and more.', pl: 'Odbiory z lotniska, transfery hotelowe i wi\u0119cej.' },
  'transfers.noTransfers': { en: 'No transfers yet.', pl: 'Brak dost\u0119pnych transfer\u00f3w.' },

  // Common
  'common.noDescription': { en: 'No description yet.', pl: 'Brak opisu.' },
  'common.noImage': { en: 'No image', pl: 'Brak zdj\u0119cia' },
} as const

type TranslationKey = keyof typeof translations

export function t(key: TranslationKey, lang: Lang): string {
  const entry = translations[key]
  // Only en and pl have translations; others fallback to en
  const effectiveLang: TranslatedLang = lang === 'pl' ? 'pl' : 'en'
  return entry?.[effectiveLang] ?? entry?.en ?? key
}

export { translations }
