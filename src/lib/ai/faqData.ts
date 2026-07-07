// AUTO-GENERATED from ai-training/training-data.json — do not edit by hand.
// Regenerate after editing the dataset. Consumed by faq.ts for retrieval.

export interface FaqRecord {
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  related_features: string[];
  source: string;
}

export const FAQ_DATA: FaqRecord[] = [
  {
    "category": "General",
    "question": "What is this application?",
    "answer": "This is **Sarvadesk** — a CRM built specifically for oil & gas and petrochemical trading. It brings your whole trading operation into one place: leads and pipeline, customers, products, quotations, sales orders, invoices, payments, logistics and dispatch, reports, and a self-service customer portal.\n\nEverything is role-based, so each team member sees the parts relevant to their job. If you tell me your role, I can point you to the right area.",
    "keywords": [
      "what is this application",
      "sarvadesk",
      "application",
      "about the app",
      "what does this do",
      "what is sarvadesk"
    ],
    "related_features": [
      "Dashboard",
      "Customer Portal",
      "AI Assistant"
    ],
    "source": "src/lib/nav.ts"
  },
  {
    "category": "General",
    "question": "What kind of business is this CRM for?",
    "answer": "It's tailored for **oil & gas and petrochemical trading**. The product catalogue is organised into six categories — Oil & Fuel, Solvents, Glycols, Plastic Granules, Lubricants, and Specialty Chemicals — and the workflows (bulk volumes in KL/L, GST invoicing, tanker dispatch, blended-tank costing) are built around how a fuel and chemicals trader actually operates.",
    "keywords": [
      "what business",
      "industry",
      "oil",
      "gas",
      "petrochemical",
      "trading",
      "who is this for",
      "domain"
    ],
    "related_features": [
      "Items & Products",
      "Transport Routes",
      "ERP Calculator"
    ],
    "source": "src/lib/constants.ts"
  },
  {
    "category": "Login & Access",
    "question": "How do I log in?",
    "answer": "In the current demo build, sign-in is open — enter **any email and any password** on the login screen and you'll go straight into the app with sample data. That's intentional so you can explore every role without setup.\n\nWhen the CRM is connected to a real backend, you'd sign in with the credentials your administrator issues you instead.",
    "keywords": [
      "log in",
      "login",
      "sign in",
      "signin",
      "password",
      "credentials",
      "access",
      "cannot login"
    ],
    "related_features": [
      "Demo Mode"
    ],
    "source": "src/pages/auth/Login.tsx"
  },
  {
    "category": "Login & Access",
    "question": "Is my data saved permanently?",
    "answer": "In demo mode, your data lives in **your browser's local storage** — it persists on the same device and browser, but it isn't a shared server database, so it won't appear on another device and it can be cleared.\n\nFor a permanent, multi-user setup the CRM can be connected to a real backend (Supabase), where data is stored centrally and shared across your team.",
    "keywords": [
      "data saved",
      "saved",
      "storage",
      "persist",
      "database",
      "lost data",
      "where is my data"
    ],
    "related_features": [
      "Demo Mode",
      "System Settings"
    ],
    "source": "src/lib/storage.ts"
  },
  {
    "category": "Login & Access",
    "question": "How do I reset the demo data?",
    "answer": "You can clear the sample data and start fresh from **Admin → System settings** (the Reset Demo Data option), which wipes the local data and re-seeds a new set of sample records.\n\nIf you ever need a hard reset, clearing your browser's site storage for the app has the same effect — the CRM regenerates the demo data on the next load.",
    "keywords": [
      "reset",
      "clear data",
      "demo data",
      "start over",
      "re-seed",
      "reseed",
      "wipe"
    ],
    "related_features": [
      "System Settings"
    ],
    "source": "src/lib/storage.ts"
  },
  {
    "category": "Roles & Permissions",
    "question": "What user roles are there?",
    "answer": "There are five roles:\n\n- **Admin** — full access to everything, including staff, settings and the ERP Calculator.\n- **Sales Manager** — manages leads, customers, quotations (with approval) and orders; views invoices and reports.\n- **Sales Executive** — works leads, customers, quotations and tasks; can't see invoices or profit margins.\n- **Accounts** — full control of invoices and payments; view-only elsewhere.\n- **Customer** — sees only their own customer portal.\n\nEach role's menu and actions are shaped by these permissions.",
    "keywords": [
      "roles",
      "user roles",
      "permissions",
      "who can",
      "access levels",
      "admin",
      "sales manager",
      "sales executive",
      "accounts",
      "customer role"
    ],
    "related_features": [
      "Roles & Permissions",
      "Staff"
    ],
    "source": "src/lib/permissions.ts"
  },
  {
    "category": "Roles & Permissions",
    "question": "What can an Admin do?",
    "answer": "An **Admin** has full access across the whole CRM — leads, customers, products, quotations, orders, invoices and payments, operations, communication and reports — plus the admin-only areas: **Staff, Attendance, Roles & Permissions, Definitions, Company settings, Integrations, Audit Log and System**. The **ERP Calculator** is also Admin-only.",
    "keywords": [
      "admin",
      "administrator",
      "admin can do",
      "admin access",
      "full access",
      "superuser"
    ],
    "related_features": [
      "Staff",
      "Roles & Permissions",
      "ERP Calculator",
      "Audit Log"
    ],
    "source": "src/lib/permissions.ts"
  },
  {
    "category": "Roles & Permissions",
    "question": "What can a Sales Executive do?",
    "answer": "A **Sales Executive** can create and edit **leads, customers, quotations and tasks**, and view sales orders and reports. They **cannot** access invoices and payments, and — importantly — **profit margins and cost prices are hidden** from them. Staff, settings and the ERP Calculator are out of scope for this role.",
    "keywords": [
      "sales executive",
      "executive",
      "rep",
      "salesperson",
      "what can executive do",
      "margins hidden"
    ],
    "related_features": [
      "Leads",
      "Customers",
      "Proposals"
    ],
    "source": "src/lib/permissions.ts"
  },
  {
    "category": "Roles & Permissions",
    "question": "What can the Accounts role do?",
    "answer": "The **Accounts** role has **full control of Invoices and Payments** — creating, editing, recording payments and managing the collections workflow — and view-only access to the rest of the CRM (customers, orders, reports, etc.). It's designed for the finance/billing team.",
    "keywords": [
      "accounts",
      "accountant",
      "finance",
      "billing",
      "accounts role",
      "invoices payments role"
    ],
    "related_features": [
      "Invoices",
      "Payments"
    ],
    "source": "src/lib/permissions.ts"
  },
  {
    "category": "Roles & Permissions",
    "question": "Who can see profit margins and cost prices?",
    "answer": "Only **Admin** and **Sales Manager** roles can see profit margins and cost rates. They're deliberately hidden from Sales Executives (and from the customer portal) so that costing stays confidential to management.",
    "keywords": [
      "margins",
      "profit",
      "cost price",
      "who sees margins",
      "cost rate",
      "profitability",
      "hidden cost"
    ],
    "related_features": [
      "Items & Products",
      "Reports"
    ],
    "source": "src/lib/permissions.ts"
  },
  {
    "category": "Roles & Permissions",
    "question": "How do I change roles and permissions?",
    "answer": "An Admin can adjust them under **Admin → Roles & Permissions**. It's a visual matrix where you toggle what each role can view, create, edit, delete or approve across every module. Changes shape what menus and buttons each role sees.\n\nNote this is a prototype-level permission layer that controls the UI; a production deployment would pair it with server-side enforcement.",
    "keywords": [
      "change permissions",
      "edit roles",
      "roles and permissions",
      "permission matrix",
      "manage access",
      "rbac"
    ],
    "related_features": [
      "Roles & Permissions"
    ],
    "source": "src/pages/settings"
  },
  {
    "category": "Customer Portal",
    "question": "As a customer, can I see other customers' data?",
    "answer": "No. The customer portal is strictly scoped to **your own account** — you'll only ever see your own orders, invoices, payments and documents. Company-wide figures and other customers' records are never shown to a customer login, and the AI assistant follows the same rule.",
    "keywords": [
      "customer see other",
      "privacy",
      "my data only",
      "other customers",
      "scoped",
      "isolation"
    ],
    "related_features": [
      "Customer Portal"
    ],
    "source": "src/lib/ai/assistant.ts"
  },
  {
    "category": "Navigation",
    "question": "What are the main sections of the CRM?",
    "answer": "For staff, the sidebar is grouped into:\n\n- **Workspace** — Dashboard, AI Assistant, Leads, Pipeline, Customers, Tasks, Calendar (and ERP Calculator for Admins).\n- **Sales** — Items & Products, Proposals, Quotations, Sales Orders, Invoices, Payments.\n- **Operations** — Transport Routes, Dispatch Schedule, Trip Tracking, Vehicles, Drivers, Inventory.\n- **Communication** — Chat, Email, Notifications, Call Logs.\n- **Insights** — Sales Analytics, Sales Reports, Lead Funnel, Geographic, Report Builder.\n- **Admin** — Staff, Attendance, Roles & Permissions, Company, and other settings.\n\nWhat you actually see depends on your role.",
    "keywords": [
      "sections",
      "modules",
      "menu",
      "sidebar",
      "navigation",
      "what modules",
      "features list",
      "areas"
    ],
    "related_features": [
      "Dashboard"
    ],
    "source": "src/lib/nav.ts"
  },
  {
    "category": "Leads",
    "question": "How do leads and the pipeline work?",
    "answer": "Leads are your prospects. Each lead moves through stages — **New → Contacted → Qualified → Proposal Sent → Negotiation → Won/Lost** — and carries a temperature (**Hot, Warm, Cold, Follow-up**) plus a source (Website, Referral, IndiaMART, WhatsApp, etc.).\n\nThe **Pipeline** view is a drag-and-drop kanban board showing every lead by stage, so you can see and move deals at a glance. When a lead is Won, you can convert it into a customer.",
    "keywords": [
      "leads",
      "pipeline",
      "prospects",
      "kanban",
      "lead stages",
      "lead status",
      "hot warm cold",
      "funnel"
    ],
    "related_features": [
      "Pipeline",
      "Lead Funnel",
      "Customers"
    ],
    "source": "src/lib/constants.ts"
  },
  {
    "category": "Leads",
    "question": "How do I convert a lead into a customer?",
    "answer": "Open the lead and use the **Convert** action — it carries the company and contact details over into a new customer record, where you can then set the credit limit, payment terms and addresses. Won leads are the usual candidates for conversion.",
    "keywords": [
      "convert lead",
      "lead to customer",
      "won lead",
      "conversion",
      "turn lead into customer"
    ],
    "related_features": [
      "Leads",
      "Customers"
    ],
    "source": "src/pages/leads/LeadConvert.tsx"
  },
  {
    "category": "Customers",
    "question": "How do I add a new customer?",
    "answer": "Go to **Customers → New Customer** and fill in:\n\n1. Company name, **GSTIN / PAN**, industry and segment.\n2. **Billing and shipping addresses**, plus at least one contact.\n3. **Credit limit** and **payment terms** (NET days).\n\nSave, and the account is ready for quotations, orders, invoices and — if you enable it — the customer portal.",
    "keywords": [
      "add customer",
      "new customer",
      "create customer",
      "onboard customer",
      "customer setup"
    ],
    "related_features": [
      "Customers",
      "Customer Portal"
    ],
    "source": "src/pages/customers"
  },
  {
    "category": "Customers",
    "question": "What are customer segments?",
    "answer": "Segments help you group and prioritise accounts. The available segments are **VIP, Standard, New, Dormant, Industrial, Retail and Reseller**. You'll see them as coloured badges on customer records and can filter and report by them.",
    "keywords": [
      "segments",
      "customer segment",
      "vip",
      "categories",
      "customer types",
      "classification"
    ],
    "related_features": [
      "Customers",
      "Customer Segments"
    ],
    "source": "src/lib/constants.ts"
  },
  {
    "category": "Customers",
    "question": "What is a credit limit and payment terms?",
    "answer": "The **credit limit** is the maximum outstanding balance a customer is allowed to carry. **Payment terms** are the number of NET days they have to pay an invoice (for example, NET 30).\n\nWhen a customer's outstanding exceeds their limit, or an invoice runs past its terms, it feeds the overdue and collections workflow so your team can follow up.",
    "keywords": [
      "credit limit",
      "payment terms",
      "net days",
      "outstanding limit",
      "credit",
      "terms"
    ],
    "related_features": [
      "Customers",
      "Invoices",
      "Payments"
    ],
    "source": "src/pages/customers"
  },
  {
    "category": "Products & Units",
    "question": "What products does the CRM handle?",
    "answer": "The catalogue is organised into six categories:\n\n- **Oil & Fuel** (e.g. HSD/diesel, petrol/MS, LDO, furnace oil, transformer oil)\n- **Lubricants**\n- **Glycols**\n- **Solvents**\n- **Plastic Granules**\n- **Specialty Chemicals**\n\nEach item carries its HSN code, GST rate, rate per unit, stock and warehouse.",
    "keywords": [
      "products",
      "items",
      "catalogue",
      "catalog",
      "what products",
      "goods",
      "categories",
      "diesel petrol"
    ],
    "related_features": [
      "Items & Products"
    ],
    "source": "src/lib/constants.ts"
  },
  {
    "category": "Products & Units",
    "question": "What units of measure are used?",
    "answer": "The CRM uses just two volume units — **Kilolitre (KL)** and **Litre (L)** — with **1 KL = 1,000 L**. Bulk fuels are traded in KL and smaller lots (like lubricants) in litres. Large litre volumes are shown in KL automatically, since KL is the industry norm for bulk oil.",
    "keywords": [
      "units",
      "kl",
      "litre",
      "liter",
      "kilolitre",
      "unit of measure",
      "volume unit",
      "measurement"
    ],
    "related_features": [
      "Items & Products",
      "ERP Calculator"
    ],
    "source": "src/lib/constants.ts"
  },
  {
    "category": "Currency",
    "question": "Which currencies are supported?",
    "answer": "Eleven currencies are available: **INR** (default) plus **USD, CAD, EUR, GBP**, and the GCC currencies **AED, SAR, QAR, KWD, BHD and OMR**.\n\nAll amounts are stored in Indian Rupees and converted to your chosen currency for display using indicative demo rates — so switching currency changes how figures are shown, not the underlying data.",
    "keywords": [
      "currency",
      "currencies",
      "usd",
      "aed",
      "dirham",
      "riyal",
      "multi-currency",
      "foreign currency",
      "exchange"
    ],
    "related_features": [
      "Currency Switcher"
    ],
    "source": "src/stores/currencyStore.ts"
  },
  {
    "category": "Currency",
    "question": "How do I change the display currency?",
    "answer": "Use the **currency switcher in the top bar** — pick a currency and every amount across the CRM re-formats instantly. Your choice is remembered on your device. Remember the rates are indicative for the demo, so use it to preview how figures look in another currency rather than as a live FX feed.",
    "keywords": [
      "change currency",
      "switch currency",
      "currency selector",
      "set currency",
      "display currency"
    ],
    "related_features": [
      "Currency Switcher"
    ],
    "source": "src/stores/currencyStore.ts"
  },
  {
    "category": "Language",
    "question": "Which languages does the CRM support?",
    "answer": "The interface supports **26 languages**: English, 15 Indian languages (Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Urdu, Kannada, Odia, Malayalam, Punjabi, Assamese, Sanskrit, Kashmiri, Sindhi), and Arabic, French, German, Spanish, Italian, Portuguese, Russian, Chinese, Japanese and Korean.\n\nIt auto-detects your browser language on first visit, and **Arabic, Urdu and Kashmiri render right-to-left**.",
    "keywords": [
      "languages",
      "language",
      "multi-language",
      "translation",
      "hindi",
      "arabic",
      "rtl",
      "localisation",
      "localization"
    ],
    "related_features": [
      "Language Switcher"
    ],
    "source": "src/lib/i18n.ts"
  },
  {
    "category": "Language",
    "question": "How do I change the language?",
    "answer": "Pick your language from the **language switcher in the top bar**. The whole interface updates immediately, dates and numbers reformat to that locale, and right-to-left languages (Arabic, Urdu, Kashmiri) flip the layout automatically. Your choice is saved for next time.",
    "keywords": [
      "change language",
      "switch language",
      "set language",
      "language selector"
    ],
    "related_features": [
      "Language Switcher"
    ],
    "source": "src/lib/i18n.ts"
  },
  {
    "category": "Quotations",
    "question": "What is the difference between proposals and quotations?",
    "answer": "Both are pre-sale pricing documents you send to a customer, and they share the same lifecycle: **Draft → Sent → Under Review → Negotiation → Won / Lost** (or Expired). High-value ones can require **approval** before they go out. Once a quotation is accepted, you convert it into a sales order or invoice in one step.",
    "keywords": [
      "proposals",
      "quotations",
      "quote",
      "quotation",
      "difference proposal quotation",
      "estimate"
    ],
    "related_features": [
      "Proposals",
      "Quotations",
      "Sales Orders"
    ],
    "source": "src/lib/constants.ts"
  },
  {
    "category": "Quotations",
    "question": "How do I create a quotation?",
    "answer": "Open **Sales → Proposals → New**, choose the customer, and add product lines with quantities and rates — GST is applied per line and the totals calculate automatically. Review it (high-value quotes may need manager approval), then send it. When the customer accepts, use **Convert** to turn it into an order or invoice.",
    "keywords": [
      "create quotation",
      "new quotation",
      "make quote",
      "raise quotation",
      "how to quote",
      "create proposal"
    ],
    "related_features": [
      "Proposals",
      "Quotations"
    ],
    "source": "src/pages/sales/ProposalForm.tsx"
  },
  {
    "category": "Sales Orders",
    "question": "How do sales orders work?",
    "answer": "A sales order is the confirmed deal, usually created from an accepted quotation. It moves through **Confirmed → Processing → Partially Dispatched → Dispatched → Delivered** (or Cancelled), and links to the dispatches and invoices raised against it — so you can follow an order from confirmation all the way to delivery and billing.",
    "keywords": [
      "sales order",
      "orders",
      "order status",
      "how orders work",
      "order lifecycle",
      "so"
    ],
    "related_features": [
      "Sales Orders",
      "Dispatch Schedule",
      "Invoices"
    ],
    "source": "src/pages/sales"
  },
  {
    "category": "Invoices",
    "question": "How do I create an invoice?",
    "answer": "Go to **Sales → Invoices → New Invoice** (or convert an accepted quotation or order). Then:\n\n1. Pick the **customer** — their GST details, address and terms fill in automatically.\n2. Add **line items**: product, quantity (KL/L) and rate; GST applies per line.\n3. Review the **subtotal, GST (CGST/SGST or IGST) and total**, and add any transport charge.\n4. **Save** to issue it, then use the **PDF** button to download or share.\n\nConverting from an order copies the lines for you and sets the due date from the customer's payment terms.",
    "keywords": [
      "create invoice",
      "new invoice",
      "raise invoice",
      "make invoice",
      "how to invoice",
      "generate invoice",
      "bill"
    ],
    "related_features": [
      "Invoices",
      "Payments"
    ],
    "source": "src/pages/sales/CreateInvoice.tsx"
  },
  {
    "category": "Invoices",
    "question": "What invoice statuses are there?",
    "answer": "An invoice can be:\n\n- **Unpaid** — issued, nothing paid yet.\n- **Partial** — part-paid, with a balance remaining.\n- **Paid** — fully settled.\n- **Overdue** — past its due date with money still owing.\n\nEach shows as a colour-coded badge so you can spot what needs attention.",
    "keywords": [
      "invoice status",
      "statuses",
      "paid",
      "unpaid",
      "partial",
      "overdue",
      "invoice states"
    ],
    "related_features": [
      "Invoices"
    ],
    "source": "src/lib/constants.ts"
  },
  {
    "category": "Invoices",
    "question": "When does an invoice become overdue?",
    "answer": "An invoice turns **overdue** when today's date is past its due date — that is, past the **invoice date plus the customer's payment terms (NET days)** — and there's still a balance owing. It usually means a delayed payment or a customer running past their agreed credit terms, and it flags the account for follow-up.",
    "keywords": [
      "when does invoice become overdue",
      "become overdue",
      "why overdue",
      "overdue meaning",
      "past due date",
      "late payment"
    ],
    "related_features": [
      "Invoices",
      "Payments"
    ],
    "source": "src/lib/constants.ts"
  },
  {
    "category": "Invoices",
    "question": "What GST is applied to invoices?",
    "answer": "Petroleum products in the CRM typically carry **18% GST**. It's split as **CGST + SGST** for sales within the same state, or **IGST** for inter-state sales, and each invoice shows the split along with the tax-inclusive total. The system supports the standard GST slabs (0, 5, 12, 18, 28%).",
    "keywords": [
      "gst",
      "gst on invoices",
      "gst applied",
      "tax",
      "cgst",
      "sgst",
      "igst",
      "tax rate",
      "vat",
      "gst rate"
    ],
    "related_features": [
      "Invoices"
    ],
    "source": "src/lib/constants.ts"
  },
  {
    "category": "Payments",
    "question": "How do I record a payment?",
    "answer": "Open **Payments** (or the customer's invoice) and choose **Record Payment**. Then:\n\n1. Select the **invoice(s)** being settled.\n2. Enter the **amount**, **mode** (NEFT, RTGS, UPI, Cheque or Cash) and a **reference**.\n3. Save — the invoice moves to **Partial** or **Paid** and the customer's outstanding updates automatically.\n\nYou can download the **receipt** from the payment row afterwards. Cheques are realised after clearing (2–3 working days).",
    "keywords": [
      "record payment",
      "add payment",
      "receive payment",
      "log payment",
      "payment entry",
      "receipt",
      "collect payment"
    ],
    "related_features": [
      "Payments",
      "Invoices"
    ],
    "source": "src/pages/portal/PortalPayments.tsx"
  },
  {
    "category": "Payments",
    "question": "How do I see who has outstanding payments?",
    "answer": "Head to **Payments** for the full outstanding picture, or just ask me — I can tell you the total outstanding, who owes the most, and payments received this month. For example: *\"who has pending payments?\"* or *\"how much is outstanding?\"*",
    "keywords": [
      "outstanding",
      "who owes",
      "pending payments",
      "receivables",
      "unpaid customers",
      "collections",
      "dues"
    ],
    "related_features": [
      "Payments",
      "AI Assistant"
    ],
    "source": "src/lib/ai/assistant.ts"
  },
  {
    "category": "Operations",
    "question": "How does dispatch and logistics work?",
    "answer": "Operations covers the physical movement of goods. You schedule a **dispatch** against an order, assign a **vehicle, driver and route**, and it flows through **Scheduled → Loading → In Transit → Delivered** (or Returned/Cancelled). **Trip Tracking** shows live status and current location, and **Vehicles, Drivers and Inventory** keep the supporting records.",
    "keywords": [
      "dispatch",
      "logistics",
      "delivery",
      "shipment",
      "transport",
      "operations",
      "trip",
      "vehicle",
      "driver"
    ],
    "related_features": [
      "Dispatch Schedule",
      "Trip Tracking",
      "Vehicles",
      "Drivers"
    ],
    "source": "src/lib/nav.ts"
  },
  {
    "category": "Operations",
    "question": "What are Transport Routes and which countries are covered?",
    "answer": "**Transport Routes** is your haulage network — each route lists the origin and destination, distance, carrier, base rent and per-km rate.\n\nThere's a **country selector at the top** of the page. **India** is driven by your live data (and you can add routes there), while nine other markets ship with curated corridors: **UAE, Saudi Arabia, Qatar, Kuwait, Oman, Bahrain, United States, United Kingdom and Canada**.",
    "keywords": [
      "transport routes",
      "routes",
      "countries",
      "haulage",
      "carrier",
      "route network",
      "logistics routes",
      "uae saudi"
    ],
    "related_features": [
      "Transport Routes",
      "Dispatch Schedule"
    ],
    "source": "src/lib/transportRoutes.ts"
  },
  {
    "category": "Operations",
    "question": "How do I track an order or shipment?",
    "answer": "For staff, **Operations → Trip Tracking** shows each dispatch's status and current location. Customers can follow their own deliveries under **Product Tracking** in the portal, which lays out the journey from Scheduled through Loading, In Transit and Delivered with truck, driver and route details.",
    "keywords": [
      "track order",
      "track shipment",
      "tracking",
      "where is my order",
      "delivery status",
      "product tracking",
      "trip tracking"
    ],
    "related_features": [
      "Trip Tracking",
      "Product Tracking"
    ],
    "source": "src/pages/portal/ProductTracking.tsx"
  },
  {
    "category": "ERP Calculator",
    "question": "What is the ERP Calculator?",
    "answer": "The **ERP Calculator** is an Admin-only costing tool for blended lots of oil. For each tank you enter the **purchase price (₹/L)**, **density (g/L)** and **volume (litres)**, and it works out:\n\n- **Kg per tank** and the totals (Total Litre, Total KL, Total Kg)\n- **Weighted average density**\n- **Blended average price**\n- **Total price** across all tanks\n\nThat gives an accurate per-kg and per-litre cost when stock from several tanks is mixed, so pricing and margins stay correct.",
    "keywords": [
      "erp calculator",
      "erp",
      "costing",
      "blended cost",
      "tank",
      "density calculator",
      "what is erp calculator"
    ],
    "related_features": [
      "ERP Calculator"
    ],
    "source": "src/pages/portal/ErpCalculator.tsx"
  },
  {
    "category": "ERP Calculator",
    "question": "How is weighted density calculated?",
    "answer": "Weighted (blended) density is the volume-weighted average across tanks — not a plain average. The calculator does it like this:\n\n- For each tank, **Kg = (Litre × Density) ÷ 1000**.\n- **Total Kg** = sum of all tanks' kg; **Total Litre** = sum of all tanks' litres.\n- **Weighted density (g/L) = (Total Kg ÷ Total Litre) × 1000**.\n\nExample: Tank A 10,000 L @ 840 g/L (8,400 kg) and Tank B 5,000 L @ 820 g/L (4,100 kg) → 15,000 L and 12,500 kg → (12,500 ÷ 15,000) × 1000 = **833.3 g/L**, nearer Tank A because it holds more volume.",
    "keywords": [
      "weighted density",
      "average density",
      "blended density",
      "density formula",
      "how is density calculated",
      "kg litre"
    ],
    "related_features": [
      "ERP Calculator"
    ],
    "source": "src/lib/erp.ts"
  },
  {
    "category": "ERP Calculator",
    "question": "Who can use the ERP Calculator?",
    "answer": "The ERP Calculator is **Admin-only** — it's an internal costing tool, so it's deliberately hidden from Sales Managers, Sales Executives, Accounts and the customer portal. Admins find it in the **Workspace** group of the sidebar.",
    "keywords": [
      "who can use",
      "who can use erp",
      "erp access",
      "erp permission",
      "erp admin",
      "erp calculator access"
    ],
    "related_features": [
      "ERP Calculator",
      "Roles & Permissions"
    ],
    "source": "src/lib/permissions.ts"
  },
  {
    "category": "Reports & Analytics",
    "question": "What reports and analytics are available?",
    "answer": "Under **Insights** you'll find:\n\n- **Sales Analytics** — KPI dashboard with trends and product/customer breakdowns.\n- **Sales Reports** — detailed sales performance.\n- **Lead Funnel** — conversion through the pipeline stages.\n- **Geographic** — sales by region/state.\n- **Report Builder** — assemble a custom view.\n\nYou can also just ask me — e.g. *\"show analytics for last year's sales\"* or *\"compare Brent and diesel\"* — and I'll pull the figures.",
    "keywords": [
      "reports",
      "analytics",
      "insights",
      "dashboards",
      "statistics",
      "sales report",
      "funnel",
      "geographic",
      "kpi"
    ],
    "related_features": [
      "Sales Analytics",
      "Sales Reports",
      "Report Builder",
      "AI Assistant"
    ],
    "source": "src/lib/nav.ts"
  },
  {
    "category": "Reports & Analytics",
    "question": "Can I export data to Excel or PDF?",
    "answer": "Yes. Most list and table views have an **Export** button that downloads the current data to **Excel**, and documents like invoices, quotations and receipts can be downloaded as **PDF** from their detail pages. Filters you've applied are respected in the export.",
    "keywords": [
      "export",
      "excel",
      "pdf",
      "download data",
      "spreadsheet",
      "csv",
      "export report"
    ],
    "related_features": [
      "Reports",
      "Invoices"
    ],
    "source": "src/lib/excel.ts"
  },
  {
    "category": "Communication",
    "question": "What communication tools are built in?",
    "answer": "The **Communication** group includes an internal **Chat**, an **Email** composer, a **Notifications** centre, and **Call Logs** for recording customer calls — so routine follow-ups and internal coordination can happen without leaving the CRM.",
    "keywords": [
      "communication",
      "chat",
      "email",
      "call logs",
      "notifications",
      "messaging",
      "contact tools"
    ],
    "related_features": [
      "Chat",
      "Email",
      "Notifications",
      "Call Logs"
    ],
    "source": "src/lib/nav.ts"
  },
  {
    "category": "Customer Portal",
    "question": "What can customers do in the portal?",
    "answer": "The customer portal is a self-service area where your customers can:\n\n- See a **dashboard** of their account at a glance\n- **Track orders and shipments** (Active, In Transit, Delivered, History)\n- View and download **invoices and documents** (e-invoices, challans, receipts, credit/debit notes)\n- Check **payments, outstanding balance and terms**\n- Watch **live market prices**\n- Read **notifications**, raise **support tickets**, and manage their **profile**\n\nEverything is limited to their own account.",
    "keywords": [
      "customer portal",
      "portal",
      "what can customers do",
      "self service",
      "customer login",
      "client portal"
    ],
    "related_features": [
      "Customer Portal",
      "Product Tracking",
      "Documents"
    ],
    "source": "src/lib/customerNav.ts"
  },
  {
    "category": "Customer Portal",
    "question": "Can customers download their invoices?",
    "answer": "Yes — in the portal, customers can open **Documents → Invoices** (or Bills & Invoices) and download any invoice, e-invoice, challan or receipt as a **PDF** using the download button on each row. They can also filter by document type.",
    "keywords": [
      "download invoice",
      "customer invoice",
      "portal invoice",
      "pdf invoice",
      "get invoice",
      "bill download"
    ],
    "related_features": [
      "Customer Portal",
      "Documents"
    ],
    "source": "src/pages/portal/DocumentCenter.tsx"
  },
  {
    "category": "Customer Portal",
    "question": "Can I switch between customer accounts in the demo?",
    "answer": "Yes — the customer portal has a **\"Viewing account\" switcher** at the top of its sidebar that lets you preview the portal as any of three sample customers. It's a demo aid for showing how each customer sees only their own data; each account has its own orders, invoices and payments.",
    "keywords": [
      "switch customer",
      "account switcher",
      "view as customer",
      "multiple customers",
      "demo customers",
      "change account"
    ],
    "related_features": [
      "Customer Portal"
    ],
    "source": "src/hooks/usePortalCustomer.ts"
  },
  {
    "category": "Market Prices",
    "question": "Where can I see live oil and fuel prices?",
    "answer": "Staff see a **Live Market** panel (for example on the dashboard), and customers have a **Market** section in the portal. It shows benchmark crude and fuel quotes — **Brent, WTI, natural gas, diesel, petrol, LPG, CNG and ATF** — with their change and an auto-refresh.\n\nOne honest note: in the demo this is an **indicative, simulated feed** for illustration, not a live external market data API.",
    "keywords": [
      "live prices",
      "market prices",
      "oil price",
      "brent",
      "wti",
      "fuel prices",
      "market",
      "benchmark",
      "diesel price"
    ],
    "related_features": [
      "Live Market",
      "Customer Portal"
    ],
    "source": "src/lib/market.ts"
  },
  {
    "category": "AI Assistant",
    "question": "What can the AI assistant do?",
    "answer": "I answer questions grounded in your real CRM data — sales and transport volumes, invoices, payments, shipments, customers and live prices — and I adapt how much detail I give:\n\n- Quick facts for simple questions\n- Detailed **explanations** when you ask me to explain a concept\n- Step-by-step **guides** for how-to questions\n- Tables and breakdowns for **analytics, reports and comparisons**\n\nI also remember the conversation, so you can ask natural follow-ups, and I stay within your role's permissions.",
    "keywords": [
      "ai assistant",
      "assistant",
      "what can you do",
      "chatbot",
      "ai help",
      "bot",
      "virtual assistant"
    ],
    "related_features": [
      "AI Assistant"
    ],
    "source": "src/lib/ai/assistant.ts"
  },
  {
    "category": "AI Assistant",
    "question": "Does the assistant remember previous messages?",
    "answer": "Yes. Each chat thread keeps its own memory, so you can ask follow-ups without repeating yourself — for example *\"how much sales last year?\"* then *\"and the year before that?\"* then *\"break that down by month.\"* It tracks the topic, product, time period and customer you're discussing, and it even remembers a few things across separate chats. Starting a new chat gives you a clean slate.",
    "keywords": [
      "remember",
      "memory",
      "context",
      "follow up",
      "previous messages",
      "conversation memory",
      "does it remember"
    ],
    "related_features": [
      "AI Assistant"
    ],
    "source": "src/lib/ai/assistant.ts"
  },
  {
    "category": "AI Assistant",
    "question": "Is the assistant powered by real AI?",
    "answer": "In the current demo it runs on a **grounded rule engine** — it reads your real CRM data and never invents numbers, but it isn't a live large-language model. The app is built so a **real Claude LLM can be switched on** by deploying a small backend proxy (which safely holds the API key); when enabled, it answers more flexibly while still being grounded in the same data. Until then, the built-in engine handles everything.",
    "keywords": [
      "real ai",
      "llm",
      "gpt",
      "claude",
      "powered by",
      "chatgpt",
      "language model",
      "is it ai"
    ],
    "related_features": [
      "AI Assistant"
    ],
    "source": "src/lib/ai/llm.ts"
  },
  {
    "category": "AI Assistant",
    "question": "Can the assistant show me data I'm not allowed to see?",
    "answer": "No. The assistant runs inside your role's permissions — a customer only ever gets their own orders, invoices and payments, and staff see what their role allows. Company-wide totals and other customers' records are refused for a customer login, so answers never cross a permission boundary.",
    "keywords": [
      "assistant permissions",
      "role aware",
      "secure",
      "data access",
      "assistant privacy",
      "can assistant see",
      "assistant see data",
      "not allowed to see"
    ],
    "related_features": [
      "AI Assistant",
      "Roles & Permissions"
    ],
    "source": "src/lib/ai/assistant.ts"
  },
  {
    "category": "Troubleshooting",
    "question": "Why do recent months show no sales data?",
    "answer": "The demo ships with a fixed window of **sample data** that runs up to about mid-2026, so very recent periods like \"this month\" or \"last month\" can come back empty — there simply are no seeded records that recent. Try **\"last year\"**, **\"this year\"**, or a specific month that has data, and the figures will appear. On a real backend with live data this isn't an issue.",
    "keywords": [
      "no data",
      "empty",
      "last month empty",
      "old numbers",
      "missing data",
      "no sales",
      "why empty"
    ],
    "related_features": [
      "Reports",
      "AI Assistant"
    ],
    "source": "src/lib/seed/generate.ts"
  },
  {
    "category": "General",
    "question": "Is this a live product or a demo?",
    "answer": "What you're using is a **fully working demo** of the Sarvadesk CRM — every screen and workflow is real, but it runs on in-browser sample data with open sign-in so it's easy to explore. It can be connected to a real backend (Supabase for data, and an optional AI backend) to become a live, multi-user system.",
    "keywords": [
      "demo",
      "live",
      "production",
      "prototype",
      "is this real",
      "demo or live"
    ],
    "related_features": [
      "Demo Mode"
    ],
    "source": "src/lib/config.ts"
  }
];
