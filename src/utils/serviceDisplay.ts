import { Service } from '../types';

type Language = 'en' | 'he';

const serviceNameOverrides: Partial<Record<string, { en: string; he: string }>> = {
  diffuser_styling: {
    en: 'Natural Event Styling (Wavy & Curly Hair)',
    he: 'עיצוב טבעי לאירוע (לגלי ומתולתלות)',
  },
  home_haircut: {
    en: 'Home Haircut (Givat Shmuel)',
    he: 'תספורת ביתית (בגבעת שמואל)',
  },
};

const defaultServices: Service[] = [
  { id: 'haircut_styling', nameEn: 'Haircut + Styling', nameHe: 'תספורת + עיצוב', durationMinutes: 60, price: 200, isAddon: false, isActive: true, category: 'hairdressing' },
  { id: 'student_haircut', nameEn: 'Student Haircut', nameHe: 'תספורת לסטודנטים', durationMinutes: 60, price: 150, isAddon: false, isActive: true, category: 'hairdressing' },
  { id: 'home_haircut', nameEn: 'Home Haircut (Givat Shmuel)', nameHe: 'תספורת ביתית (בגבעת שמואל)', durationMinutes: 90, price: 250, isAddon: false, isActive: true, category: 'hairdressing' },
  { id: 'diffuser_styling', nameEn: 'Natural Event Styling (Wavy & Curly Hair)', nameHe: 'עיצוב טבעי לאירוע (לגלי ומתולתלות)', durationMinutes: 60, price: 200, isAddon: false, isActive: true, category: 'styling' },
  { id: 'curly_styling_guide', nameEn: 'Curly Styling Guidance', nameHe: 'הדרכת עיצוב תלתלים', durationMinutes: 60, price: 200, isAddon: false, isActive: true, category: 'styling' },
  { id: 'natural_highlights', nameEn: 'Natural Highlights', nameHe: 'גוונים טבעיים', durationMinutes: 120, price: 500, isAddon: false, isActive: true, category: 'color' },
  { id: 'root_color_soon', nameEn: 'Highlights (Coming Soon)', nameHe: 'גוונים (בקרוב)', durationMinutes: 0, price: 0, isAddon: false, isActive: true, category: 'color' },
];

const removedServiceIds = new Set(['trim', 'highlights_soon']);

export const normalizeServices = (services: Service[]) => {
  const normalized = new Map<string, Service>();

  services.forEach((service) => {
    if (removedServiceIds.has(service.id)) {
      return;
    }

    normalized.set(service.id, { ...service });
  });

  defaultServices.forEach((service) => {
    const existing = normalized.get(service.id);
    normalized.set(service.id, existing ? { ...existing, ...service } : service);
  });

  return defaultServices
    .map((service) => normalized.get(service.id))
    .filter((service): service is Service => Boolean(service));
};

export const getServiceDisplayName = (service: Pick<Service, 'id' | 'nameEn' | 'nameHe'>, language: Language) => {
  const override = serviceNameOverrides[service.id];
  if (override) {
    return override[language];
  }

  return language === 'en' ? service.nameEn : service.nameHe;
};

export const getServiceDisplayPrice = (service: Pick<Service, 'id' | 'price'>) => {
  return service.id === 'natural_highlights' ? `${service.price}+` : `${service.price}`;
};
