// New grounded intents that expand the base 52 (ai-training/intents.base.json).
// Each: { id, cat, src, feat[], a (answer), ask[] (natural phrasings),
// act[] (verb phrases for prefix expansion), noun[] (noun phrases), kw[] extra keywords }.
// Answers are grounded in the real app — nonexistent modules are answered honestly.

export const NEW_INTENTS = [
  { id: 'logout', cat: 'Login & Access', src: 'src/components/layout/Topbar.tsx', feat: ['Account'],
    a: "You can sign out from the profile/avatar menu in the top-right corner — it returns you to the login screen. In demo mode you can sign back in with any email and password.",
    ask: ['How do I log out?', 'Where is the sign out button?'], act: ['log out', 'sign out'], noun: ['the logout option'], kw: ['logout', 'signout', 'exit'] },

  { id: 'darkmode', cat: 'General', src: 'src/components/layout/Topbar.tsx', feat: ['Theme'],
    a: "Yes — switch between light and dark using the theme toggle in the top bar. Your choice is saved on your device for next time.",
    ask: ['How do I turn on dark mode?', 'Is there a dark theme?'], act: ['switch to dark mode', 'turn on dark mode', 'change the theme', 'enable night mode'], noun: ['dark mode', 'the theme setting'], kw: ['dark mode', 'light mode', 'night mode', 'theme'] },

  { id: 'mobile', cat: 'General', src: 'src/components/layout/MobileBottomNav.tsx', feat: ['Responsive UI'],
    a: "The CRM is fully responsive and works in a mobile browser — on phones a bottom navigation bar replaces the sidebar. There isn't a separate native app to install.",
    ask: ['Is there a mobile app?', 'Does this work on my phone?', 'Can I use it on mobile?'], act: ['use it on mobile', 'use it on my phone', 'access it on a tablet'], noun: ['a mobile app', 'mobile support'], kw: ['mobile', 'phone', 'tablet', 'app', 'responsive', 'ios', 'android'] },

  { id: 'search', cat: 'Navigation', src: 'src/components/shared/CommandPalette.tsx', feat: ['Command Palette'],
    a: "Use the global search / command palette from the top bar to quickly jump to any page or record without clicking through the menus.",
    ask: ['How do I search?', 'Is there a global search?', 'Where is the command palette?'], act: ['search', 'find a record quickly', 'jump to a page'], noun: ['the global search', 'the command palette'], kw: ['search', 'find', 'command palette', 'quick search', 'lookup'] },

  { id: 'shortcuts', cat: 'Navigation', src: 'src/components/shared/KeyboardShortcutsModal.tsx', feat: ['Keyboard Shortcuts'],
    a: "Yes, there are keyboard shortcuts for common actions — open the keyboard shortcuts help to see the full list.",
    ask: ['Are there keyboard shortcuts?', 'What hotkeys are available?'], act: ['use keyboard shortcuts', 'see the shortcuts'], noun: ['keyboard shortcuts', 'hotkeys'], kw: ['shortcut', 'hotkey', 'keyboard'] },

  { id: 'sidebar', cat: 'Navigation', src: 'src/components/layout/Sidebar.tsx', feat: ['Sidebar'],
    a: "You can collapse the sidebar down to icons using the toggle at its edge — handy on smaller screens. The collapsed/expanded state is remembered.",
    ask: ['How do I collapse the sidebar?', 'Can I hide the menu?'], act: ['collapse the sidebar', 'hide the menu', 'shrink the navigation'], noun: ['the sidebar toggle'], kw: ['sidebar', 'collapse', 'menu', 'navigation'] },

  { id: 'mydashboard', cat: 'Navigation', src: 'src/pages/dashboard/MyDashboard.tsx', feat: ['Dashboard', 'My Dashboard'],
    a: "The Dashboard is the company-wide overview (sales, KPIs, activity), while My Dashboard focuses on your own figures and targets. Both live in the Workspace group.",
    ask: ['What is My Dashboard?', "What's the difference between Dashboard and My Dashboard?"], act: [], noun: ['my dashboard', 'the difference between dashboard and my dashboard'], kw: ['my dashboard', 'personal dashboard'] },

  { id: 'tasks', cat: 'Tasks & Calendar', src: 'src/lib/nav.ts', feat: ['Tasks', 'My Day', 'Calendar'],
    a: "Tasks let you track to-dos with a status (Not Started, In Progress, Completed) and priority. Create one from the Tasks page; My Day gives a focused daily view and Calendar a month view.",
    ask: ['How do I create a task?', 'What is My Day?', 'Where is the calendar?'], act: ['create a task', 'add a to-do', 'schedule a task', 'set a reminder'], noun: ['the tasks module', 'my day', 'the calendar'], kw: ['task', 'to-do', 'todo', 'my day', 'calendar', 'reminder'] },

  { id: 'editrecord', cat: 'General', src: 'src/lib/permissions.ts', feat: ['Roles & Permissions'],
    a: "Yes, if your role has edit rights — open the record and use Edit. Admins and Sales Managers can edit most things, Sales Executives their own areas, and Accounts is view-only outside billing.",
    ask: ['Can I edit a record after saving it?', 'How do I edit something?'], act: ['edit a record', 'edit a customer', 'update a record', 'change a saved record'], noun: ['editing records'], kw: ['edit', 'update', 'modify', 'change record'] },

  { id: 'deleterecord', cat: 'General', src: 'src/lib/permissions.ts', feat: ['Roles & Permissions'],
    a: "Deleting is limited by role — Admins can delete across the CRM and Sales Managers can delete leads and customers, but most other roles can't. There's no undo, so remove records carefully.",
    ask: ['How do I delete a record?', 'Can I delete a customer?', 'Who can delete records?'], act: ['delete a record', 'delete a customer', 'delete a lead', 'remove an entry'], noun: ['deleting records'], kw: ['delete', 'remove', 'trash'] },

  { id: 'undo', cat: 'Troubleshooting', src: 'src/lib/storage.ts', feat: [],
    a: "There isn't an undo or restore for deletions in the current build, so please double-check before removing anything. If you're in the demo, a full data reset regenerates the sample records.",
    ask: ['Can I undo a delete?', 'I accidentally deleted something, can I get it back?', 'Is there a way to restore a deleted record?'], act: ['undo a delete', 'restore a deleted record', 'recover data'], noun: ['an undo option', 'a recycle bin'], kw: ['undo', 'restore', 'recover', 'deleted', 'accidentally'] },

  { id: 'import', cat: 'General', src: 'src/lib/excel.ts', feat: ['Export'],
    a: "You can export most tables to Excel (and documents to PDF), but bulk import isn't available in the demo — records are created through the on-screen forms.",
    ask: ['Can I import data?', 'How do I bulk upload records?', 'Can I upload a spreadsheet?'], act: ['import data', 'bulk import records', 'upload a spreadsheet'], noun: ['an import option', 'bulk upload'], kw: ['import', 'upload', 'bulk', 'csv', 'spreadsheet'] },

  { id: 'tablefilter', cat: 'General', src: 'src/components/shared/DataTable.tsx', feat: ['Data Table'],
    a: "Most list views support a search box, column sorting and toolbar filters, plus an Export button. Type in the search, click a column header to sort, and use the filter controls to narrow results.",
    ask: ['How do I filter a list?', 'Can I sort a table?', 'How do I search within a table?'], act: ['filter a list', 'sort a table', 'search a list', 'narrow down results'], noun: ['filters', 'sorting', 'the search box'], kw: ['filter', 'sort', 'search table', 'columns'] },

  { id: 'leadsources', cat: 'Leads', src: 'src/lib/constants.ts', feat: ['Leads'],
    a: "Lead sources include Website, Referral, Cold Call, Trade Show, IndiaMART, JustDial, WhatsApp, Walk-in and Other — so you can see where each prospect came from.",
    ask: ['What lead sources are there?', 'Where do leads come from?'], act: [], noun: ['lead sources', 'the lead source options'], kw: ['lead source', 'indiamart', 'justdial', 'whatsapp', 'referral'] },

  { id: 'leadtemp', cat: 'Leads', src: 'src/lib/constants.ts', feat: ['Leads'],
    a: "A lead's temperature signals how promising it is: Hot, Warm, Cold, Follow-up, Irrelevant or Other. It shows as a colour-coded badge and a subtle row tint in the leads list.",
    ask: ['What do lead temperatures mean?', 'What is a hot lead?'], act: [], noun: ['lead temperature', 'hot warm and cold leads'], kw: ['temperature', 'hot lead', 'warm lead', 'cold lead', 'follow-up'] },

  { id: 'movelead', cat: 'Leads', src: 'src/pages/leads/LeadPipeline.tsx', feat: ['Pipeline'],
    a: "In the Pipeline (kanban) view you drag a lead card from one stage column to another to update its stage — for example from Qualified to Proposal Sent.",
    ask: ['How do I move a lead in the pipeline?', 'Can I drag leads between stages?'], act: ['move a lead', 'drag a lead', 'change a lead stage', 'advance a lead'], noun: ['moving leads in the pipeline'], kw: ['pipeline', 'drag', 'stage', 'move lead', 'kanban'] },

  { id: 'assignlead', cat: 'Leads', src: 'src/pages/leads', feat: ['Leads', 'Tasks'],
    a: "Leads and tasks have an owner; you can assign or reassign the owner from the record. Sales Managers can reassign work across their team.",
    ask: ['How do I assign a lead to someone?', 'Can I change the lead owner?'], act: ['assign a lead', 'change the lead owner', 'reassign a lead', 'assign a task'], noun: ['lead ownership'], kw: ['assign', 'owner', 'reassign'] },

  { id: 'addcontact', cat: 'Customers', src: 'src/pages/customers', feat: ['Customers'],
    a: "Open the customer record and add contacts with name, designation, phone and email — each customer can hold several contacts for different people you deal with.",
    ask: ['How do I add a contact to a customer?', 'Can a customer have multiple contacts?'], act: ['add a contact', 'add a contact person', 'add a second contact'], noun: ['customer contacts'], kw: ['contact', 'contact person', 'add contact'] },

  { id: 'creditbreach', cat: 'Customers', src: 'src/pages/customers', feat: ['Customers', 'Payments'],
    a: "The credit limit is a customer's maximum allowed outstanding balance. When they exceed it, or run past their payment terms, the account is flagged for collections/follow-up. In the demo it surfaces the risk rather than hard-blocking new orders.",
    ask: ['What happens if a customer exceeds their credit limit?', 'What if the credit limit is reached?'], act: [], noun: ['exceeding the credit limit', 'a credit limit breach'], kw: ['credit limit exceeded', 'over limit', 'credit breach'] },

  { id: 'hsn', cat: 'Products & Units', src: 'src/lib/seed/pools.ts', feat: ['Items & Products', 'Invoices'],
    a: "Every product carries an HSN code and GST rate. The HSN code classifies the goods for tax and appears on invoices for GST compliance.",
    ask: ['What is the HSN code?', 'Where do I set the HSN code?'], act: [], noun: ['the hsn code', 'product tax codes'], kw: ['hsn', 'hsn code', 'tax code'] },

  { id: 'stock', cat: 'Operations', src: 'src/pages/portal/ProductTracking.tsx', feat: ['Inventory', 'Items & Products'],
    a: "Each item shows a stock level and warehouse. The Inventory page and the portal's live availability list current stock, and items running low are flagged so you can reorder.",
    ask: ['How do I check stock?', 'Where do I see inventory levels?', 'Is there stock information?'], act: ['check stock', 'see inventory levels', 'view available stock'], noun: ['stock levels', 'the inventory'], kw: ['stock', 'inventory', 'availability', 'warehouse'] },

  { id: 'lowstock', cat: 'Operations', src: 'src/pages/portal/ProductTracking.tsx', feat: ['Inventory'],
    a: "Products running low are flagged (for example a 'Low' badge when stock falls under the threshold) so the team knows to reorder before running out.",
    ask: ['Is there a low stock warning?', 'How do I know when stock is low?'], act: [], noun: ['low stock warnings', 'stock alerts'], kw: ['low stock', 'out of stock', 'reorder', 'stock alert'] },

  { id: 'approvalthreshold', cat: 'Quotations', src: 'src/lib/seed/generate.ts', feat: ['Proposals'],
    a: "High-value quotations need manager approval before they go out. In the sample data, anything over roughly ₹10,00,000 (10 lakh) is marked as needing approval.",
    ask: ['When does a quotation need approval?', 'What is the approval threshold?', 'Why does my proposal need approval?'], act: [], noun: ['proposal approval', 'the approval threshold', 'when approval is needed'], kw: ['approval', 'approve proposal', 'threshold', 'high value'] },

  { id: 'convertquote', cat: 'Quotations', src: 'src/pages/sales/ProposalForm.tsx', feat: ['Proposals', 'Sales Orders', 'Invoices'],
    a: "Once a quotation is accepted, use Convert to turn it straight into a sales order or an invoice — the product lines carry over so you don't re-enter them.",
    ask: ['How do I convert a quotation to an order?', 'Can I turn a quote into an invoice?'], act: ['convert a quotation', 'turn a quote into an order', 'convert a quote to an invoice'], noun: ['converting quotations'], kw: ['convert quote', 'accept quotation', 'quote to order'] },

  { id: 'proposalexpired', cat: 'Quotations', src: 'src/lib/constants.ts', feat: ['Proposals'],
    a: "A quotation can be marked Expired once it lapses. If a customer comes back later, you'd raise a fresh quote at current rates rather than reopening the old one.",
    ask: ['What does an expired proposal mean?', 'Why is my quotation expired?'], act: [], noun: ['expired proposals', 'proposal expiry'], kw: ['expired', 'expiry', 'lapsed quote'] },

  { id: 'partialdispatch', cat: 'Sales Orders', src: 'src/pages/portal/PortalOrders.tsx', feat: ['Sales Orders', 'Dispatch Schedule'],
    a: "An order shows as Partially Dispatched when only some of its lines or quantities have shipped, before it reaches Dispatched and then Delivered.",
    ask: ['What is a partially dispatched order?', 'Why is my order partially dispatched?'], act: [], noun: ['partial dispatch', 'a partially dispatched order'], kw: ['partial dispatch', 'partially dispatched', 'split shipment'] },

  { id: 'einvoice', cat: 'Invoices', src: 'src/pages/portal/DocumentCenter.tsx', feat: ['Invoices', 'Customer Portal'],
    a: "Alongside the tax invoice, an e-invoice is generated. Customers can view and download it from the Documents section of the portal.",
    ask: ['What is an e-invoice?', 'Where do I find e-invoices?'], act: ['download an e-invoice'], noun: ['e-invoices', 'the electronic invoice'], kw: ['e-invoice', 'einvoice', 'electronic invoice'] },

  { id: 'challan', cat: 'Operations', src: 'src/pages/portal/DocumentCenter.tsx', feat: ['Customer Portal', 'Dispatch Schedule'],
    a: "A delivery challan accompanies a shipment. It's one of the documents customers can view and download from the portal's Documents section, alongside LR copies and weight slips.",
    ask: ['What is a delivery challan?', 'Where do I get the challan?'], act: ['download a delivery challan'], noun: ['delivery challans', 'the challan'], kw: ['challan', 'delivery challan', 'lr copy'] },

  { id: 'creditnote', cat: 'Invoices', src: 'src/pages/portal/DocumentCenter.tsx', feat: ['Invoices', 'Customer Portal'],
    a: "Credit and debit notes are supported document types and appear in the portal's Documents section. A credit note reduces what a customer owes; a debit note increases it.",
    ask: ['What is a credit note?', "What's a debit note?", 'Where are credit notes?'], act: [], noun: ['credit notes', 'debit notes'], kw: ['credit note', 'debit note'] },

  { id: 'paymentmodes', cat: 'Payments', src: 'src/pages/portal/PortalPayments.tsx', feat: ['Payments'],
    a: "Accepted payment modes are NEFT, RTGS, UPI, Cheque and Cash. You pick the mode when recording a payment, along with a reference number.",
    ask: ['What payment methods are accepted?', 'Which payment modes can I use?'], act: [], noun: ['payment modes', 'accepted payment methods'], kw: ['payment mode', 'neft', 'rtgs', 'upi', 'cheque', 'cash', 'payment method'] },

  { id: 'chequeclearing', cat: 'Payments', src: 'src/pages/portal/PortalPayments.tsx', feat: ['Payments'],
    a: "Cheque payments realise after clearing — typically 2–3 working days — whereas NEFT, RTGS and UPI settle much faster.",
    ask: ['How long does a cheque take to clear?', 'When does a cheque payment settle?'], act: [], noun: ['cheque clearing time'], kw: ['cheque clearing', 'clearing time', 'cheque'] },

  { id: 'outstandingvsoverdue', cat: 'Payments', src: 'src/lib/ai/assistant.ts', feat: ['Payments', 'Invoices'],
    a: "Outstanding is any unpaid balance a customer carries. Overdue is the part of that which is past its due date. So all overdue amounts are outstanding, but freshly-issued unpaid invoices are outstanding without being overdue yet.",
    ask: ["What's the difference between outstanding and overdue?", 'Is outstanding the same as overdue?'], act: [], noun: ['the difference between outstanding and overdue'], kw: ['outstanding vs overdue', 'overdue vs outstanding', 'difference'] },

  { id: 'addroute', cat: 'Operations', src: 'src/pages/operations/TransportRoutes.tsx', feat: ['Transport Routes'],
    a: "For India, add a route from Transport Routes → Add Route, entering origin, destination, distance, carrier and rates. The other countries in the dropdown show curated reference routes rather than editable ones.",
    ask: ['How do I add a transport route?', 'Can I create a new route?'], act: ['add a transport route', 'create a route', 'add a new corridor'], noun: ['adding routes'], kw: ['add route', 'new route', 'transport route', 'corridor'] },

  { id: 'assignvehicle', cat: 'Operations', src: 'src/pages/operations', feat: ['Dispatch Schedule', 'Vehicles', 'Drivers'],
    a: "When you schedule a dispatch you assign a vehicle and driver from the Vehicles and Drivers records, along with the route and scheduled date.",
    ask: ['How do I assign a vehicle to a dispatch?', 'Can I assign a driver?'], act: ['assign a vehicle', 'assign a driver', 'allocate a truck'], noun: ['vehicles and drivers'], kw: ['vehicle', 'driver', 'truck', 'assign vehicle'] },

  { id: 'triplocation', cat: 'Operations', src: 'src/pages/operations/TripTracking.tsx', feat: ['Trip Tracking'],
    a: "Trip Tracking shows each dispatch's status and current location as it moves Scheduled → Loading → In Transit → Delivered, along with vehicle and driver details.",
    ask: ['Where is my shipment right now?', 'How do I see a trip location?'], act: ['track a trip', 'see a shipment location'], noun: ['the current location of a trip', 'live tracking'], kw: ['trip', 'location', 'live tracking', 'where is'] },

  { id: 'erpaddtank', cat: 'ERP Calculator', src: 'src/pages/portal/ErpCalculator.tsx', feat: ['ERP Calculator'],
    a: "In the ERP Calculator, use + Add Tank to add a tank row, then enter its price (₹/L), density (g/L) and litres. The totals and blended figures recompute instantly as you type.",
    ask: ['How do I add a tank in the ERP Calculator?', 'Can I add more tanks?'], act: ['add a tank', 'add another tank in the erp calculator'], noun: ['adding tanks'], kw: ['add tank', 'erp tank', 'tank row'] },

  { id: 'erptotals', cat: 'ERP Calculator', src: 'src/pages/portal/ErpCalculator.tsx', feat: ['ERP Calculator'],
    a: "The ERP Calculator's summary tiles show Total Litre, Total KL, Total Kg, average (weighted) density, blended average price and total price for the tanks you enter.",
    ask: ['What totals does the ERP Calculator show?', 'Where is the Total KL?'], act: [], noun: ['the erp totals', 'total kl in the calculator'], kw: ['total kl', 'erp totals', 'total kg', 'blended price'] },

  { id: 'salesanalytics', cat: 'Reports & Analytics', src: 'src/pages/dashboard/SalesAnalytics.tsx', feat: ['Sales Analytics'],
    a: "Sales Analytics gives KPI cards — total sales, quantity sold (in KL), average rate and margin — with trend charts and breakdowns by product and customer.",
    ask: ['What does Sales Analytics show?', 'Where are the sales KPIs?'], act: ['see sales analytics'], noun: ['sales analytics', 'the sales kpis', 'sales dashboards'], kw: ['analytics', 'kpi', 'sales analytics', 'metrics'] },

  { id: 'leadfunnel', cat: 'Reports & Analytics', src: 'src/pages/reports/LeadFunnel', feat: ['Lead Funnel'],
    a: "The Lead Funnel report visualises how leads convert through the pipeline stages — from New down to Won — so you can spot where deals drop off.",
    ask: ['What is the Lead Funnel report?', 'Where do I see conversion rates?'], act: [], noun: ['the lead funnel', 'the conversion report'], kw: ['funnel', 'conversion', 'lead funnel'] },

  { id: 'georeport', cat: 'Reports & Analytics', src: 'src/pages/reports/GeographicReport.tsx', feat: ['Geographic'],
    a: "The Geographic report breaks sales down by region/state, so you can see which areas are performing.",
    ask: ['What is the Geographic report?', 'Can I see sales by region?'], act: [], noun: ['the geographic report', 'sales by region'], kw: ['geographic', 'region', 'state', 'map', 'territory'] },

  { id: 'reportbuilder', cat: 'Reports & Analytics', src: 'src/pages/reports', feat: ['Report Builder'],
    a: "Report Builder lets you assemble a custom report view from the available fields, so you're not limited to the ready-made reports.",
    ask: ['What is the Report Builder?', 'Can I build a custom report?'], act: ['build a custom report', 'create my own report'], noun: ['the report builder'], kw: ['report builder', 'custom report'] },

  { id: 'addcurrency', cat: 'Currency', src: 'src/stores/currencyStore.ts', feat: ['Currency Switcher'],
    a: "The 11 currencies are a fixed set in the demo — you switch between them but can't add a new one. All amounts are stored in INR and converted for display.",
    ask: ['Can I add a new currency?', 'Is the currency list customizable?'], act: ['add a currency', 'add a custom currency'], noun: ['adding a currency'], kw: ['add currency', 'custom currency', 'new currency'] },

  { id: 'defaultcurrency', cat: 'Currency', src: 'src/stores/currencyStore.ts', feat: ['Currency Switcher'],
    a: "The default display currency is the Indian Rupee (INR). You can switch to any of the other ten currencies from the top bar at any time.",
    ask: ['What is the default currency?', 'Which currency is used by default?'], act: [], noun: ['the default currency'], kw: ['default currency', 'inr', 'base currency'] },

  { id: 'attendance', cat: 'Staff & Admin', src: 'src/lib/nav.ts', feat: ['Attendance', 'Staff'],
    a: "Yes — Admins have an Attendance page under the Admin group for staff attendance, alongside Staff management. It's part of the team/admin tools.",
    ask: ['Is there attendance tracking?', 'Where is attendance?', 'Does the system have attendance?'], act: ['track attendance', 'mark attendance'], noun: ['attendance', 'attendance tracking'], kw: ['attendance', 'clock in', 'presence'] },

  { id: 'staff', cat: 'Staff & Admin', src: 'src/lib/nav.ts', feat: ['Staff', 'Roles & Permissions'],
    a: "Admins manage the team under Admin → Staff, with each person's access set in Roles & Permissions. Other roles don't see staff management.",
    ask: ['How do I add a staff member?', 'Where do I manage the team?'], act: ['add a staff member', 'manage staff', 'add an employee'], noun: ['staff management'], kw: ['staff', 'employee', 'team member', 'user management'] },

  { id: 'payroll', cat: 'Availability', src: 'src/lib/nav.ts', feat: [],
    a: "Payroll isn't part of this CRM — it focuses on sales, operations and billing. There are Staff and Attendance pages for the team, but no salary or payroll processing.",
    ask: ['Is there payroll?', 'Does the system handle salaries?', 'Can I run payroll?'], act: ['run payroll', 'process salaries'], noun: ['payroll', 'salary processing'], kw: ['payroll', 'salary', 'wages', 'pay slip'] },

  { id: 'hr', cat: 'Availability', src: 'src/lib/nav.ts', feat: [],
    a: "There's no HR or recruitment module — this is a sales and trading CRM. It has Staff and Attendance for your team, but not hiring, onboarding or HR workflows.",
    ask: ['Is there an HR module?', 'Can I manage recruitment?', 'Does it have hiring features?'], act: ['manage recruitment', 'post a job', 'onboard an employee'], noun: ['an hr module', 'recruitment', 'hiring'], kw: ['hr', 'human resources', 'recruiting', 'recruitment', 'hiring', 'onboarding'] },

  { id: 'projects', cat: 'Availability', src: 'src/lib/nav.ts', feat: [],
    a: "There's no dedicated projects module. Work is organised around leads, quotations, orders, dispatches and tasks rather than projects.",
    ask: ['Is there a projects module?', 'Can I manage projects?'], act: ['create a project', 'manage projects'], noun: ['projects', 'project management'], kw: ['project', 'projects', 'project management'] },

  { id: 'tickets', cat: 'Availability', src: 'src/pages/portal/PortalSupport.tsx', feat: ['Customer Portal'],
    a: "Customers can raise support tickets in the portal, but there isn't a separate internal IT helpdesk or ticketing system for staff.",
    ask: ['Is there a ticketing system?', 'Do you have a helpdesk?'], act: ['raise an internal ticket', 'open a helpdesk ticket'], noun: ['a ticketing system', 'an internal helpdesk'], kw: ['ticket', 'helpdesk', 'internal ticket', 'it support'] },

  { id: 'auditlog', cat: 'Staff & Admin', src: 'src/lib/nav.ts', feat: ['Audit Log'],
    a: "Admins can review an Audit Log under settings to see a trail of system activity.",
    ask: ['Is there an audit log?', 'Can I see who changed what?'], act: ['view the audit log', 'see activity history'], noun: ['the audit log', 'activity history'], kw: ['audit', 'audit log', 'activity log', 'history'] },

  { id: 'company', cat: 'Staff & Admin', src: 'src/lib/nav.ts', feat: ['Company'],
    a: "Admin → Company holds your company profile (name, address, tax details) that's used across invoices and documents.",
    ask: ['Where do I set company details?', 'How do I edit the company profile?'], act: ['edit company details', 'set up the company profile'], noun: ['company settings', 'the company profile'], kw: ['company', 'company profile', 'organisation'] },

  { id: 'integrations', cat: 'Staff & Admin', src: 'src/lib/nav.ts', feat: ['Integrations'],
    a: "Admin → Integrations is the settings area where external connections would be configured. In the demo it's a placeholder for future integrations.",
    ask: ['Are there integrations?', 'Can I connect other tools?'], act: ['set up an integration', 'connect another app'], noun: ['integrations'], kw: ['integration', 'connect', 'api', 'webhook'] },

  { id: 'multiuser', cat: 'General', src: 'src/lib/config.ts', feat: ['Demo Mode'],
    a: "The demo runs in your browser, so it's single-user on that device. Connected to a real backend (Supabase), multiple users share the same data, each with their own role and login.",
    ask: ['Can multiple users use it at once?', 'Is it multi-user?', 'Can my team log in together?'], act: [], noun: ['multiple users', 'team access', 'concurrent users'], kw: ['multi user', 'multiple users', 'team', 'concurrent', 'collaboration'] },

  { id: 'syncdevices', cat: 'General', src: 'src/lib/storage.ts', feat: ['Demo Mode'],
    a: "In demo mode your data lives in that browser, so it doesn't sync to other devices or teammates. A real backend makes it shared and available everywhere you sign in.",
    ask: ['Does my data sync across devices?', 'Will I see the same data on another computer?'], act: [], noun: ['data syncing across devices', 'shared data'], kw: ['sync', 'devices', 'shared', 'another computer'] },

  { id: 'openassistant', cat: 'AI Assistant', src: 'src/components/ai/AiFab.tsx', feat: ['AI Assistant'],
    a: "Open the assistant from the floating sparkle button at the bottom-right of any page, or use the full-page AI Assistant in the sidebar for a bigger view.",
    ask: ['How do I open the AI assistant?', 'Where is the chatbot?'], act: ['open the assistant', 'open the ai assistant', 'start a chat with the assistant'], noun: ['the assistant button'], kw: ['open assistant', 'chatbot', 'ai button', 'chat'] },

  { id: 'newchat', cat: 'AI Assistant', src: 'src/stores/aiStore.ts', feat: ['AI Assistant'],
    a: "Start a fresh chat with the New conversation button on the AI Assistant page. Each thread keeps its own memory, and starting a new one gives you a clean slate.",
    ask: ['How do I start a new conversation?', 'Can I clear the chat?'], act: ['start a new conversation', 'clear the chat', 'reset the conversation'], noun: ['a new conversation'], kw: ['new chat', 'new conversation', 'clear chat', 'reset chat'] },

  { id: 'portalticket', cat: 'Customer Portal', src: 'src/pages/portal/PortalSupport.tsx', feat: ['Customer Portal'],
    a: "In the portal, customers raise a support ticket under Support, or contact their assigned account manager directly by email or phone from the same page.",
    ask: ['How do I raise a support ticket?', 'How do I contact support?', 'Who is my account manager?'], act: ['raise a support ticket', 'contact support', 'reach my account manager'], noun: ['support tickets', 'the account manager'], kw: ['support', 'ticket', 'account manager', 'help'] },

  { id: 'marknotif', cat: 'Communication', src: 'src/pages/portal/DocumentCenter.tsx', feat: ['Notifications'],
    a: "Notifications show an unread count and you review them in the Notifications area. A one-click 'mark all as read' isn't a highlighted action in the current demo.",
    ask: ['How do I mark notifications as read?', 'Can I clear my notifications?'], act: ['mark notifications as read', 'clear notifications'], noun: ['marking notifications as read'], kw: ['mark read', 'notifications read', 'clear notifications'] },

  { id: 'emptystate', cat: 'Troubleshooting', src: 'src/components/shared/EmptyState.tsx', feat: [],
    a: "An empty list usually just means there are no matching records yet — or a filter is too narrow. Try clearing filters or the search box, or add a record to get started.",
    ask: ['Why is my list empty?', 'Why are there no results?', "The table shows nothing, why?"], act: [], noun: ['an empty list', 'no results'], kw: ['empty', 'no results', 'nothing showing', 'blank'] },

  { id: 'noinvoiceaccess', cat: 'Roles & Permissions', src: 'src/lib/permissions.ts', feat: ['Invoices', 'Roles & Permissions'],
    a: "If Invoices is missing from your menu, your role doesn't include it. Only Admin and Accounts have full invoice access, and Sales Managers can view them — Sales Executives don't. Ask an Admin to adjust your role if you need access.",
    ask: ["Why can't I see invoices?", 'Invoices are missing from my menu, why?', "I don't have access to invoices"], act: [], noun: ['invoice access', 'why invoices are hidden'], kw: ['cant see invoices', 'no invoice access', 'invoices missing'] },

  { id: 'noerpaccess', cat: 'Roles & Permissions', src: 'src/lib/permissions.ts', feat: ['ERP Calculator'],
    a: "The ERP Calculator is Admin-only, so it won't appear for Sales, Accounts or customer roles. If you need costing figures, an Admin can run it for you.",
    ask: ["Why can't I see the ERP Calculator?", 'The ERP Calculator is missing'], act: [], noun: ['why the erp calculator is hidden'], kw: ['cant see erp', 'erp missing', 'no erp access'] },

  // =========================================================================
  // Buyer / customer analytics — grounded, computed live from invoices.
  // The assistant ranks customers ("parties/buyers/clients") by purchase
  // volume (KL) and value (₹). These are DATA answers: at runtime the query is
  // routed to the live leaderboard handler, so the text below is a safe
  // fallback that describes what will be computed.
  // =========================================================================
  { id: 'highest-buyer', cat: 'Customers & Analytics', src: 'src/lib/ai/assistant.ts', feat: ['Customers', 'Sales Reports', 'AI Assistant'],
    a: "I work that out from your live invoices — I total each customer's purchases and name the leader by value (₹) and volume (KL). Ask e.g. \"who is the highest buyer?\" or \"which party had the highest purchase this year?\" and I'll give you the top buyer plus the runners-up.",
    ask: ['Who is the highest buyer?', 'Which party had the highest purchase?', 'Who was the biggest buyer?', 'Who bought the most?', 'Which customer purchased the most?', 'Who is our top buyer?', 'Name the largest customer by purchase', 'Which client spent the most?', 'Who is the number one buyer?', 'Whose purchases are the highest?'],
    act: ['find the highest buyer', 'identify the biggest buyer', 'find the top purchasing customer', 'find who bought the most', 'find the largest party'],
    noun: ['the highest buyer', 'the biggest buyer', 'the top buyer', 'the largest customer', 'the leading purchaser', 'the top spender', 'the number one buyer', 'the biggest client', 'the highest purchasing party'],
    kw: ['highest buyer', 'biggest buyer', 'top buyer', 'largest customer', 'which party', 'highest purchase', 'who bought most', 'top spender', 'leading customer', 'biggest client', 'major buyer', 'top purchaser', 'best customer', 'number one buyer', 'who purchased most'] },

  { id: 'lowest-buyer', cat: 'Customers & Analytics', src: 'src/lib/ai/assistant.ts', feat: ['Customers', 'Sales Reports'],
    a: "I can rank the other way too — the smallest buyers by value or volume, computed from live invoices. Useful for spotting low-activity or at-risk accounts. Try \"who is the smallest buyer?\" or \"which customers purchased the least this year?\".",
    ask: ['Who is the smallest buyer?', 'Which party had the lowest purchase?', 'Who bought the least?', 'Which customer purchased the least?', 'Who is our lowest buyer?', 'Which client spent the least?', 'Name the smallest customer by purchase', 'Who are the least active buyers?'],
    act: ['find the smallest buyer', 'identify the lowest buyer', 'find who bought the least', 'find the least active customers'],
    noun: ['the smallest buyer', 'the lowest buyer', 'the least active customer', 'the smallest party', 'the lowest spender'],
    kw: ['smallest buyer', 'lowest buyer', 'least purchase', 'who bought least', 'lowest spender', 'least active customer', 'smallest client', 'bottom buyer'] },

  { id: 'rank-buyers', cat: 'Customers & Analytics', src: 'src/lib/ai/assistant.ts', feat: ['Customers', 'Sales Reports'],
    a: "I can produce a full buyer leaderboard — every customer ranked by purchase value (₹) and volume (KL), from live invoice data. Ask \"rank customers by purchase\", \"top 5 buyers by value\", or \"list the top 10 parties by volume\".",
    ask: ['Rank customers by purchase', 'Top 5 buyers by value', 'Top 10 customers by volume', 'List the biggest buyers', 'Show a buyer leaderboard', 'Rank parties by spend', 'Sort customers by purchase value', 'Give me the top buyers', 'Customer purchase ranking', 'Who are the top 3 buyers?'],
    act: ['rank customers by purchase', 'rank buyers by value', 'rank parties by volume', 'list the top buyers', 'sort customers by spend', 'show a buyer leaderboard', 'build a customer purchase ranking'],
    noun: ['a buyer leaderboard', 'the top buyers', 'the customer ranking', 'the purchase ranking', 'top customers by value', 'top customers by volume', 'the biggest buyers'],
    kw: ['rank customers', 'buyer leaderboard', 'top buyers', 'top customers', 'purchase ranking', 'rank buyers', 'sort by purchase', 'top 5 buyers', 'top 10 customers', 'league table', 'customer standings'] },

  { id: 'buyer-by-product', cat: 'Customers & Analytics', src: 'src/lib/ai/assistant.ts', feat: ['Customers', 'Items & Products'],
    a: "I can rank buyers for a specific product — say diesel, petrol, LDO, furnace oil, a solvent or a granule. Ask \"who bought the most diesel?\" or \"which party purchased the most petrol last month?\" and I'll rank customers by that product's volume and value.",
    ask: ['Who bought the most diesel?', 'Which party purchased the most petrol?', 'Who is the biggest diesel buyer?', 'Which customer bought the most furnace oil?', 'Top buyers of lubricants', 'Who purchased the most LDO this year?', 'Biggest buyer of solvents'],
    act: ['find the biggest diesel buyer', 'find who bought the most petrol', 'rank buyers of a product', 'find the top buyer of a product'],
    noun: ['the biggest diesel buyer', 'the top petrol buyer', 'buyers of a product', 'the largest buyer of diesel'],
    kw: ['most diesel', 'most petrol', 'biggest diesel buyer', 'top buyer of', 'who bought diesel', 'product buyer', 'buyer of lubricants', 'most furnace oil'] },

  { id: 'buyer-by-period', cat: 'Customers & Analytics', src: 'src/lib/ai/assistant.ts', feat: ['Customers', 'Sales Reports'],
    a: "Any buyer ranking can be scoped to a period — this month, last month, this year, last year, a quarter or a named year. Ask \"who was the biggest buyer last month?\" or \"top customers by purchase in 2025\".",
    ask: ['Who was the biggest buyer last month?', 'Highest buyer this year', 'Top customers by purchase this month', 'Which party bought the most last quarter?', 'Biggest buyer in 2025', 'Who purchased the most this year?', 'Top buyer last year'],
    act: ['find the biggest buyer this month', 'find the top buyer last year', 'rank buyers for a period'],
    noun: ['the biggest buyer this month', 'the top buyer this year', 'the highest buyer last month'],
    kw: ['biggest buyer this month', 'top buyer this year', 'highest buyer last month', 'buyer this quarter', 'purchases this year', 'buyer last year'] },

  { id: 'buyer-value-volume', cat: 'Customers & Analytics', src: 'src/lib/ai/assistant.ts', feat: ['Customers', 'Sales Reports'],
    a: "I rank buyers by either measure: purchase value (₹ / revenue / spend) or purchase volume (KL / quantity / litres). Say \"top customers by value\" or \"biggest buyers by volume\" to pick — otherwise I show both.",
    ask: ['Top customers by purchase value', 'Biggest buyers by volume', 'Who spent the most money?', 'Which customer has the highest purchase value?', 'Rank buyers by quantity', 'Highest buyer by revenue', 'Who bought the most in KL?'],
    act: ['rank buyers by value', 'rank buyers by volume', 'rank customers by spend', 'rank customers by quantity'],
    noun: ['top buyers by value', 'top buyers by volume', 'the highest spender', 'the biggest buyer by quantity'],
    kw: ['by value', 'by volume', 'by spend', 'by quantity', 'highest spender', 'purchase value', 'buyer by revenue', 'most in kl'] },

  { id: 'buyer-single', cat: 'Customers & Analytics', src: 'src/lib/ai/assistant.ts', feat: ['Customers'],
    a: "Name a customer and I'll total their purchases from live invoices — volume (KL), value (₹) and the number of invoice lines, for all time or a period you specify. Ask \"how much did ABC Petroleum buy?\" or \"what did Gujarat Traders purchase last year?\".",
    ask: ['How much did this customer buy?', 'What did a customer purchase?', "What is a customer's total purchase?", 'How much has a party bought from us?', 'Total purchases for a customer'],
    act: ['see how much a customer bought', 'check a customer purchase total', 'total a party purchases'],
    noun: ["a customer's total purchase", 'a customer purchase total', 'how much a party bought'],
    kw: ['how much did buy', 'customer total purchase', 'party bought from us', 'purchases for a customer', 'customer purchase total'] },

  { id: 'top-customers-revenue', cat: 'Customers & Analytics', src: 'src/lib/ai/assistant.ts', feat: ['Customers', 'Sales Reports'],
    a: "I rank your customers by revenue (total billed) from live invoices, highest first. Ask \"top customers by revenue\", \"most valuable customers\" or \"who generates the most revenue?\".",
    ask: ['Top customers by revenue', 'Who are our most valuable customers?', 'Which customer generates the most revenue?', 'Best customers by turnover', 'Highest revenue customers', 'Who brings in the most money?'],
    act: ['rank customers by revenue', 'find the most valuable customers', 'find top revenue customers'],
    noun: ['the most valuable customers', 'top revenue customers', 'the best customers by turnover'],
    kw: ['top customers by revenue', 'most valuable customer', 'revenue customers', 'best customers', 'turnover customers', 'who generates revenue'] },

  { id: 'customer-count', cat: 'Customers & Analytics', src: 'src/pages/customers/CustomersList.tsx', feat: ['Customers'],
    a: "I can tell you how many customers you have and how many are active, straight from the Customers module. Ask \"how many customers do we have?\" or \"number of active accounts\".",
    ask: ['How many customers do we have?', 'How many active customers are there?', 'What is the total number of customers?', 'How many buyers do we have?', 'Count of customers'],
    act: ['count the customers', 'count active customers'],
    noun: ['the number of customers', 'the customer count', 'the total customers', 'active customers'],
    kw: ['how many customers', 'number of customers', 'customer count', 'active customers', 'total customers', 'how many buyers'] },

  { id: 'new-customers', cat: 'Customers & Analytics', src: 'src/pages/customers/CustomersList.tsx', feat: ['Customers'],
    a: "New accounts carry the NEW segment, and each customer has a 'customer since' date on their profile and in the Customers list, so you can spot recently onboarded buyers. Filter the Customers table by the NEW segment to see them.",
    ask: ['Who are our newest customers?', 'Which customers are new?', 'Show recently added customers', 'How many new customers this month?', 'List new buyers'],
    act: ['find new customers', 'list newly added customers', 'see recent customers'],
    noun: ['new customers', 'the newest buyers', 'recently added customers'],
    kw: ['new customers', 'newest customers', 'recently added', 'new buyers', 'new accounts', 'recent customers'] },

  { id: 'dormant-customers', cat: 'Customers & Analytics', src: 'src/pages/customers/CustomersList.tsx', feat: ['Customers'],
    a: "Inactive buyers show up as the DORMANT segment, and each customer's 'last order' date tells you who hasn't bought in a while. Filter the Customers list by DORMANT, or ask me for the smallest / least-active buyers.",
    ask: ['Which customers are dormant?', 'Who are our inactive buyers?', 'Which customers stopped buying?', "Who hasn't ordered recently?", 'List dormant accounts'],
    act: ['find dormant customers', 'find inactive buyers', 'see who stopped buying'],
    noun: ['dormant customers', 'inactive buyers', 'customers who stopped buying'],
    kw: ['dormant customers', 'inactive customers', 'stopped buying', 'lapsed customers', 'no recent orders', 'inactive buyers'] },

  { id: 'customer-segments', cat: 'Customers & Analytics', src: 'src/lib/constants.ts', feat: ['Customers', 'Customer Segments'],
    a: "Customers are grouped into segments — VIP, Standard, New, Dormant, Industrial, Retail and Reseller — so you can view buyers by type. You'll find the segment on each customer and as a filter on the Customers list.",
    ask: ['What customer segments are there?', 'How are customers categorised?', 'Show VIP customers', 'Which buyers are industrial?', 'List reseller customers'],
    act: ['see customer segments', 'filter customers by segment', 'view VIP customers'],
    noun: ['customer segments', 'the VIP customers', 'industrial buyers', 'reseller customers'],
    kw: ['customer segment', 'vip customers', 'industrial customers', 'reseller', 'retail customers', 'customer type', 'segments'] },

  { id: 'customer-outstanding-rank', cat: 'Customers & Analytics', src: 'src/pages/sales/Payments.tsx', feat: ['Payments', 'Customers'],
    a: "I can rank customers by what they owe — the biggest outstanding balances from unpaid and overdue invoices. Ask \"who owes the most?\", \"which customer has the highest outstanding?\" or \"who has pending payments?\".",
    ask: ['Who owes the most?', 'Which customer has the highest outstanding?', 'Biggest debtors', 'Who has the largest pending payment?', 'Rank customers by outstanding'],
    act: ['find who owes the most', 'rank customers by outstanding', 'find the biggest debtors'],
    noun: ['the biggest debtors', 'the highest outstanding customer', 'who owes the most'],
    kw: ['who owes most', 'highest outstanding', 'biggest debtor', 'largest pending payment', 'rank by outstanding', 'top debtors'] },

  { id: 'repeat-customers', cat: 'Customers & Analytics', src: 'src/lib/ai/assistant.ts', feat: ['Customers', 'Sales Reports'],
    a: "Repeat buyers are the customers with the most invoices / orders over time — your most loyal accounts. Ask \"who are our most frequent buyers?\" or \"which customers order the most often?\" and I'll rank by purchase activity.",
    ask: ['Who are our most frequent buyers?', 'Which customers order the most often?', 'Who are our repeat customers?', 'Most loyal customers', 'Which party orders most frequently?'],
    act: ['find frequent buyers', 'find repeat customers', 'find the most loyal customers'],
    noun: ['frequent buyers', 'repeat customers', 'the most loyal customers', 'regular buyers'],
    kw: ['frequent buyers', 'repeat customers', 'loyal customers', 'orders most often', 'regular customers', 'most orders'] },

  // =========================================================================
  // Scope — modules this trading CRM does NOT have. Answered honestly so the
  // assistant never pretends a feature exists (grounded to the real codebase).
  // =========================================================================
  { id: 'no-vendors', cat: 'Scope & Availability', src: 'src/types/index.ts', feat: ['Customers'],
    a: "This is a **sell-side** trading CRM — it doesn't have a vendors / suppliers / procurement module. It manages the customer side: leads, customers, quotations, sales orders, invoices, payments and dispatch. There's no vendor master or supplier ledger.",
    ask: ['How do I add a vendor?', 'Where are suppliers?', 'Is there a vendor module?', 'How do I manage procurement?', 'Where is the supplier list?'],
    act: ['add a vendor', 'create a supplier', 'manage vendors', 'record a supplier'], noun: ['the vendor module', 'suppliers', 'the procurement section'],
    kw: ['vendor', 'vendors', 'supplier', 'suppliers', 'procurement', 'supplier ledger', 'vendor master'] },

  { id: 'no-purchase-orders', cat: 'Scope & Availability', src: 'src/types/index.ts', feat: ['Sales Orders'],
    a: "There's no purchase-order (buy-side) module. The CRM handles **sales** orders — customer orders that flow to dispatch and invoicing. If you meant a customer's order, use Sales Orders.",
    ask: ['How do I create a purchase order?', 'Where are purchase orders?', 'Is there a PO module?', 'How do I raise a PO?'],
    act: ['create a purchase order', 'raise a po', 'add a purchase order'], noun: ['purchase orders', 'the po module'],
    kw: ['purchase order', 'purchase orders', 'raise po', 'po module', 'buy side order'] },

  { id: 'no-projects', cat: 'Scope & Availability', src: 'src/lib/nav.ts', feat: [],
    a: "The CRM doesn't include a projects module — it's built around trading operations (customers, products, quotations, orders, invoices, logistics), not project delivery or EPC.",
    ask: ['How do I create a project?', 'Where is the projects module?', 'Is there project management?'],
    act: ['create a project', 'add a project', 'manage projects'], noun: ['the projects module', 'project management'],
    kw: ['project', 'projects', 'project management', 'epc project'] },

  { id: 'no-assets', cat: 'Scope & Availability', src: 'src/types/index.ts', feat: ['Operations'],
    a: "There isn't an assets / equipment module. The closest thing the CRM tracks is the transport fleet — **vehicles and drivers** under Operations, including RC, fitness and insurance expiry.",
    ask: ['How do I add an asset?', 'Where is equipment?', 'Is there asset management?', 'How do I track equipment maintenance?'],
    act: ['add an asset', 'register equipment', 'track an asset'], noun: ['the assets module', 'equipment', 'asset management'],
    kw: ['asset', 'assets', 'equipment', 'asset management', 'plant equipment'] },

  { id: 'no-maintenance', cat: 'Scope & Availability', src: 'src/types/index.ts', feat: ['Operations'],
    a: "There's no plant maintenance module (preventive / shutdown). For the transport fleet, the Vehicles screen does track RC, fitness and insurance expiry dates so you can plan renewals.",
    ask: ['How do I schedule maintenance?', 'Where is preventive maintenance?', 'Is there shutdown maintenance?'],
    act: ['schedule maintenance', 'plan preventive maintenance', 'log shutdown maintenance'], noun: ['maintenance scheduling', 'preventive maintenance'],
    kw: ['maintenance', 'preventive maintenance', 'shutdown maintenance', 'servicing', 'amc'] },

  { id: 'no-tickets', cat: 'Scope & Availability', src: 'src/pages/portal/PortalSupport.tsx', feat: ['Customer Portal'],
    a: "There's no internal field-service / engineer ticketing module. Customers can raise a **support ticket** in the portal (Support), which reaches their assigned account manager — but there's no dispatch-of-engineers workflow.",
    ask: ['How do I assign a ticket to an engineer?', 'Where is field service?', 'Is there a helpdesk?', 'How do engineers get tickets?'],
    act: ['assign a ticket to an engineer', 'dispatch a field engineer', 'manage service tickets'], noun: ['field service', 'the engineer module', 'service tickets'],
    kw: ['engineer', 'engineers', 'field service', 'service ticket', 'helpdesk', 'dispatch engineer'] },

  { id: 'no-opportunities', cat: 'Scope & Availability', src: 'src/lib/nav.ts', feat: ['Leads', 'Quotations'],
    a: "There isn't a separate Opportunities module. The sales pipeline runs on **Leads** (with stages New → Contacted → Qualified → Proposal → Negotiation → Won/Lost) and **Proposals** (quotations). Convert a won lead to a customer.",
    ask: ['Where are opportunities?', 'How do I create an opportunity?', 'Is there a deals module?'],
    act: ['create an opportunity', 'add a deal', 'manage opportunities'], noun: ['opportunities', 'the deals module'],
    kw: ['opportunity', 'opportunities', 'deals', 'deal stage'] },

  { id: 'no-warehouse-module', cat: 'Scope & Availability', src: 'src/pages/operations/Inventory.tsx', feat: ['Operations'],
    a: "There's no full warehouse-management system, but stock is held against named **locations** (depots / terminals) on the Inventory and Items screens, with quantities in KL/units and reorder levels.",
    ask: ['Where is warehouse management?', 'How do I manage warehouses?', 'Is there a WMS?'],
    act: ['manage warehouses', 'add a warehouse', 'do warehouse transfers'], noun: ['warehouse management', 'the wms'],
    kw: ['warehouse', 'warehouses', 'wms', 'stock location', 'depot'] },

  { id: 'no-upstream', cat: 'Oil & Gas Domain', src: 'src/lib/seed/pools.ts', feat: ['Items & Products'],
    a: "This is a **downstream trading** CRM, not an upstream / EPC system. It doesn't model drilling, exploration, refineries, pipelines or tank farms — it trades refined and petrochemical products: diesel (HSD), petrol (MS), LDO, furnace oil, lubricants, glycols, solvents and plastic granules.",
    ask: ['Does it handle refinery operations?', 'Is there drilling or exploration?', 'Can I manage a pipeline project?', 'Does it cover EPC?'],
    act: ['manage a refinery', 'plan drilling', 'run an epc project', 'monitor a pipeline'], noun: ['refinery operations', 'drilling', 'the pipeline module', 'epc'],
    kw: ['refinery', 'drilling', 'exploration', 'pipeline', 'tank farm', 'epc', 'upstream', 'compressor', 'wellhead'] },

  { id: 'compliance-scope', cat: 'Oil & Gas Domain', src: 'src/lib/gst.ts', feat: ['Invoices'],
    a: "For compliance the CRM covers the **commercial** side: GSTIN/PAN capture, HSN codes, 18% GST split into CGST/SGST or IGST, and invoice/e-invoice/challan documents. It is not an HSE / safety-compliance or statutory EHS system.",
    ask: ['How does it handle compliance?', 'Is there safety compliance?', 'Does it track HSE?', 'What about statutory compliance?'],
    act: ['track safety compliance', 'manage hse', 'log a safety incident'], noun: ['compliance', 'safety compliance', 'hse tracking'],
    kw: ['compliance', 'safety', 'hse', 'ehs', 'statutory', 'gst compliance'] },

  // =========================================================================
  // Edge cases & troubleshooting — grounded to how the app actually behaves.
  // =========================================================================
  { id: 'validation-error', cat: 'Troubleshooting', src: 'src/lib/validation.ts', feat: [],
    a: "Forms validate before saving — required fields are marked and show an inline error message, and the Save button won't complete until every required field has a valid value. Fix the highlighted fields and try again.",
    ask: ['Why won\'t my form save?', 'What does this validation error mean?', 'Why is Save disabled?', 'Why can\'t I submit the form?'],
    act: ['fix a validation error', 'submit the form', 'clear a form error'], noun: ['validation errors', 'required fields', 'the error message'],
    kw: ['validation', 'required field', 'form error', 'cant save', 'save disabled', 'mandatory field'] },

  { id: 'permission-denied', cat: 'Roles & Permissions', src: 'src/lib/permissions.ts', feat: ['Roles & Permissions'],
    a: "If a page is missing from your menu or an action is greyed out, your role doesn't include that permission. Admin has full access; other roles are scoped (Sales, Accounts, Customer). Ask an Admin to adjust your role under Settings → Roles & Permissions.",
    ask: ['Why is this greyed out?', 'Why can\'t I access this page?', 'Why is this action disabled?', 'I get a permission error, why?'],
    act: ['get access to a page', 'enable a disabled action', 'change my permissions'], noun: ['a permission error', 'why something is disabled', 'access rights'],
    kw: ['permission', 'access denied', 'greyed out', 'disabled', 'no access', 'not allowed'] },

  { id: 'duplicate-record', cat: 'Troubleshooting', src: 'src/components/shared/DataTable.tsx', feat: [],
    a: "The app doesn't hard-block duplicates, so search before you create — use the list search or command palette, and check the GSTIN / code, to confirm a customer or item doesn't already exist.",
    ask: ['How do I avoid duplicate customers?', 'What if a record already exists?', 'How do I find duplicates?'],
    act: ['avoid duplicates', 'find a duplicate record', 'merge duplicates'], noun: ['duplicate records', 'duplicate detection'],
    kw: ['duplicate', 'duplicates', 'already exists', 'merge records', 'same customer twice'] },

  { id: 'session-expiry', cat: 'Login & Access', src: 'src/stores/authStore.ts', feat: ['Account'],
    a: "In demo mode your session is stored locally in the browser. If you get signed out, just sign back in with any email and password. Clearing site data or using a private window starts a fresh demo.",
    ask: ['Why was I logged out?', 'My session expired, what do I do?', 'Why do I keep getting signed out?'],
    act: ['log back in', 'restore my session', 'stay signed in'], noun: ['session expiry', 'being logged out'],
    kw: ['session expired', 'logged out', 'signed out', 'session timeout', 'kicked out'] },

  { id: 'export-excel-pdf', cat: 'General', src: 'src/lib/excel.ts', feat: ['Export'],
    a: "Most list screens have an **Export** button that downloads the table to Excel, and business documents (invoices, quotations, receipts) export to **PDF** via their PDF button. Bulk import isn't available in the demo.",
    ask: ['How do I export to Excel?', 'How do I download a PDF?', 'Can I export this table?', 'How do I get a report out?'],
    act: ['export to excel', 'download a pdf', 'export a table', 'save a report'], noun: ['the export button', 'excel export', 'pdf download'],
    kw: ['export', 'excel', 'download', 'pdf', 'csv', 'save table', 'export report'] },

  { id: 'concurrent-edits', cat: 'Troubleshooting', src: 'src/lib/db.ts', feat: [],
    a: "In demo mode data lives only in your browser, so there's no cross-user conflict. With a live Supabase backend, changes sync to other open tabs in real time and the most recent save wins.",
    ask: ['What happens if two people edit the same record?', 'Is there a conflict when editing together?', 'Does it sync across tabs?'],
    act: ['handle concurrent edits', 'sync across tabs', 'resolve an edit conflict'], noun: ['concurrent edits', 'edit conflicts', 'real-time sync'],
    kw: ['concurrent', 'conflict', 'two users', 'same time edit', 'realtime sync', 'multiple tabs'] },

  // =========================================================================
  // A few real features not yet in the bank.
  // =========================================================================
  { id: 'customer-ledger', cat: 'Customers', src: 'src/pages/customers/CustomerLedger.tsx', feat: ['Customers', 'Payments'],
    a: "Each customer has a **Ledger** on their detail page showing invoices raised and payments received, so you can see their running balance and outstanding amount at a glance.",
    ask: ['Where is the customer ledger?', 'How do I see a customer\'s account statement?', 'How do I check a customer\'s balance?'],
    act: ['view the customer ledger', 'open an account statement', 'check a customer balance'], noun: ['the customer ledger', 'account statement', 'running balance'],
    kw: ['ledger', 'account statement', 'customer balance', 'statement of account', 'running balance'] },

  { id: 'einvoice-challan', cat: 'Invoices', src: 'src/pages/portal/DocumentCenter.tsx', feat: ['Invoices', 'Customer Portal'],
    a: "Alongside the tax invoice, the Documents area holds supporting paperwork like the **e-invoice** and delivery **challan**. Customers can view and download them from the portal's Document Center.",
    ask: ['Where is the e-invoice?', 'How do I get the delivery challan?', 'What documents come with an invoice?'],
    act: ['download the e-invoice', 'get the challan', 'view invoice documents'], noun: ['the e-invoice', 'the delivery challan', 'invoice documents'],
    kw: ['e-invoice', 'einvoice', 'challan', 'delivery note', 'gst invoice document'] },

  { id: 'proposal-approval', cat: 'Quotations', src: 'src/pages/sales/ProposalDetail.tsx', feat: ['Quotations', 'Roles & Permissions'],
    a: "High-value quotations can require **manager approval** before they're sent. A proposal above the threshold is flagged as needing approval, and a Sales Manager / Admin approves it from the proposal.",
    ask: ['How do I approve a quotation?', 'Why does this proposal need approval?', 'Who approves high-value quotes?'],
    act: ['approve a quotation', 'send a proposal for approval', 'approve a high-value quote'], noun: ['proposal approval', 'quotation approval'],
    kw: ['approve quotation', 'proposal approval', 'needs approval', 'high value quote', 'manager approval'] },

  { id: 'dashboard-kpis', cat: 'Reports & Analytics', src: 'src/pages/dashboard/Dashboard.tsx', feat: ['Dashboard'],
    a: "The Dashboard summarises the business with KPI cards (sales, revenue, outstanding, orders, leads) and charts (monthly sales trend, pipeline, top segments). Each card reflects live data; use the reports for deeper breakdowns.",
    ask: ['What do the dashboard numbers mean?', 'Explain the dashboard KPIs', 'What does the sales chart show?', 'How do I read the dashboard?'],
    act: ['read the dashboard', 'interpret the kpis', 'understand the sales chart'], noun: ['the dashboard KPIs', 'the sales chart', 'the dashboard cards'],
    kw: ['dashboard', 'kpi', 'kpis', 'metric', 'dashboard chart', 'sales trend', 'dashboard cards'] },

  { id: 'staff-tasks-ai', cat: 'AI Assistant', src: 'src/lib/ai/assistant.ts', feat: ['AI Assistant', 'Tasks'],
    a: "As a staff member you can ask the assistant about a teammate's tasks — e.g. \"what are the tasks of Priya today?\", \"show Anil's pending tasks\", \"what is Kavita working on?\". It resolves the person by name and can scope by status (open/overdue/completed) and date.",
    ask: ['Can you show a teammate\'s tasks?', 'How do I see someone\'s tasks?', 'What are the tasks of a salesperson?'],
    act: ['see a colleague\'s tasks', 'check a teammate\'s workload', 'view someone\'s pending tasks'], noun: ['a teammate\'s tasks', 'a colleague\'s workload'],
    kw: ['tasks of', 'teammate tasks', 'someone tasks', 'staff tasks', 'pending tasks of', 'workload'] }
];
