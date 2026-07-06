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
];

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
  return translations[code]?.[key] ?? key;
}

/** Hook returning a translate function; re-renders when the language changes. */
export function useT(): (key: string) => string {
  const code = useLanguageStore((s) => s.code);
  return (key: string) => translate(code, key);
}
