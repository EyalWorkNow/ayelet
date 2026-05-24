export interface GalleryImage {
  id: string;
  src: string;
  category: 'haircuts' | 'colors' | 'styling' | 'treatments' | 'studio';
  titleEn: string;
  titleHe: string;
  descEn: string;
  descHe: string;
  serviceId?: string; // Preselects the service if they want to book using this image
}

export const galleryImages: GalleryImage[] = [
  {
    id: 'studio_entrance',
    src: new URL('../../img/WhatsApp Image 2026-05-20 at 22.16.26.jpeg', import.meta.url).href,
    category: 'studio',
    titleEn: 'Ayelet Netanel Studio',
    titleHe: 'הסטודיו של איילת נתנאל',
    descEn: 'A warm, welcoming, and modern space designed for personalized hair design.',
    descHe: 'חלל מודרני, חם ומזמין המעוצב במיוחד להעניק חוויה אישית ומקצועית.',
  },
  {
    id: 'dry_cut_precision',
    src: new URL('../../img/Gemini_Generated_Image_njvtklnjvtklnjvt.png', import.meta.url).href,
    category: 'haircuts',
    titleEn: 'Precision Dry Haircut',
    titleHe: 'תספורת יבשה מדויקת',
    descEn: 'Tailored dry cutting to match the natural pattern and fall of your hair.',
    descHe: 'תספורת על יבש המותאמת אישית למבנה ולזרימה הטבעית של השיער.',
    serviceId: 'haircut_styling',
  },
  {
    id: 'curly_diffuser_styling',
    src: new URL('../../img/Gemini_Generated_Image_bk3tdcbk3tdcbk3t.png', import.meta.url).href,
    category: 'styling',
    titleEn: 'Curly Cut & Diffuser styling',
    titleHe: 'תספורת תלתלים ועיצוב דיפיוזר',
    descEn: 'Enhancing definition, volume, and natural curls through specialized diffuser drying.',
    descHe: 'הדגשת מבנה התלתל, יצירת נפח וייבוש מקצועי באמצעות דיפיוזר.',
    serviceId: 'diffuser_styling',
  },
  {
    id: 'natural_wavy_highlights',
    src: new URL('../../img/Gemini_Generated_Image_bdkk9mbdkk9mbdkk.png', import.meta.url).href,
    category: 'colors',
    titleEn: 'Natural Highlights on Waves',
    titleHe: 'גוונים טבעיים על שיער גלי',
    descEn: 'Sun-kissed highlights to give depth, shine, and texture to wavy hair.',
    descHe: 'גווני שמש עדינים המעניקים עומק, ברק ומרקם עשיר לשיער גלי.',
    serviceId: 'natural_highlights',
  },
  {
    id: 'golden_blonde_highlights',
    src: new URL('../../img/Gemini_Generated_Image_l3mzqol3mzqol3mz.png', import.meta.url).href,
    category: 'colors',
    titleEn: 'Golden Blonde Balayage',
    titleHe: 'באלייאז׳ בלונד זהב',
    descEn: 'Seamless hand-painted golden highlights for a natural, bright, beachy vibe.',
    descHe: 'צביעה ידנית חלקה בגווני בלונד זהוב לקבלת מראה מואר וטבעי.',
    serviceId: 'natural_highlights',
  },
  {
    id: 'curly_styling_details',
    src: new URL('../../img/Gemini_Generated_Image_k4nwgdk4nwgdk4nw.png', import.meta.url).href,
    category: 'styling',
    titleEn: 'Curly Styling & Product Care',
    titleHe: 'עיצוב תלתלים וטיפוח מותאם',
    descEn: 'Hydration and definition session using premium formulas for curl care.',
    descHe: 'טיפול לחות ועיצוב תלתלים באמצעות תכשירים איכותיים המזינים את השיער.',
    serviceId: 'diffuser_styling',
  },
  {
    id: 'natural_balayage_brunette',
    src: new URL('../../img/Gemini_Generated_Image_16stib16stib16st.png', import.meta.url).href,
    category: 'colors',
    titleEn: 'Sunlit Brunette Highlights',
    titleHe: 'גווני שמש לברונטית',
    descEn: 'Soft dimensional colors that blend beautifully with dark hair tones.',
    descHe: 'גוונים רכים ורב-ממדיים המשתלבים בצורה מושלמת עם גווני שיער כהים.',
    serviceId: 'natural_highlights',
  },
  {
    id: 'nourishing_curl_treatment',
    src: new URL('../../img/Gemini_Generated_Image_51ldby51ldby51ld.png', import.meta.url).href,
    category: 'treatments',
    titleEn: 'Nourishing Curl Treatment',
    titleHe: 'טיפול הזנה עמוק לתלתלים',
    descEn: 'Deep-acting oil and mask treatment to recover natural hydration.',
    descHe: 'טיפול שמן ומסיכה עמוק לשיקום הלחות והגמישות הטבעית של התלתל.',
    serviceId: 'oil',
  },
  {
    id: 'soft_waves_trim',
    src: new URL('../../img/ChatGPT Image May 20, 2026, 11_02_22 PM.png', import.meta.url).href,
    category: 'haircuts',
    titleEn: 'Soft Waves & Precision Trim',
    titleHe: 'גלים רכים וקצוות מדויקים',
    descEn: 'Light shaping and trim to maintain healthy ends and structured shape.',
    descHe: 'עיצוב קל וגזירת קצוות לשמירה על שיער בריא ועל נפח נכון.',
    serviceId: 'trim',
  },
  {
    id: 'glamour_curl_styling',
    src: new URL('../../img/ChatGPT Image May 20, 2026, 11_06_39 PM.png', import.meta.url).href,
    category: 'styling',
    titleEn: 'Glamour Curly Event Styling',
    titleHe: 'עיצוב תלתלים יוקרתי לאירוע',
    descEn: 'Perfectly defined, glossy curls designed to stand out at special events.',
    descHe: 'תלתלים מוגדרים ומלאי ברק בעיצוב מוקפד המותאם במיוחד לאירועים.',
    serviceId: 'styling',
  },
  {
    id: 'warm_brunette_balayage',
    src: new URL('../../img/ChatGPT Image May 20, 2026, 11_06_45 PM.png', import.meta.url).href,
    category: 'colors',
    titleEn: 'Warm Brunette Balayage',
    titleHe: 'באלייאז׳ חום שוקולד חם',
    descEn: 'Rich chocolate highlights creating movement and texture.',
    descHe: 'גווני שוקולד עשירים המעניקים תחושת תנועה ועומק לשיער.',
    serviceId: 'color',
  },
  {
    id: 'beach_waves_styling',
    src: new URL('../../img/ChatGPT Image May 20, 2026, 11_14_30 PM.png', import.meta.url).href,
    category: 'styling',
    titleEn: 'Beachy Wave Styling',
    titleHe: 'עיצוב גלי ים טבעי',
    descEn: 'Relaxed and textured styling for an effortless everyday lookup.',
    descHe: 'עיצוב במראה גלי משוחרר וטבעי ליום-יום.',
    serviceId: 'styling',
  },
  {
    id: 'caramel_highlights',
    src: new URL('../../img/ChatGPT Image May 20, 2026, 11_14_39 PM.png', import.meta.url).href,
    category: 'colors',
    titleEn: 'Warm Caramel Highlights',
    titleHe: 'גווני קרמל חמים',
    descEn: 'Warm tones adding radiance and healthy-looking glow to dark bases.',
    descHe: 'גוונים חמימים המעניקים מראה מואר, בריא ומלא חיים לבסיס כהה.',
    serviceId: 'natural_highlights',
  },
  {
    id: 'voluminous_diffuser_curly',
    src: new URL('../../img/ChatGPT Image May 20, 2026, 11_19_52 PM.png', import.meta.url).href,
    category: 'styling',
    titleEn: 'Voluminous Curly Finish',
    titleHe: 'תלתלים נפחיים בעיצוב מלא',
    descEn: 'High-volume diffuser drying that keeps curly locks soft, defined, and bouncy.',
    descHe: 'ייבוש בדיפיוזר לנפח מקסימלי השומר על תלתלים רכים, קפיציים ומוגדרים.',
    serviceId: 'diffuser_styling',
  },
];

export const getServiceLocalImage = (serviceId: string): string => {
  // Map specific service IDs to the most appropriate local image
  const mappings: Record<string, string> = {
    haircut: galleryImages.find(img => img.id === 'dry_cut_precision')?.src || '',
    haircut_styling: galleryImages.find(img => img.id === 'dry_cut_precision')?.src || '',
    trim: galleryImages.find(img => img.id === 'soft_waves_trim')?.src || '',
    diffuser_styling: galleryImages.find(img => img.id === 'curly_diffuser_styling')?.src || '',
    natural_highlights: galleryImages.find(img => img.id === 'natural_wavy_highlights')?.src || '',
    color: galleryImages.find(img => img.id === 'warm_brunette_balayage')?.src || '',
    oil: galleryImages.find(img => img.id === 'nourishing_curl_treatment')?.src || '',
    styling: galleryImages.find(img => img.id === 'voluminous_diffuser_curly')?.src || '',
  };

  return mappings[serviceId] || galleryImages[0].src;
};
