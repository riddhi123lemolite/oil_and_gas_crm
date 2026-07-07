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
    ask: ["Why can't I see the ERP Calculator?", 'The ERP Calculator is missing'], act: [], noun: ['why the erp calculator is hidden'], kw: ['cant see erp', 'erp missing', 'no erp access'] }
];
