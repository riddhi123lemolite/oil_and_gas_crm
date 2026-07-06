import { create } from 'zustand';
import { readStorage, writeStorage } from '@/lib/storage';

// ---------------------------------------------------------------------------
// Lightweight i18n. Keys are the English strings; each language provides a
// translation. English is the fallback for any untranslated key, so partial
// translations never break the UI.
//
// NOTE: translations for the Indian languages and Arabic/French are a solid
// first pass (machine-assisted) covering the navigation + app shell. They
// should be reviewed by a native speaker before production use.
// ---------------------------------------------------------------------------

export type LangCode = string;

export interface Language {
  code: LangCode;
  name: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
  { code: 'bn', name: 'বাংলা', dir: 'ltr' },
  { code: 'te', name: 'తెలుగు', dir: 'ltr' },
  { code: 'mr', name: 'मराठी', dir: 'ltr' },
  { code: 'ta', name: 'தமிழ்', dir: 'ltr' },
  { code: 'gu', name: 'ગુજરાતી', dir: 'ltr' },
  { code: 'ur', name: 'اردو', dir: 'rtl' },
  { code: 'kn', name: 'ಕನ್ನಡ', dir: 'ltr' },
  { code: 'or', name: 'ଓଡ଼ିଆ', dir: 'ltr' },
  { code: 'ml', name: 'മലയാളം', dir: 'ltr' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', dir: 'ltr' },
  { code: 'as', name: 'অসমীয়া', dir: 'ltr' },
  { code: 'sa', name: 'संस्कृतम्', dir: 'ltr' },
  { code: 'ks', name: 'کٲشُر', dir: 'rtl' },
  { code: 'sd', name: 'सिन्धी', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'it', name: 'Italiano', dir: 'ltr' },
  { code: 'pt', name: 'Português', dir: 'ltr' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'zh', name: '中文', dir: 'ltr' },
  { code: 'ja', name: '日本語', dir: 'ltr' },
  { code: 'ko', name: '한국어', dir: 'ltr' },
];

// BCP-47 locale per language, for date/number/currency formatting.
const LOCALES: Record<string, string> = {
  en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN', mr: 'mr-IN', gu: 'gu-IN', pa: 'pa-IN',
  ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN', ml: 'ml-IN', or: 'or-IN', as: 'as-IN',
  sa: 'sa-IN', ks: 'ks-IN', sd: 'sd-IN', ur: 'ur-PK', ar: 'ar-AE', fr: 'fr-FR',
  de: 'de-DE', es: 'es-ES', it: 'it-IT', pt: 'pt-BR', ru: 'ru-RU', zh: 'zh-CN',
  ja: 'ja-JP', ko: 'ko-KR',
};

export function localeFor(code: string): string {
  return LOCALES[code] ?? 'en-IN';
}

/** Best-match supported language from the browser's preferences. */
function detectLanguage(): LangCode {
  const prefs = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : [];
  for (const p of prefs) {
    if (!p) continue;
    const base = p.toLowerCase().split('-')[0];
    const hit = LANGUAGES.find((l) => l.code === base);
    if (hit) return hit.code;
  }
  return 'en';
}

type Dict = Record<string, string>;

const translations: Record<string, Dict> = {
  hi: {
    Workspace: 'कार्यक्षेत्र', Sales: 'बिक्री', Operations: 'संचालन', Communication: 'संचार', Insights: 'अंतर्दृष्टि', Admin: 'प्रशासन',
    Dashboard: 'डैशबोर्ड', 'My Dashboard': 'मेरा डैशबोर्ड', Leads: 'लीड्स', Pipeline: 'पाइपलाइन', Customers: 'ग्राहक', Tasks: 'कार्य', 'My Day': 'मेरा दिन', Calendar: 'कैलेंडर',
    'Items & Products': 'आइटम और उत्पाद', Proposals: 'प्रस्ताव', Quotations: 'कोटेशन', 'Sales Orders': 'बिक्री ऑर्डर', Invoices: 'चालान', Payments: 'भुगतान',
    'Transport Routes': 'परिवहन मार्ग', 'Dispatch Schedule': 'प्रेषण अनुसूची', 'Trip Tracking': 'यात्रा ट्रैकिंग', Vehicles: 'वाहन', Drivers: 'चालक', Inventory: 'इन्वेंटरी',
    Chat: 'चैट', Email: 'ईमेल', Notifications: 'सूचनाएँ', 'Call Logs': 'कॉल लॉग',
    'Sales Analytics': 'बिक्री विश्लेषण', 'Sales Reports': 'बिक्री रिपोर्ट', 'Lead Funnel': 'लीड फ़नल', Geographic: 'भौगोलिक', 'Report Builder': 'रिपोर्ट बिल्डर',
    Staff: 'कर्मचारी', Attendance: 'उपस्थिति', 'Roles & Permissions': 'भूमिकाएँ और अनुमतियाँ', Definitions: 'परिभाषाएँ', Company: 'कंपनी', Integrations: 'एकीकरण', 'Audit Log': 'ऑडिट लॉग', System: 'सिस्टम',
    Collapse: 'संक्षिप्त करें', 'Create New': 'नया बनाएँ', Lead: 'लीड', Customer: 'ग्राहक', Proposal: 'प्रस्ताव', Task: 'कार्य',
    'Display currency': 'प्रदर्शन मुद्रा', Language: 'भाषा', 'Switch Role (Demo)': 'भूमिका बदलें (डेमो)', 'Profile Settings': 'प्रोफ़ाइल सेटिंग्स', 'Sign Out': 'साइन आउट', 'Mark all read': 'सभी को पढ़ा हुआ चिह्नित करें', 'Search anything…': 'कुछ भी खोजें…',
    'Welcome back': 'पुनः स्वागत है', 'Sign in to your Sarvadesk workspace': 'अपने Sarvadesk कार्यक्षेत्र में साइन इन करें', 'Email Address': 'ईमेल पता', Password: 'पासवर्ड', 'Remember me': 'मुझे याद रखें', 'Forgot password?': 'पासवर्ड भूल गए?', 'Sign In': 'साइन इन', 'New to Sarvadesk?': 'Sarvadesk पर नए हैं?', 'Create an account': 'खाता बनाएँ',
    'Demo mode — any email & password works. Just click Sign In.': 'डेमो मोड — कोई भी ईमेल और पासवर्ड काम करता है। बस साइन इन पर क्लिक करें।',
  },
  bn: {
    Workspace: 'কর্মক্ষেত্র', Sales: 'বিক্রয়', Operations: 'পরিচালনা', Communication: 'যোগাযোগ', Insights: 'বিশ্লেষণ', Admin: 'প্রশাসন',
    Dashboard: 'ড্যাশবোর্ড', 'My Dashboard': 'আমার ড্যাশবোর্ড', Leads: 'লিড', Pipeline: 'পাইপলাইন', Customers: 'গ্রাহক', Tasks: 'কাজ', 'My Day': 'আমার দিন', Calendar: 'ক্যালেন্ডার',
    'Items & Products': 'আইটেম ও পণ্য', Proposals: 'প্রস্তাব', Quotations: 'উদ্ধৃতি', 'Sales Orders': 'বিক্রয় অর্ডার', Invoices: 'চালান', Payments: 'পেমেন্ট',
    'Transport Routes': 'পরিবহন রুট', 'Dispatch Schedule': 'প্রেরণ সময়সূচি', 'Trip Tracking': 'ট্রিপ ট্র্যাকিং', Vehicles: 'যানবাহন', Drivers: 'চালক', Inventory: 'ইনভেন্টরি',
    Chat: 'চ্যাট', Email: 'ইমেল', Notifications: 'বিজ্ঞপ্তি', 'Call Logs': 'কল লগ',
    'Sales Analytics': 'বিক্রয় বিশ্লেষণ', 'Sales Reports': 'বিক্রয় প্রতিবেদন', 'Lead Funnel': 'লিড ফানেল', Geographic: 'ভৌগোলিক', 'Report Builder': 'রিপোর্ট বিল্ডার',
    Staff: 'কর্মী', Attendance: 'উপস্থিতি', 'Roles & Permissions': 'ভূমিকা ও অনুমতি', Definitions: 'সংজ্ঞা', Company: 'কোম্পানি', Integrations: 'ইন্টিগ্রেশন', 'Audit Log': 'অডিট লগ', System: 'সিস্টেম',
  },
  mr: {
    Workspace: 'कार्यक्षेत्र', Sales: 'विक्री', Operations: 'कामकाज', Communication: 'संवाद', Insights: 'विश्लेषण', Admin: 'प्रशासन',
    Dashboard: 'डॅशबोर्ड', 'My Dashboard': 'माझा डॅशबोर्ड', Leads: 'लीड्स', Pipeline: 'पाइपलाइन', Customers: 'ग्राहक', Tasks: 'कार्ये', 'My Day': 'माझा दिवस', Calendar: 'दिनदर्शिका',
    'Items & Products': 'वस्तू व उत्पादने', Proposals: 'प्रस्ताव', Quotations: 'कोटेशन', 'Sales Orders': 'विक्री ऑर्डर', Invoices: 'पावत्या', Payments: 'देयके',
    'Transport Routes': 'वाहतूक मार्ग', 'Dispatch Schedule': 'प्रेषण वेळापत्रक', 'Trip Tracking': 'प्रवास मागोवा', Vehicles: 'वाहने', Drivers: 'चालक', Inventory: 'सूची',
    Chat: 'गप्पा', Email: 'ईमेल', Notifications: 'सूचना', 'Call Logs': 'कॉल नोंदी',
    'Sales Analytics': 'विक्री विश्लेषण', 'Sales Reports': 'विक्री अहवाल', 'Lead Funnel': 'लीड फनेल', Geographic: 'भौगोलिक', 'Report Builder': 'अहवाल निर्माता',
    Staff: 'कर्मचारी', Attendance: 'उपस्थिती', 'Roles & Permissions': 'भूमिका व परवानग्या', Definitions: 'व्याख्या', Company: 'कंपनी', Integrations: 'एकत्रीकरण', 'Audit Log': 'ऑडिट नोंद', System: 'प्रणाली',
  },
  gu: {
    Workspace: 'કાર્યક્ષેત્ર', Sales: 'વેચાણ', Operations: 'કામગીરી', Communication: 'સંચાર', Insights: 'વિશ્લેષણ', Admin: 'વહીવટ',
    Dashboard: 'ડેશબોર્ડ', 'My Dashboard': 'મારું ડેશબોર્ડ', Leads: 'લીડ્સ', Pipeline: 'પાઇપલાઇન', Customers: 'ગ્રાહકો', Tasks: 'કાર્યો', 'My Day': 'મારો દિવસ', Calendar: 'કૅલેન્ડર',
    'Items & Products': 'વસ્તુઓ અને ઉત્પાદનો', Proposals: 'દરખાસ્તો', Quotations: 'અવતરણ', 'Sales Orders': 'વેચાણ ઓર્ડર', Invoices: 'ઇન્વૉઇસ', Payments: 'ચૂકવણી',
    'Transport Routes': 'પરિવહન માર્ગો', 'Dispatch Schedule': 'મોકલવાનું સમયપત્રક', 'Trip Tracking': 'સફર ટ્રેકિંગ', Vehicles: 'વાહનો', Drivers: 'ડ્રાઇવરો', Inventory: 'ઇન્વેન્ટરી',
    Chat: 'ચેટ', Email: 'ઇમેલ', Notifications: 'સૂચનાઓ', 'Call Logs': 'કૉલ લૉગ',
    'Sales Analytics': 'વેચાણ વિશ્લેષણ', 'Sales Reports': 'વેચાણ અહેવાલ', 'Lead Funnel': 'લીડ ફનલ', Geographic: 'ભૌગોલિક', 'Report Builder': 'રિપોર્ટ બિલ્ડર',
    Staff: 'સ્ટાફ', Attendance: 'હાજરી', 'Roles & Permissions': 'ભૂમિકાઓ અને પરવાનગીઓ', Definitions: 'વ્યાખ્યાઓ', Company: 'કંપની', Integrations: 'એકીકરણ', 'Audit Log': 'ઑડિટ લૉગ', System: 'સિસ્ટમ',
  },
  pa: {
    Workspace: 'ਕਾਰਜ-ਖੇਤਰ', Sales: 'ਵਿਕਰੀ', Operations: 'ਸੰਚਾਲਨ', Communication: 'ਸੰਚਾਰ', Insights: 'ਵਿਸ਼ਲੇਸ਼ਣ', Admin: 'ਪ੍ਰਬੰਧਨ',
    Dashboard: 'ਡੈਸ਼ਬੋਰਡ', 'My Dashboard': 'ਮੇਰਾ ਡੈਸ਼ਬੋਰਡ', Leads: 'ਲੀਡਜ਼', Pipeline: 'ਪਾਈਪਲਾਈਨ', Customers: 'ਗਾਹਕ', Tasks: 'ਕੰਮ', 'My Day': 'ਮੇਰਾ ਦਿਨ', Calendar: 'ਕੈਲੰਡਰ',
    'Items & Products': 'ਆਈਟਮ ਅਤੇ ਉਤਪਾਦ', Proposals: 'ਪ੍ਰਸਤਾਵ', Quotations: 'ਹਵਾਲੇ', 'Sales Orders': 'ਵਿਕਰੀ ਆਰਡਰ', Invoices: 'ਚਲਾਨ', Payments: 'ਭੁਗਤਾਨ',
    'Transport Routes': 'ਟ੍ਰਾਂਸਪੋਰਟ ਰੂਟ', 'Dispatch Schedule': 'ਭੇਜਣ ਦਾ ਸਮਾਂ-ਸਾਰਣੀ', 'Trip Tracking': 'ਸਫ਼ਰ ਟ੍ਰੈਕਿੰਗ', Vehicles: 'ਵਾਹਨ', Drivers: 'ਡਰਾਈਵਰ', Inventory: 'ਵਸਤੂ-ਸੂਚੀ',
    Chat: 'ਚੈਟ', Email: 'ਈਮੇਲ', Notifications: 'ਸੂਚਨਾਵਾਂ', 'Call Logs': 'ਕਾਲ ਲੌਗ',
    'Sales Analytics': 'ਵਿਕਰੀ ਵਿਸ਼ਲੇਸ਼ਣ', 'Sales Reports': 'ਵਿਕਰੀ ਰਿਪੋਰਟਾਂ', 'Lead Funnel': 'ਲੀਡ ਫਨਲ', Geographic: 'ਭੂਗੋਲਿਕ', 'Report Builder': 'ਰਿਪੋਰਟ ਬਿਲਡਰ',
    Staff: 'ਸਟਾਫ', Attendance: 'ਹਾਜ਼ਰੀ', 'Roles & Permissions': 'ਭੂਮਿਕਾਵਾਂ ਅਤੇ ਅਧਿਕਾਰ', Definitions: 'ਪਰਿਭਾਸ਼ਾਵਾਂ', Company: 'ਕੰਪਨੀ', Integrations: 'ਏਕੀਕਰਨ', 'Audit Log': 'ਆਡਿਟ ਲੌਗ', System: 'ਸਿਸਟਮ',
  },
  ta: {
    Workspace: 'பணியிடம்', Sales: 'விற்பனை', Operations: 'செயல்பாடுகள்', Communication: 'தொடர்பு', Insights: 'பகுப்பாய்வு', Admin: 'நிர்வாகம்',
    Dashboard: 'டாஷ்போர்டு', 'My Dashboard': 'எனது டாஷ்போர்டு', Leads: 'வாய்ப்புகள்', Pipeline: 'பைப்லைன்', Customers: 'வாடிக்கையாளர்கள்', Tasks: 'பணிகள்', 'My Day': 'எனது நாள்', Calendar: 'நாட்காட்டி',
    'Items & Products': 'பொருட்கள் & தயாரிப்புகள்', Proposals: 'முன்மொழிவுகள்', Quotations: 'மேற்கோள்கள்', 'Sales Orders': 'விற்பனை ஆர்டர்கள்', Invoices: 'விலைப்பட்டியல்கள்', Payments: 'கட்டணங்கள்',
    'Transport Routes': 'போக்குவரத்து பாதைகள்', 'Dispatch Schedule': 'அனுப்பும் அட்டவணை', 'Trip Tracking': 'பயண கண்காணிப்பு', Vehicles: 'வாகனங்கள்', Drivers: 'ஓட்டுநர்கள்', Inventory: 'சரக்கு',
    Chat: 'அரட்டை', Email: 'மின்னஞ்சல்', Notifications: 'அறிவிப்புகள்', 'Call Logs': 'அழைப்பு பதிவுகள்',
    'Sales Analytics': 'விற்பனை பகுப்பாய்வு', 'Sales Reports': 'விற்பனை அறிக்கைகள்', 'Lead Funnel': 'வாய்ப்பு புனல்', Geographic: 'புவியியல்', 'Report Builder': 'அறிக்கை உருவாக்கி',
    Staff: 'பணியாளர்கள்', Attendance: 'வருகை', 'Roles & Permissions': 'பங்குகள் & அனுமதிகள்', Definitions: 'வரையறைகள்', Company: 'நிறுவனம்', Integrations: 'ஒருங்கிணைப்புகள்', 'Audit Log': 'தணிக்கை பதிவு', System: 'அமைப்பு',
  },
  te: {
    Workspace: 'పనిస్థలం', Sales: 'అమ్మకాలు', Operations: 'కార్యకలాపాలు', Communication: 'సంభాషణ', Insights: 'విశ్లేషణ', Admin: 'నిర్వహణ',
    Dashboard: 'డాష్‌బోర్డ్', 'My Dashboard': 'నా డాష్‌బోర్డ్', Leads: 'లీడ్స్', Pipeline: 'పైప్‌లైన్', Customers: 'కస్టమర్లు', Tasks: 'పనులు', 'My Day': 'నా రోజు', Calendar: 'క్యాలెండర్',
    'Items & Products': 'వస్తువులు & ఉత్పత్తులు', Proposals: 'ప్రతిపాదనలు', Quotations: 'కొటేషన్లు', 'Sales Orders': 'అమ్మకపు ఆర్డర్లు', Invoices: 'ఇన్‌వాయిస్‌లు', Payments: 'చెల్లింపులు',
    'Transport Routes': 'రవాణా మార్గాలు', 'Dispatch Schedule': 'పంపిణీ షెడ్యూల్', 'Trip Tracking': 'ప్రయాణ ట్రాకింగ్', Vehicles: 'వాహనాలు', Drivers: 'డ్రైవర్లు', Inventory: 'నిల్వ',
    Chat: 'చాట్', Email: 'ఇమెయిల్', Notifications: 'నోటిఫికేషన్లు', 'Call Logs': 'కాల్ లాగ్‌లు',
    'Sales Analytics': 'అమ్మకపు విశ్లేషణ', 'Sales Reports': 'అమ్మకపు నివేదికలు', 'Lead Funnel': 'లీడ్ ఫన్నెల్', Geographic: 'భౌగోళిక', 'Report Builder': 'రిపోర్ట్ బిల్డర్',
    Staff: 'సిబ్బంది', Attendance: 'హాజరు', 'Roles & Permissions': 'పాత్రలు & అనుమతులు', Definitions: 'నిర్వచనాలు', Company: 'కంపెనీ', Integrations: 'ఇంటిగ్రేషన్లు', 'Audit Log': 'ఆడిట్ లాగ్', System: 'సిస్టమ్',
  },
  kn: {
    Workspace: 'ಕಾರ್ಯಕ್ಷೇತ್ರ', Sales: 'ಮಾರಾಟ', Operations: 'ಕಾರ್ಯಾಚರಣೆಗಳು', Communication: 'ಸಂವಹನ', Insights: 'ವಿಶ್ಲೇಷಣೆ', Admin: 'ನಿರ್ವಹಣೆ',
    Dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'My Dashboard': 'ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', Leads: 'ಲೀಡ್‌ಗಳು', Pipeline: 'ಪೈಪ್‌ಲೈನ್', Customers: 'ಗ್ರಾಹಕರು', Tasks: 'ಕಾರ್ಯಗಳು', 'My Day': 'ನನ್ನ ದಿನ', Calendar: 'ಕ್ಯಾಲೆಂಡರ್',
    'Items & Products': 'ವಸ್ತುಗಳು & ಉತ್ಪನ್ನಗಳು', Proposals: 'ಪ್ರಸ್ತಾವನೆಗಳು', Quotations: 'ದರಪಟ್ಟಿಗಳು', 'Sales Orders': 'ಮಾರಾಟ ಆದೇಶಗಳು', Invoices: 'ಸರಕುಪಟ್ಟಿಗಳು', Payments: 'ಪಾವತಿಗಳು',
    'Transport Routes': 'ಸಾರಿಗೆ ಮಾರ್ಗಗಳು', 'Dispatch Schedule': 'ರವಾನೆ ವೇಳಾಪಟ್ಟಿ', 'Trip Tracking': 'ಪ್ರಯಾಣ ಟ್ರ್ಯಾಕಿಂಗ್', Vehicles: 'ವಾಹನಗಳು', Drivers: 'ಚಾಲಕರು', Inventory: 'ದಾಸ್ತಾನು',
    Chat: 'ಚಾಟ್', Email: 'ಇಮೇಲ್', Notifications: 'ಅಧಿಸೂಚನೆಗಳು', 'Call Logs': 'ಕರೆ ದಾಖಲೆಗಳು',
    'Sales Analytics': 'ಮಾರಾಟ ವಿಶ್ಲೇಷಣೆ', 'Sales Reports': 'ಮಾರಾಟ ವರದಿಗಳು', 'Lead Funnel': 'ಲೀಡ್ ಫನಲ್', Geographic: 'ಭೌಗೋಳಿಕ', 'Report Builder': 'ವರದಿ ನಿರ್ಮಾಪಕ',
    Staff: 'ಸಿಬ್ಬಂದಿ', Attendance: 'ಹಾಜರಾತಿ', 'Roles & Permissions': 'ಪಾತ್ರಗಳು & ಅನುಮತಿಗಳು', Definitions: 'ವ್ಯಾಖ್ಯಾನಗಳು', Company: 'ಕಂಪನಿ', Integrations: 'ಸಂಯೋಜನೆಗಳು', 'Audit Log': 'ಆಡಿಟ್ ಲಾಗ್', System: 'ಸಿಸ್ಟಂ',
  },
  ml: {
    Workspace: 'ജോലിസ്ഥലം', Sales: 'വിൽപന', Operations: 'പ്രവർത്തനങ്ങൾ', Communication: 'ആശയവിനിമയം', Insights: 'വിശകലനം', Admin: 'അഡ്മിൻ',
    Dashboard: 'ഡാഷ്‌ബോർഡ്', 'My Dashboard': 'എന്റെ ഡാഷ്‌ബോർഡ്', Leads: 'ലീഡുകൾ', Pipeline: 'പൈപ്പ്‌ലൈൻ', Customers: 'ഉപഭോക്താക്കൾ', Tasks: 'ചുമതലകൾ', 'My Day': 'എന്റെ ദിവസം', Calendar: 'കലണ്ടർ',
    'Items & Products': 'ഇനങ്ങളും ഉൽപ്പന്നങ്ങളും', Proposals: 'നിർദ്ദേശങ്ങൾ', Quotations: 'ക്വട്ടേഷനുകൾ', 'Sales Orders': 'വിൽപന ഓർഡറുകൾ', Invoices: 'ഇൻവോയ്‌സുകൾ', Payments: 'പേയ്‌മെന്റുകൾ',
    'Transport Routes': 'ഗതാഗത റൂട്ടുകൾ', 'Dispatch Schedule': 'ഡിസ്പാച്ച് ഷെഡ്യൂൾ', 'Trip Tracking': 'യാത്ര ട്രാക്കിംഗ്', Vehicles: 'വാഹനങ്ങൾ', Drivers: 'ഡ്രൈവർമാർ', Inventory: 'ഇൻവെന്ററി',
    Chat: 'ചാറ്റ്', Email: 'ഇമെയിൽ', Notifications: 'അറിയിപ്പുകൾ', 'Call Logs': 'കോൾ ലോഗുകൾ',
    'Sales Analytics': 'വിൽപന വിശകലനം', 'Sales Reports': 'വിൽപന റിപ്പോർട്ടുകൾ', 'Lead Funnel': 'ലീഡ് ഫണൽ', Geographic: 'ഭൂമിശാസ്ത്രപരം', 'Report Builder': 'റിപ്പോർട്ട് ബിൽഡർ',
    Staff: 'ജീവനക്കാർ', Attendance: 'ഹാജർ', 'Roles & Permissions': 'റോളുകളും അനുമതികളും', Definitions: 'നിർവചനങ്ങൾ', Company: 'കമ്പനി', Integrations: 'ഇന്റഗ്രേഷനുകൾ', 'Audit Log': 'ഓഡിറ്റ് ലോഗ്', System: 'സിസ്റ്റം',
  },
  or: {
    Workspace: 'କାର୍ଯ୍ୟକ୍ଷେତ୍ର', Sales: 'ବିକ୍ରୟ', Operations: 'କାର୍ଯ୍ୟଚାଳନା', Communication: 'ଯୋଗାଯୋଗ', Insights: 'ବିଶ୍ଳେଷଣ', Admin: 'ପ୍ରଶାସନ',
    Dashboard: 'ଡ୍ୟାସବୋର୍ଡ', 'My Dashboard': 'ମୋ ଡ୍ୟାସବୋର୍ଡ', Leads: 'ଲିଡ୍', Pipeline: 'ପାଇପଲାଇନ', Customers: 'ଗ୍ରାହକ', Tasks: 'କାର୍ଯ୍ୟ', 'My Day': 'ମୋ ଦିନ', Calendar: 'କ୍ୟାଲେଣ୍ଡର',
    'Items & Products': 'ସାମଗ୍ରୀ ଓ ଉତ୍ପାଦ', Proposals: 'ପ୍ରସ୍ତାବ', Quotations: 'ଉଦ୍ଧୃତି', 'Sales Orders': 'ବିକ୍ରୟ ଅର୍ଡର', Invoices: 'ଚାଲାନ', Payments: 'ଦେୟ',
    'Transport Routes': 'ପରିବହନ ମାର୍ଗ', 'Dispatch Schedule': 'ପ୍ରେରଣ ସମୟସୂଚୀ', 'Trip Tracking': 'ଯାତ୍ରା ଟ୍ରାକିଂ', Vehicles: 'ଯାନ', Drivers: 'ଚାଳକ', Inventory: 'ମହଜୁଦ',
    Chat: 'ଚାଟ୍', Email: 'ଇମେଲ୍', Notifications: 'ବିଜ୍ଞପ୍ତି', 'Call Logs': 'କଲ୍ ଲଗ୍',
    'Sales Analytics': 'ବିକ୍ରୟ ବିଶ୍ଳେଷଣ', 'Sales Reports': 'ବିକ୍ରୟ ରିପୋର୍ଟ', 'Lead Funnel': 'ଲିଡ୍ ଫନେଲ', Geographic: 'ଭୌଗୋଳିକ', 'Report Builder': 'ରିପୋର୍ଟ ବିଲଡର',
    Staff: 'କର୍ମଚାରୀ', Attendance: 'ଉପସ୍ଥିତି', 'Roles & Permissions': 'ଭୂମିକା ଓ ଅନୁମତି', Definitions: 'ସଂଜ୍ଞା', Company: 'କମ୍ପାନୀ', Integrations: 'ଏକୀକରଣ', 'Audit Log': 'ଅଡିଟ୍ ଲଗ୍', System: 'ସିଷ୍ଟମ',
  },
  as: {
    Workspace: 'কৰ্মস্থান', Sales: 'বিক্ৰী', Operations: 'পৰিচালনা', Communication: 'যোগাযোগ', Insights: 'বিশ্লেষণ', Admin: 'প্ৰশাসন',
    Dashboard: 'ডেছবৰ্ড', 'My Dashboard': 'মোৰ ডেছবৰ্ড', Leads: 'লিড', Pipeline: 'পাইপলাইন', Customers: 'গ্ৰাহক', Tasks: 'কাম', 'My Day': 'মোৰ দিন', Calendar: 'কেলেণ্ডাৰ',
    'Items & Products': 'সামগ্ৰী আৰু উৎপাদন', Proposals: 'প্ৰস্তাৱ', Quotations: 'উদ্ধৃতি', 'Sales Orders': 'বিক্ৰী অৰ্ডাৰ', Invoices: 'চালান', Payments: 'পৰিশোধ',
    'Transport Routes': 'পৰিবহণ পথ', 'Dispatch Schedule': 'প্ৰেৰণ সময়সূচী', 'Trip Tracking': 'যাত্ৰা ট্ৰেকিং', Vehicles: 'বাহন', Drivers: 'চালক', Inventory: 'ভঁৰাল',
    Chat: 'চেট', Email: 'ইমেইল', Notifications: 'জাননী', 'Call Logs': 'কল লগ',
    'Sales Analytics': 'বিক্ৰী বিশ্লেষণ', 'Sales Reports': 'বিক্ৰী প্ৰতিবেদন', 'Lead Funnel': 'লিড ফানেল', Geographic: 'ভৌগোলিক', 'Report Builder': 'প্ৰতিবেদন নিৰ্মাতা',
    Staff: 'কৰ্মচাৰী', Attendance: 'উপস্থিতি', 'Roles & Permissions': 'ভূমিকা আৰু অনুমতি', Definitions: 'সংজ্ঞা', Company: 'কোম্পানী', Integrations: 'সংযোজন', 'Audit Log': 'অডিট লগ', System: 'ছিষ্টেম',
  },
  ur: {
    Workspace: 'ورک اسپیس', Sales: 'فروخت', Operations: 'آپریشنز', Communication: 'رابطہ', Insights: 'تجزیات', Admin: 'ایڈمن',
    Dashboard: 'ڈیش بورڈ', 'My Dashboard': 'میرا ڈیش بورڈ', Leads: 'لیڈز', Pipeline: 'پائپ لائن', Customers: 'گاہک', Tasks: 'کام', 'My Day': 'میرا دن', Calendar: 'کیلنڈر',
    'Items & Products': 'اشیاء اور مصنوعات', Proposals: 'تجاویز', Quotations: 'کوٹیشن', 'Sales Orders': 'فروخت آرڈرز', Invoices: 'رسیدیں', Payments: 'ادائیگیاں',
    'Transport Routes': 'ٹرانسپورٹ روٹس', 'Dispatch Schedule': 'ترسیل شیڈول', 'Trip Tracking': 'سفر ٹریکنگ', Vehicles: 'گاڑیاں', Drivers: 'ڈرائیور', Inventory: 'انوینٹری',
    Chat: 'چیٹ', Email: 'ای میل', Notifications: 'اطلاعات', 'Call Logs': 'کال لاگز',
    'Sales Analytics': 'فروخت تجزیات', 'Sales Reports': 'فروخت رپورٹس', 'Lead Funnel': 'لیڈ فنل', Geographic: 'جغرافیائی', 'Report Builder': 'رپورٹ بلڈر',
    Staff: 'عملہ', Attendance: 'حاضری', 'Roles & Permissions': 'کردار اور اجازتیں', Definitions: 'تعریفات', Company: 'کمپنی', Integrations: 'انضمام', 'Audit Log': 'آڈٹ لاگ', System: 'سسٹم',
  },
  sa: {
    Workspace: 'कार्यक्षेत्रम्', Sales: 'विक्रयः', Operations: 'संचालनम्', Communication: 'संचारः', Insights: 'विश्लेषणम्', Admin: 'प्रशासनम्',
    Dashboard: 'फलकम्', 'My Dashboard': 'मम फलकम्', Leads: 'सम्भाव्याः', Pipeline: 'प्रणाली', Customers: 'ग्राहकाः', Tasks: 'कार्याणि', 'My Day': 'मम दिनम्', Calendar: 'पञ्चाङ्गम्',
    'Items & Products': 'वस्तूनि उत्पादाश्च', Proposals: 'प्रस्तावाः', Quotations: 'मूल्यपत्राणि', 'Sales Orders': 'विक्रयादेशाः', Invoices: 'बीजकानि', Payments: 'भुगतानानि',
    'Transport Routes': 'परिवहनमार्गाः', 'Dispatch Schedule': 'प्रेषणसूची', 'Trip Tracking': 'यात्रानिरीक्षणम्', Vehicles: 'वाहनानि', Drivers: 'चालकाः', Inventory: 'संग्रहः',
    Chat: 'सम्भाषणम्', Email: 'विपत्रम्', Notifications: 'सूचनाः', 'Call Logs': 'दूरभाषअभिलेखाः',
    'Sales Analytics': 'विक्रयविश्लेषणम्', 'Sales Reports': 'विक्रयप्रतिवेदनानि', 'Lead Funnel': 'सम्भाव्यनाली', Geographic: 'भौगोलिकम्', 'Report Builder': 'प्रतिवेदननिर्माता',
    Staff: 'कर्मचारिणः', Attendance: 'उपस्थितिः', 'Roles & Permissions': 'भूमिकाः अनुमतयश्च', Definitions: 'परिभाषाः', Company: 'कम्पनी', Integrations: 'एकीकरणानि', 'Audit Log': 'अंकेक्षणअभिलेखः', System: 'तन्त्रम्',
  },
  ar: {
    Workspace: 'مساحة العمل', Sales: 'المبيعات', Operations: 'العمليات', Communication: 'التواصل', Insights: 'التحليلات', Admin: 'الإدارة',
    Dashboard: 'لوحة التحكم', 'My Dashboard': 'لوحتي', Leads: 'العملاء المحتملون', Pipeline: 'مسار الصفقات', Customers: 'العملاء', Tasks: 'المهام', 'My Day': 'يومي', Calendar: 'التقويم',
    'Items & Products': 'الأصناف والمنتجات', Proposals: 'العروض', Quotations: 'عروض الأسعار', 'Sales Orders': 'طلبات البيع', Invoices: 'الفواتير', Payments: 'المدفوعات',
    'Transport Routes': 'مسارات النقل', 'Dispatch Schedule': 'جدول الإرسال', 'Trip Tracking': 'تتبع الرحلات', Vehicles: 'المركبات', Drivers: 'السائقون', Inventory: 'المخزون',
    Chat: 'المحادثة', Email: 'البريد الإلكتروني', Notifications: 'الإشعارات', 'Call Logs': 'سجلات المكالمات',
    'Sales Analytics': 'تحليلات المبيعات', 'Sales Reports': 'تقارير المبيعات', 'Lead Funnel': 'قمع العملاء المحتملين', Geographic: 'جغرافي', 'Report Builder': 'منشئ التقارير',
    Staff: 'الموظفون', Attendance: 'الحضور', 'Roles & Permissions': 'الأدوار والصلاحيات', Definitions: 'التعريفات', Company: 'الشركة', Integrations: 'التكاملات', 'Audit Log': 'سجل التدقيق', System: 'النظام',
    Collapse: 'طيّ', 'Create New': 'إنشاء جديد', Lead: 'عميل محتمل', Customer: 'عميل', Proposal: 'عرض', Task: 'مهمة',
    'Display currency': 'عملة العرض', Language: 'اللغة', 'Switch Role (Demo)': 'تبديل الدور (تجريبي)', 'Profile Settings': 'إعدادات الملف الشخصي', 'Sign Out': 'تسجيل الخروج', 'Mark all read': 'تحديد الكل كمقروء', 'Search anything…': 'ابحث عن أي شيء…',
    'Welcome back': 'مرحبًا بعودتك', 'Sign in to your Sarvadesk workspace': 'سجّل الدخول إلى مساحة عمل Sarvadesk', 'Email Address': 'البريد الإلكتروني', Password: 'كلمة المرور', 'Remember me': 'تذكرني', 'Forgot password?': 'هل نسيت كلمة المرور؟', 'Sign In': 'تسجيل الدخول', 'New to Sarvadesk?': 'جديد على Sarvadesk؟', 'Create an account': 'إنشاء حساب',
    'Demo mode — any email & password works. Just click Sign In.': 'الوضع التجريبي — أي بريد إلكتروني وكلمة مرور يعملان. فقط اضغط تسجيل الدخول.',
  },
  fr: {
    Workspace: 'Espace de travail', Sales: 'Ventes', Operations: 'Opérations', Communication: 'Communication', Insights: 'Analyses', Admin: 'Administration',
    Dashboard: 'Tableau de bord', 'My Dashboard': 'Mon tableau de bord', Leads: 'Prospects', Pipeline: 'Pipeline', Customers: 'Clients', Tasks: 'Tâches', 'My Day': 'Ma journée', Calendar: 'Calendrier',
    'Items & Products': 'Articles et produits', Proposals: 'Propositions', Quotations: 'Devis', 'Sales Orders': 'Commandes', Invoices: 'Factures', Payments: 'Paiements',
    'Transport Routes': 'Itinéraires de transport', 'Dispatch Schedule': "Planning d'expédition", 'Trip Tracking': 'Suivi des trajets', Vehicles: 'Véhicules', Drivers: 'Chauffeurs', Inventory: 'Inventaire',
    Chat: 'Messagerie', Email: 'E-mail', Notifications: 'Notifications', 'Call Logs': "Journaux d'appels",
    'Sales Analytics': 'Analyses des ventes', 'Sales Reports': 'Rapports de ventes', 'Lead Funnel': 'Entonnoir des prospects', Geographic: 'Géographique', 'Report Builder': 'Générateur de rapports',
    Staff: 'Personnel', Attendance: 'Présence', 'Roles & Permissions': 'Rôles et permissions', Definitions: 'Définitions', Company: 'Entreprise', Integrations: 'Intégrations', 'Audit Log': "Journal d'audit", System: 'Système',
    Collapse: 'Réduire', 'Create New': 'Créer', Lead: 'Prospect', Customer: 'Client', Proposal: 'Proposition', Task: 'Tâche',
    'Display currency': "Devise d'affichage", Language: 'Langue', 'Switch Role (Demo)': 'Changer de rôle (démo)', 'Profile Settings': 'Paramètres du profil', 'Sign Out': 'Se déconnecter', 'Mark all read': 'Tout marquer comme lu', 'Search anything…': 'Rechercher…',
    'Welcome back': 'Bon retour', 'Sign in to your Sarvadesk workspace': 'Connectez-vous à votre espace Sarvadesk', 'Email Address': 'Adresse e-mail', Password: 'Mot de passe', 'Remember me': 'Se souvenir de moi', 'Forgot password?': 'Mot de passe oublié ?', 'Sign In': 'Se connecter', 'New to Sarvadesk?': 'Nouveau sur Sarvadesk ?', 'Create an account': 'Créer un compte',
    'Demo mode — any email & password works. Just click Sign In.': "Mode démo — n'importe quel e-mail et mot de passe fonctionnent. Cliquez sur Se connecter.",
  },
  de: {
    Workspace: 'Arbeitsbereich', Sales: 'Vertrieb', Operations: 'Betrieb', Communication: 'Kommunikation', Insights: 'Analysen', Admin: 'Verwaltung',
    Dashboard: 'Dashboard', 'My Dashboard': 'Mein Dashboard', Leads: 'Leads', Pipeline: 'Pipeline', Customers: 'Kunden', Tasks: 'Aufgaben', 'My Day': 'Mein Tag', Calendar: 'Kalender',
    'Items & Products': 'Artikel & Produkte', Proposals: 'Angebote', Quotations: 'Preisangebote', 'Sales Orders': 'Aufträge', Invoices: 'Rechnungen', Payments: 'Zahlungen',
    'Transport Routes': 'Transportrouten', 'Dispatch Schedule': 'Versandplan', 'Trip Tracking': 'Fahrtverfolgung', Vehicles: 'Fahrzeuge', Drivers: 'Fahrer', Inventory: 'Lagerbestand',
    Chat: 'Chat', Email: 'E-Mail', Notifications: 'Benachrichtigungen', 'Call Logs': 'Anrufprotokolle',
    'Sales Analytics': 'Vertriebsanalyse', 'Sales Reports': 'Vertriebsberichte', 'Lead Funnel': 'Lead-Trichter', Geographic: 'Geografisch', 'Report Builder': 'Berichtsersteller',
    Staff: 'Personal', Attendance: 'Anwesenheit', 'Roles & Permissions': 'Rollen & Berechtigungen', Definitions: 'Definitionen', Company: 'Unternehmen', Integrations: 'Integrationen', 'Audit Log': 'Audit-Protokoll', System: 'System',
    Collapse: 'Einklappen', 'Create New': 'Neu erstellen', Lead: 'Lead', Customer: 'Kunde', Proposal: 'Angebot', Task: 'Aufgabe', 'Display currency': 'Anzeigewährung', Language: 'Sprache', 'Switch Role (Demo)': 'Rolle wechseln (Demo)', 'Profile Settings': 'Profileinstellungen', 'Sign Out': 'Abmelden', 'Mark all read': 'Alle als gelesen markieren', 'Search anything…': 'Suchen…',
  },
  es: {
    Workspace: 'Espacio de trabajo', Sales: 'Ventas', Operations: 'Operaciones', Communication: 'Comunicación', Insights: 'Analíticas', Admin: 'Administración',
    Dashboard: 'Panel', 'My Dashboard': 'Mi panel', Leads: 'Prospectos', Pipeline: 'Embudo', Customers: 'Clientes', Tasks: 'Tareas', 'My Day': 'Mi día', Calendar: 'Calendario',
    'Items & Products': 'Artículos y productos', Proposals: 'Propuestas', Quotations: 'Cotizaciones', 'Sales Orders': 'Pedidos', Invoices: 'Facturas', Payments: 'Pagos',
    'Transport Routes': 'Rutas de transporte', 'Dispatch Schedule': 'Programación de despacho', 'Trip Tracking': 'Seguimiento de viajes', Vehicles: 'Vehículos', Drivers: 'Conductores', Inventory: 'Inventario',
    Chat: 'Chat', Email: 'Correo', Notifications: 'Notificaciones', 'Call Logs': 'Registros de llamadas',
    'Sales Analytics': 'Analítica de ventas', 'Sales Reports': 'Informes de ventas', 'Lead Funnel': 'Embudo de prospectos', Geographic: 'Geográfico', 'Report Builder': 'Generador de informes',
    Staff: 'Personal', Attendance: 'Asistencia', 'Roles & Permissions': 'Roles y permisos', Definitions: 'Definiciones', Company: 'Empresa', Integrations: 'Integraciones', 'Audit Log': 'Registro de auditoría', System: 'Sistema',
    Collapse: 'Contraer', 'Create New': 'Crear nuevo', Lead: 'Prospecto', Customer: 'Cliente', Proposal: 'Propuesta', Task: 'Tarea', 'Display currency': 'Moneda de visualización', Language: 'Idioma', 'Switch Role (Demo)': 'Cambiar rol (demo)', 'Profile Settings': 'Configuración del perfil', 'Sign Out': 'Cerrar sesión', 'Mark all read': 'Marcar todo como leído', 'Search anything…': 'Buscar…',
  },
  it: {
    Workspace: 'Area di lavoro', Sales: 'Vendite', Operations: 'Operazioni', Communication: 'Comunicazione', Insights: 'Analisi', Admin: 'Amministrazione',
    Dashboard: 'Dashboard', 'My Dashboard': 'La mia dashboard', Leads: 'Lead', Pipeline: 'Pipeline', Customers: 'Clienti', Tasks: 'Attività', 'My Day': 'La mia giornata', Calendar: 'Calendario',
    'Items & Products': 'Articoli e prodotti', Proposals: 'Proposte', Quotations: 'Preventivi', 'Sales Orders': 'Ordini', Invoices: 'Fatture', Payments: 'Pagamenti',
    'Transport Routes': 'Rotte di trasporto', 'Dispatch Schedule': 'Programma spedizioni', 'Trip Tracking': 'Tracciamento viaggi', Vehicles: 'Veicoli', Drivers: 'Autisti', Inventory: 'Inventario',
    Chat: 'Chat', Email: 'Email', Notifications: 'Notifiche', 'Call Logs': 'Registri chiamate',
    'Sales Analytics': 'Analisi vendite', 'Sales Reports': 'Rapporti vendite', 'Lead Funnel': 'Imbuto lead', Geographic: 'Geografico', 'Report Builder': 'Generatore di report',
    Staff: 'Personale', Attendance: 'Presenze', 'Roles & Permissions': 'Ruoli e permessi', Definitions: 'Definizioni', Company: 'Azienda', Integrations: 'Integrazioni', 'Audit Log': 'Registro attività', System: 'Sistema',
    Collapse: 'Comprimi', 'Create New': 'Crea nuovo', Lead: 'Lead', Customer: 'Cliente', Proposal: 'Proposta', Task: 'Attività', 'Display currency': 'Valuta di visualizzazione', Language: 'Lingua', 'Switch Role (Demo)': 'Cambia ruolo (demo)', 'Profile Settings': 'Impostazioni profilo', 'Sign Out': 'Esci', 'Mark all read': 'Segna tutto come letto', 'Search anything…': 'Cerca…',
  },
  pt: {
    Workspace: 'Área de trabalho', Sales: 'Vendas', Operations: 'Operações', Communication: 'Comunicação', Insights: 'Análises', Admin: 'Administração',
    Dashboard: 'Painel', 'My Dashboard': 'Meu painel', Leads: 'Leads', Pipeline: 'Funil', Customers: 'Clientes', Tasks: 'Tarefas', 'My Day': 'Meu dia', Calendar: 'Calendário',
    'Items & Products': 'Itens e produtos', Proposals: 'Propostas', Quotations: 'Cotações', 'Sales Orders': 'Pedidos', Invoices: 'Faturas', Payments: 'Pagamentos',
    'Transport Routes': 'Rotas de transporte', 'Dispatch Schedule': 'Agenda de expedição', 'Trip Tracking': 'Rastreamento de viagens', Vehicles: 'Veículos', Drivers: 'Motoristas', Inventory: 'Estoque',
    Chat: 'Chat', Email: 'E-mail', Notifications: 'Notificações', 'Call Logs': 'Registros de chamadas',
    'Sales Analytics': 'Análise de vendas', 'Sales Reports': 'Relatórios de vendas', 'Lead Funnel': 'Funil de leads', Geographic: 'Geográfico', 'Report Builder': 'Construtor de relatórios',
    Staff: 'Equipe', Attendance: 'Presença', 'Roles & Permissions': 'Funções e permissões', Definitions: 'Definições', Company: 'Empresa', Integrations: 'Integrações', 'Audit Log': 'Registro de auditoria', System: 'Sistema',
    Collapse: 'Recolher', 'Create New': 'Criar novo', Lead: 'Lead', Customer: 'Cliente', Proposal: 'Proposta', Task: 'Tarefa', 'Display currency': 'Moeda de exibição', Language: 'Idioma', 'Switch Role (Demo)': 'Mudar função (demo)', 'Profile Settings': 'Configurações do perfil', 'Sign Out': 'Sair', 'Mark all read': 'Marcar tudo como lido', 'Search anything…': 'Pesquisar…',
  },
  ru: {
    Workspace: 'Рабочая область', Sales: 'Продажи', Operations: 'Операции', Communication: 'Коммуникации', Insights: 'Аналитика', Admin: 'Администрирование',
    Dashboard: 'Панель', 'My Dashboard': 'Моя панель', Leads: 'Лиды', Pipeline: 'Воронка', Customers: 'Клиенты', Tasks: 'Задачи', 'My Day': 'Мой день', Calendar: 'Календарь',
    'Items & Products': 'Товары и продукты', Proposals: 'Предложения', Quotations: 'Расценки', 'Sales Orders': 'Заказы', Invoices: 'Счета', Payments: 'Платежи',
    'Transport Routes': 'Маршруты', 'Dispatch Schedule': 'График отгрузки', 'Trip Tracking': 'Отслеживание рейсов', Vehicles: 'Транспорт', Drivers: 'Водители', Inventory: 'Склад',
    Chat: 'Чат', Email: 'Почта', Notifications: 'Уведомления', 'Call Logs': 'Журнал звонков',
    'Sales Analytics': 'Аналитика продаж', 'Sales Reports': 'Отчёты по продажам', 'Lead Funnel': 'Воронка лидов', Geographic: 'География', 'Report Builder': 'Конструктор отчётов',
    Staff: 'Персонал', Attendance: 'Посещаемость', 'Roles & Permissions': 'Роли и права', Definitions: 'Определения', Company: 'Компания', Integrations: 'Интеграции', 'Audit Log': 'Журнал аудита', System: 'Система',
    Collapse: 'Свернуть', 'Create New': 'Создать', Lead: 'Лид', Customer: 'Клиент', Proposal: 'Предложение', Task: 'Задача', 'Display currency': 'Валюта отображения', Language: 'Язык', 'Switch Role (Demo)': 'Сменить роль (демо)', 'Profile Settings': 'Настройки профиля', 'Sign Out': 'Выйти', 'Mark all read': 'Отметить всё как прочитанное', 'Search anything…': 'Поиск…',
  },
  zh: {
    Workspace: '工作区', Sales: '销售', Operations: '运营', Communication: '沟通', Insights: '分析', Admin: '管理',
    Dashboard: '仪表板', 'My Dashboard': '我的仪表板', Leads: '线索', Pipeline: '销售管道', Customers: '客户', Tasks: '任务', 'My Day': '我的一天', Calendar: '日历',
    'Items & Products': '商品与产品', Proposals: '报价方案', Quotations: '报价单', 'Sales Orders': '销售订单', Invoices: '发票', Payments: '付款',
    'Transport Routes': '运输路线', 'Dispatch Schedule': '调度计划', 'Trip Tracking': '行程跟踪', Vehicles: '车辆', Drivers: '司机', Inventory: '库存',
    Chat: '聊天', Email: '邮件', Notifications: '通知', 'Call Logs': '通话记录',
    'Sales Analytics': '销售分析', 'Sales Reports': '销售报表', 'Lead Funnel': '线索漏斗', Geographic: '地理', 'Report Builder': '报表生成器',
    Staff: '员工', Attendance: '考勤', 'Roles & Permissions': '角色与权限', Definitions: '定义', Company: '公司', Integrations: '集成', 'Audit Log': '审计日志', System: '系统',
    Collapse: '收起', 'Create New': '新建', Lead: '线索', Customer: '客户', Proposal: '报价', Task: '任务', 'Display currency': '显示货币', Language: '语言', 'Switch Role (Demo)': '切换角色（演示）', 'Profile Settings': '个人设置', 'Sign Out': '退出登录', 'Mark all read': '全部标为已读', 'Search anything…': '搜索…',
  },
  ja: {
    Workspace: 'ワークスペース', Sales: '営業', Operations: '業務', Communication: 'コミュニケーション', Insights: '分析', Admin: '管理',
    Dashboard: 'ダッシュボード', 'My Dashboard': 'マイダッシュボード', Leads: 'リード', Pipeline: 'パイプライン', Customers: '顧客', Tasks: 'タスク', 'My Day': 'マイデイ', Calendar: 'カレンダー',
    'Items & Products': '商品・製品', Proposals: '提案', Quotations: '見積', 'Sales Orders': '受注', Invoices: '請求書', Payments: '支払い',
    'Transport Routes': '輸送ルート', 'Dispatch Schedule': '配車スケジュール', 'Trip Tracking': '配送追跡', Vehicles: '車両', Drivers: 'ドライバー', Inventory: '在庫',
    Chat: 'チャット', Email: 'メール', Notifications: '通知', 'Call Logs': '通話履歴',
    'Sales Analytics': '売上分析', 'Sales Reports': '売上レポート', 'Lead Funnel': 'リードファネル', Geographic: '地域', 'Report Builder': 'レポートビルダー',
    Staff: 'スタッフ', Attendance: '勤怠', 'Roles & Permissions': '役割と権限', Definitions: '定義', Company: '会社', Integrations: '連携', 'Audit Log': '監査ログ', System: 'システム',
    Collapse: '折りたたむ', 'Create New': '新規作成', Lead: 'リード', Customer: '顧客', Proposal: '提案', Task: 'タスク', 'Display currency': '表示通貨', Language: '言語', 'Switch Role (Demo)': '役割を切替 (デモ)', 'Profile Settings': 'プロフィール設定', 'Sign Out': 'ログアウト', 'Mark all read': 'すべて既読にする', 'Search anything…': '検索…',
  },
  ko: {
    Workspace: '워크스페이스', Sales: '영업', Operations: '운영', Communication: '커뮤니케이션', Insights: '분석', Admin: '관리',
    Dashboard: '대시보드', 'My Dashboard': '내 대시보드', Leads: '리드', Pipeline: '파이프라인', Customers: '고객', Tasks: '작업', 'My Day': '마이 데이', Calendar: '캘린더',
    'Items & Products': '품목 및 제품', Proposals: '제안서', Quotations: '견적', 'Sales Orders': '판매 주문', Invoices: '송장', Payments: '결제',
    'Transport Routes': '운송 경로', 'Dispatch Schedule': '배차 일정', 'Trip Tracking': '운송 추적', Vehicles: '차량', Drivers: '기사', Inventory: '재고',
    Chat: '채팅', Email: '이메일', Notifications: '알림', 'Call Logs': '통화 기록',
    'Sales Analytics': '영업 분석', 'Sales Reports': '영업 보고서', 'Lead Funnel': '리드 퍼널', Geographic: '지역', 'Report Builder': '보고서 작성기',
    Staff: '직원', Attendance: '근태', 'Roles & Permissions': '역할 및 권한', Definitions: '정의', Company: '회사', Integrations: '통합', 'Audit Log': '감사 로그', System: '시스템',
    Collapse: '접기', 'Create New': '새로 만들기', Lead: '리드', Customer: '고객', Proposal: '제안', Task: '작업', 'Display currency': '표시 통화', Language: '언어', 'Switch Role (Demo)': '역할 전환 (데모)', 'Profile Settings': '프로필 설정', 'Sign Out': '로그아웃', 'Mark all read': '모두 읽음 표시', 'Search anything…': '검색…',
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
    // 1) an explicit saved preference always wins for returning users.
    const saved = readStorage<LangCode | null>(STORAGE_KEY, null);
    if (saved && LANGUAGES.some((l) => l.code === saved)) {
      set({ code: saved });
      return;
    }
    // 2) otherwise auto-detect from the browser (falls back to English).
    const detected = detectLanguage();
    if (detected !== 'en') set({ code: detected });
  },
}));

/** Active BCP-47 locale (non-reactive) for use inside formatters. */
export function activeLocale(): string {
  return localeFor(useLanguageStore.getState().code);
}

export function translate(code: LangCode, key: string): string {
  if (code === 'en') return key;
  return translations[code]?.[key] ?? key;
}

/** Hook returning a translate function; re-renders when the language changes. */
export function useT(): (key: string) => string {
  const code = useLanguageStore((s) => s.code);
  return (key: string) => translate(code, key);
}
