// i18n foundation — add new locales by extending this file
// Currently supports: 'en' (English)
// Future: 'hi' (Hindi), 'raj' (Rajasthani)

export type Locale = 'en' // | 'hi' | 'raj'  ← uncomment as you add

export const defaultLocale: Locale = 'en'

export const translations = {
  en: {
    appName: 'ApkaNeta',
    appTagline: 'Your Elected Representative. Transparent. Accountable.',
    selectState: 'Select State',
    selectDistrict: 'Select District',
    selectTehsil: 'Select Tehsil',
    selectCity: 'Select City / Town',
    clickStateOnMap: 'Click on any state on the map to explore',
    representatives: 'Representatives',
    promises: 'Promises & Manifesto',
    tenders: 'Public Works & Tenders',
    fundUtilization: 'Fund Utilization',
    backToIndia: '← Back to India',
    backToState: '← Back to State',
    backToDistrict: '← Back to District',
    status: {
      delivered: 'Delivered',
      inProgress: 'In Progress',
      underReview: 'Under Review',
      notStarted: 'No Sanction Found',
    },
    tenderStatus: {
      floated: 'Tender Floated',
      awarded: 'Awarded',
      wip: 'Work in Progress',
      completed: 'Completed',
      delayed: 'Delayed',
    },
  },
  // hi: { ... } ← Hindi translations slot
}

export type TranslationKeys = typeof translations.en

export function t(locale: Locale, key: keyof TranslationKeys): string {
  return translations[locale][key] as string
}
