type AppLanguage = 'en' | 'he';

const MONTHS_LONG: Record<AppLanguage, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  he: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
};

const MONTHS_SHORT: Record<AppLanguage, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  he: ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יונ׳', 'יול׳', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'],
};

const WEEKDAYS_LONG: Record<AppLanguage, string[]> = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  he: ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'],
};

const WEEKDAYS_SHORT: Record<AppLanguage, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  he: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
};

type MonthStyle = 'long' | 'short';

interface DateDisplayOptions {
  includeWeekday?: boolean;
  includeYear?: boolean;
  monthStyle?: MonthStyle;
}

const getMonthTable = (language: AppLanguage, monthStyle: MonthStyle) =>
  monthStyle === 'short' ? MONTHS_SHORT[language] : MONTHS_LONG[language];

export const getLocalizedWeekday = (date: Date, language: AppLanguage) =>
  WEEKDAYS_LONG[language][date.getDay()];

export const getLocalizedWeekdayShort = (date: Date, language: AppLanguage) =>
  WEEKDAYS_SHORT[language][date.getDay()];

export const getLocalizedMonth = (
  date: Date,
  language: AppLanguage,
  monthStyle: MonthStyle = 'long'
) => getMonthTable(language, monthStyle)[date.getMonth()];

export const formatLocalizedDate = (
  date: Date,
  language: AppLanguage,
  options: DateDisplayOptions = {}
) => {
  const {
    includeWeekday = true,
    includeYear = true,
    monthStyle = 'long',
  } = options;
  const month = getLocalizedMonth(date, language, monthStyle);
  const dayPart = `${date.getDate()} ${month}`;
  const yearPart = includeYear ? ` ${date.getFullYear()}` : '';

  if (!includeWeekday) {
    return `${dayPart}${yearPart}`;
  }

  const weekday = getLocalizedWeekday(date, language);
  return language === 'en'
    ? `${weekday}, ${dayPart}${yearPart}`
    : `${weekday} · ${dayPart}${yearPart}`;
};

export const formatMonthRange = (start: Date, end: Date, language: AppLanguage) => {
  const startMonth = getLocalizedMonth(start, language, 'long');
  const endMonth = getLocalizedMonth(end, language, 'long');
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startMonth === endMonth && startYear === endYear) {
    return `${startMonth} ${startYear}`;
  }

  if (startYear === endYear) {
    return `${startMonth} - ${endMonth} ${startYear}`;
  }

  return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
};
