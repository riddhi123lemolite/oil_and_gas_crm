# OilGas CRM — Frontend Prototype

A click-through CRM prototype for an Indian **oil, gas, petrochemical &
specialty-chemical trading** company. It looks and feels like a finished SaaS
product (think Stripe + Linear + Pipedrive, tuned for Indian business reality)
— but it is a **frontend-only demo**: every record lives in your browser, and
there is no backend, database or server.

---

## What's real / what's mocked

| Real (works fully) | Mocked (demo only) |
| --- | --- |
| All 65 screens, navigation, charts, tables, forms | No backend / database / API server |
| Add / edit / delete leads, customers, items, proposals, tasks… | No real emails, SMS or WhatsApp are sent |
| Drag-and-drop Kanban pipeline | No real payment processing |
| GST auto-calculation (CGST+SGST / IGST) | No real GPS — tanker tracking is simulated |
| Client-side PDF generation (proposals & invoices) | Data does **not** sync between devices |
| Excel import / export (real `.xlsx` files) | Auth is a mock — no real security |
| Dark mode, command palette, keyboard shortcuts | — |
| Changes persist across refreshes (browser `localStorage`) | — |

Data is generated **deterministically** on first load (≈520 leads, 200
customers, 90 items, 160 proposals, 110 invoices, 200 dispatches, 300 tasks,
25 staff and more) so every device sees the same realistic demo.

---

## Getting started

**Prerequisites:** [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install      # install dependencies
npm run dev      # start the dev server
```

Open **http://localhost:5173** in your browser.

Other commands:

```bash
npm run build    # type-check + production build
npm run preview  # preview the production build
npm run lint     # run ESLint
```

---

## Demo credentials

Any of these work — or just click a demo-account card on the login screen.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@oilgas.in` | `admin123` |
| Sales Manager | `manager@oilgas.in` | `manager123` |
| Sales Executive | `exec@oilgas.in` | `exec123` |
| Accounts | `accounts@oilgas.in` | `accounts123` |

Use the **Switch Role** option in the top-right user menu to jump between
roles instantly during a demo. The sidebar and dashboard adapt to each role.

---

## Feature checklist

- ✅ Mock authentication with 4 roles + instant role switching
- ✅ Role-aware sidebar & permissions matrix (editable)
- ✅ Dashboard — KPIs, sales trend, India heatmap, pipeline funnel
- ✅ Leads — list, status-tinted rows, drag-drop Kanban, 360° view, import/export, convert-to-customer
- ✅ Customers — list, 360° view (9 tabs), segments, ledger, documents
- ✅ Items — catalogue, price-history chart, margins (role-gated)
- ✅ Proposals — multi-line builder, automatic GST, PDF, approval workflow
- ✅ Sales — quotations, orders, invoices, payments
- ✅ Operations — transport routes, dispatch, simulated trip tracking, vehicles, drivers, inventory
- ✅ Tasks — Kanban + table, My Day, calendar
- ✅ Communication — team chat, email composer, notifications, call logs
- ✅ Reports — sales, lead funnel, geographic, custom builder
- ✅ Admin — staff, attendance, roles, definitions, company, integrations, audit log
- ✅ Command palette (⌘K), keyboard shortcuts, dark mode, mobile responsive
- ✅ Reset Demo Data from Settings → System

---

## Tech stack

Vite · React 18 · TypeScript · Tailwind CSS · Radix UI · React Router ·
Zustand · TanStack Table · Recharts · dnd-kit · React Hook Form + Zod ·
@react-pdf/renderer · SheetJS · cmdk · date-fns. No backend.

---

## How to demo this in 5 minutes

1. **Log in** as Admin → land on the Dashboard, note the KPIs and India heatmap.
2. **Leads → Add Lead** — create one; it appears in the list instantly.
3. Open **Pipeline** — drag the new lead across stages.
4. Open the lead → **Convert to Customer**.
5. **Proposals → Create Proposal** — add line items, watch GST auto-calculate, download the PDF.
6. Mark the proposal **Won**, then check it on the **Dashboard**.
7. Top-right menu → **Switch Role** to Accounts — see the sidebar change.
8. Toggle **dark mode**; press **⌘K** for the command palette.

See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for a tighter 90-second version.

---

## Known limitations

- No backend — data lives only in this browser's `localStorage`.
- Data does not sync across devices or browsers.
- Emails, SMS, WhatsApp, payments and GPS are simulated, not real.
- Authentication is a visual mock — do not treat it as secure.
- This is a prototype intended for demos, not production use.

To start fresh at any time: **Settings → System → Reset Demo Data**.
