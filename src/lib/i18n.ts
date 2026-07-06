import { create } from 'zustand';
import { readStorage, writeStorage } from '@/lib/storage';

// ---------------------------------------------------------------------------
// Lightweight i18n. Keys are the English strings; each language provides a
// translation. Covers the app shell (navigation, top bar) and login screen.
// English is the fallback for any untranslated key.
// ---------------------------------------------------------------------------

export type LangCode = 'en' | 'hi' | 'ar' | 'fr';

export interface Language {
  code: LangCode;
  name: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
];

type Tri = { hi: string; ar: string; fr: string };

const DICT: Record<string, Tri> = {
  // Nav groups
  Workspace: { hi: 'कार्यक्षेत्र', ar: 'مساحة العمل', fr: 'Espace de travail' },
  Sales: { hi: 'बिक्री', ar: 'المبيعات', fr: 'Ventes' },
  Operations: { hi: 'संचालन', ar: 'العمليات', fr: 'Opérations' },
  Communication: { hi: 'संचार', ar: 'التواصل', fr: 'Communication' },
  Insights: { hi: 'अंतर्दृष्टि', ar: 'التحليلات', fr: 'Analyses' },
  Admin: { hi: 'प्रशासन', ar: 'الإدارة', fr: 'Administration' },

  // Nav items
  Dashboard: { hi: 'डैशबोर्ड', ar: 'لوحة التحكم', fr: 'Tableau de bord' },
  'My Dashboard': { hi: 'मेरा डैशबोर्ड', ar: 'لوحتي', fr: 'Mon tableau de bord' },
  Leads: { hi: 'लीड्स', ar: 'العملاء المحتملون', fr: 'Prospects' },
  Pipeline: { hi: 'पाइपलाइन', ar: 'مسار الصفقات', fr: 'Pipeline' },
  Customers: { hi: 'ग्राहक', ar: 'العملاء', fr: 'Clients' },
  Tasks: { hi: 'कार्य', ar: 'المهام', fr: 'Tâches' },
  'My Day': { hi: 'मेरा दिन', ar: 'يومي', fr: 'Ma journée' },
  Calendar: { hi: 'कैलेंडर', ar: 'التقويم', fr: 'Calendrier' },
  'Items & Products': { hi: 'आइटम और उत्पाद', ar: 'الأصناف والمنتجات', fr: 'Articles et produits' },
  Proposals: { hi: 'प्रस्ताव', ar: 'العروض', fr: 'Propositions' },
  Quotations: { hi: 'कोटेशन', ar: 'عروض الأسعار', fr: 'Devis' },
  'Sales Orders': { hi: 'बिक्री ऑर्डर', ar: 'طلبات البيع', fr: 'Commandes' },
  Invoices: { hi: 'चालान', ar: 'الفواتير', fr: 'Factures' },
  Payments: { hi: 'भुगतान', ar: 'المدفوعات', fr: 'Paiements' },
  'Transport Routes': { hi: 'परिवहन मार्ग', ar: 'مسارات النقل', fr: 'Itinéraires de transport' },
  'Dispatch Schedule': { hi: 'प्रेषण अनुसूची', ar: 'جدول الإرسال', fr: "Planning d'expédition" },
  'Trip Tracking': { hi: 'यात्रा ट्रैकिंग', ar: 'تتبع الرحلات', fr: 'Suivi des trajets' },
  Vehicles: { hi: 'वाहन', ar: 'المركبات', fr: 'Véhicules' },
  Drivers: { hi: 'चालक', ar: 'السائقون', fr: 'Chauffeurs' },
  Inventory: { hi: 'इन्वेंटरी', ar: 'المخزون', fr: 'Inventaire' },
  Chat: { hi: 'चैट', ar: 'المحادثة', fr: 'Messagerie' },
  Email: { hi: 'ईमेल', ar: 'البريد الإلكتروني', fr: 'E-mail' },
  Notifications: { hi: 'सूचनाएँ', ar: 'الإشعارات', fr: 'Notifications' },
  'Call Logs': { hi: 'कॉल लॉग', ar: 'سجلات المكالمات', fr: "Journaux d'appels" },
  'Sales Analytics': { hi: 'बिक्री विश्लेषण', ar: 'تحليلات المبيعات', fr: 'Analyses des ventes' },
  'Sales Reports': { hi: 'बिक्री रिपोर्ट', ar: 'تقارير المبيعات', fr: 'Rapports de ventes' },
  'Lead Funnel': { hi: 'लीड फ़नल', ar: 'قمع العملاء المحتملين', fr: 'Entonnoir des prospects' },
  Geographic: { hi: 'भौगोलिक', ar: 'جغرافي', fr: 'Géographique' },
  'Report Builder': { hi: 'रिपोर्ट बिल्डर', ar: 'منشئ التقارير', fr: 'Générateur de rapports' },
  Staff: { hi: 'कर्मचारी', ar: 'الموظفون', fr: 'Personnel' },
  Attendance: { hi: 'उपस्थिति', ar: 'الحضور', fr: 'Présence' },
  'Roles & Permissions': { hi: 'भूमिकाएँ और अनुमतियाँ', ar: 'الأدوار والصلاحيات', fr: 'Rôles et permissions' },
  Definitions: { hi: 'परिभाषाएँ', ar: 'التعريفات', fr: 'Définitions' },
  Company: { hi: 'कंपनी', ar: 'الشركة', fr: 'Entreprise' },
  Integrations: { hi: 'एकीकरण', ar: 'التكاملات', fr: 'Intégrations' },
  'Audit Log': { hi: 'ऑडिट लॉग', ar: 'سجل التدقيق', fr: "Journal d'audit" },
  System: { hi: 'सिस्टम', ar: 'النظام', fr: 'Système' },

  // Top bar & shell
  Collapse: { hi: 'संक्षिप्त करें', ar: 'طيّ', fr: 'Réduire' },
  'Create New': { hi: 'नया बनाएँ', ar: 'إنشاء جديد', fr: 'Créer' },
  Lead: { hi: 'लीड', ar: 'عميل محتمل', fr: 'Prospect' },
  Customer: { hi: 'ग्राहक', ar: 'عميل', fr: 'Client' },
  Proposal: { hi: 'प्रस्ताव', ar: 'عرض', fr: 'Proposition' },
  Task: { hi: 'कार्य', ar: 'مهمة', fr: 'Tâche' },
  'Display currency': { hi: 'प्रदर्शन मुद्रा', ar: 'عملة العرض', fr: "Devise d'affichage" },
  Language: { hi: 'भाषा', ar: 'اللغة', fr: 'Langue' },
  'Switch Role (Demo)': { hi: 'भूमिका बदलें (डेमो)', ar: 'تبديل الدور (تجريبي)', fr: 'Changer de rôle (démo)' },
  'Profile Settings': { hi: 'प्रोफ़ाइल सेटिंग्स', ar: 'إعدادات الملف الشخصي', fr: 'Paramètres du profil' },
  'Sign Out': { hi: 'साइन आउट', ar: 'تسجيل الخروج', fr: 'Se déconnecter' },
  'Mark all read': { hi: 'सभी को पढ़ा हुआ चिह्नित करें', ar: 'تحديد الكل كمقروء', fr: 'Tout marquer comme lu' },
  'Search anything…': { hi: 'कुछ भी खोजें…', ar: 'ابحث عن أي شيء…', fr: 'Rechercher…' },

  // Login
  'Welcome back': { hi: 'पुनः स्वागत है', ar: 'مرحبًا بعودتك', fr: 'Bon retour' },
  'Sign in to your Sarvadesk workspace': {
    hi: 'अपने Sarvadesk कार्यक्षेत्र में साइन इन करें',
    ar: 'سجّل الدخول إلى مساحة عمل Sarvadesk',
    fr: 'Connectez-vous à votre espace Sarvadesk',
  },
  'Email Address': { hi: 'ईमेल पता', ar: 'البريد الإلكتروني', fr: 'Adresse e-mail' },
  Password: { hi: 'पासवर्ड', ar: 'كلمة المرور', fr: 'Mot de passe' },
  'Remember me': { hi: 'मुझे याद रखें', ar: 'تذكرني', fr: 'Se souvenir de moi' },
  'Forgot password?': { hi: 'पासवर्ड भूल गए?', ar: 'هل نسيت كلمة المرور؟', fr: 'Mot de passe oublié ?' },
  'Sign In': { hi: 'साइन इन', ar: 'تسجيل الدخول', fr: 'Se connecter' },
  'New to Sarvadesk?': { hi: 'Sarvadesk पर नए हैं?', ar: 'جديد على Sarvadesk؟', fr: 'Nouveau sur Sarvadesk ?' },
  'Create an account': { hi: 'खाता बनाएँ', ar: 'إنشاء حساب', fr: 'Créer un compte' },
  'Demo mode — any email & password works. Just click Sign In.': {
    hi: 'डेमो मोड — कोई भी ईमेल और पासवर्ड काम करता है। बस साइन इन पर क्लिक करें।',
    ar: 'الوضع التجريبي — أي بريد إلكتروني وكلمة مرور يعملان. فقط اضغط تسجيل الدخول.',
    fr: "Mode démo — n'importe quel e-mail et mot de passe fonctionnent. Cliquez sur Se connecter.",
  },
};

const STORAGE_KEY = 'oilgas-crm:language';

interface LangState {
  code: LangCode;
  setLanguage: (code: LangCode) => void;
  init: () => void;
}

export const useLanguageStore = create<LangState>((set) => ({
  code: 'en',
  setLanguage: (code) => {
    writeStorage(STORAGE_KEY, code);
    set({ code });
  },
  init: () => {
    const saved = readStorage<LangCode | null>(STORAGE_KEY, null);
    if (saved && LANGUAGES.some((l) => l.code === saved)) set({ code: saved });
  },
}));

export function translate(code: LangCode, key: string): string {
  if (code === 'en') return key;
  return DICT[key]?.[code] ?? key;
}

/** Hook returning a translate function; re-renders when the language changes. */
export function useT(): (key: string) => string {
  const code = useLanguageStore((s) => s.code);
  return (key: string) => translate(code, key);
}
