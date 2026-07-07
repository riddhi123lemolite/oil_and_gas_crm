import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/components/layout/RequireAuth';
import { useAuthStore } from '@/stores/authStore';

// Auth (eager — small, needed first)
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import OtpVerification from '@/pages/auth/OtpVerification';

// App pages (lazy — code-split per route)
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const MyDashboard = lazy(() => import('@/pages/dashboard/MyDashboard'));
const SalesAnalytics = lazy(() => import('@/pages/dashboard/SalesAnalytics'));

const LeadsList = lazy(() => import('@/pages/leads/LeadsList'));
const LeadPipeline = lazy(() => import('@/pages/leads/LeadPipeline'));
const LeadForm = lazy(() => import('@/pages/leads/LeadForm'));
const LeadDetail = lazy(() => import('@/pages/leads/LeadDetail'));
const LeadImport = lazy(() => import('@/pages/leads/LeadImport'));
const LeadConvert = lazy(() => import('@/pages/leads/LeadConvert'));

const CustomersList = lazy(() => import('@/pages/customers/CustomersList'));
const CustomerForm = lazy(() => import('@/pages/customers/CustomerForm'));
const CustomerDetail = lazy(() => import('@/pages/customers/CustomerDetail'));
const CustomerDocuments = lazy(
  () => import('@/pages/customers/CustomerDocuments'),
);
const CustomerLedger = lazy(() => import('@/pages/customers/CustomerLedger'));
const CustomerSegments = lazy(
  () => import('@/pages/customers/CustomerSegments'),
);

const ItemsList = lazy(() => import('@/pages/items/ItemsList'));
const ItemForm = lazy(() => import('@/pages/items/ItemForm'));
const ItemDetail = lazy(() => import('@/pages/items/ItemDetail'));

const ProposalsList = lazy(() => import('@/pages/sales/ProposalsList'));
const ProposalForm = lazy(() => import('@/pages/sales/ProposalForm'));
const ProposalDetail = lazy(() => import('@/pages/sales/ProposalDetail'));
const SalesOrders = lazy(() => import('@/pages/sales/SalesOrders'));
const SalesOrderDetail = lazy(() => import('@/pages/sales/SalesOrderDetail'));
const InvoicesList = lazy(() => import('@/pages/sales/InvoicesList'));
const InvoiceDetail = lazy(() => import('@/pages/sales/InvoiceDetail'));
const CreateInvoice = lazy(() => import('@/pages/sales/CreateInvoice'));
const Payments = lazy(() => import('@/pages/sales/Payments'));

const TransportRoutes = lazy(
  () => import('@/pages/operations/TransportRoutes'),
);
const RouteForm = lazy(() => import('@/pages/operations/RouteForm'));
const DispatchSchedule = lazy(
  () => import('@/pages/operations/DispatchSchedule'),
);
const TripTracking = lazy(() => import('@/pages/operations/TripTracking'));
const Vehicles = lazy(() => import('@/pages/operations/Vehicles'));
const VehicleForm = lazy(() => import('@/pages/operations/VehicleForm'));
const Drivers = lazy(() => import('@/pages/operations/Drivers'));
const DriverForm = lazy(() => import('@/pages/operations/DriverForm'));
const Inventory = lazy(() => import('@/pages/operations/Inventory'));

const TasksList = lazy(() => import('@/pages/tasks/TasksList'));
const TaskForm = lazy(() => import('@/pages/tasks/TaskForm'));
const MyDay = lazy(() => import('@/pages/tasks/MyDay'));
const Calendar = lazy(() => import('@/pages/tasks/Calendar'));

const Chat = lazy(() => import('@/pages/communication/Chat'));
const EmailComposer = lazy(() => import('@/pages/communication/EmailComposer'));
const Notifications = lazy(() => import('@/pages/communication/Notifications'));
const CallLogs = lazy(() => import('@/pages/communication/CallLogs'));

const SalesReports = lazy(() => import('@/pages/reports/SalesReports'));
const LeadFunnelReport = lazy(() => import('@/pages/reports/LeadFunnelReport'));
const GeographicReport = lazy(() => import('@/pages/reports/GeographicReport'));
const ReportBuilder = lazy(() => import('@/pages/reports/ReportBuilder'));

const StaffList = lazy(() => import('@/pages/staff/StaffList'));
const StaffForm = lazy(() => import('@/pages/staff/StaffForm'));
const Attendance = lazy(() => import('@/pages/staff/Attendance'));

const ProfileSettings = lazy(() => import('@/pages/settings/ProfileSettings'));
const CompanySettings = lazy(() => import('@/pages/settings/CompanySettings'));
const RolesPermissions = lazy(
  () => import('@/pages/settings/RolesPermissions'),
);
const DefinitionPage = lazy(() => import('@/pages/settings/DefinitionPage'));
const Integrations = lazy(() => import('@/pages/settings/Integrations'));
const AuditLog = lazy(() => import('@/pages/settings/AuditLog'));
const SystemSettings = lazy(() => import('@/pages/settings/SystemSettings'));

const HelpCentre = lazy(() => import('@/pages/help/HelpCentre'));
const ShortcutsPage = lazy(() => import('@/pages/help/ShortcutsPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Customer portal (5th role)
const PortalDashboard = lazy(() => import('@/pages/portal/PortalDashboard'));
const ProductTracking = lazy(() => import('@/pages/portal/ProductTracking'));
const PortalPayments = lazy(() => import('@/pages/portal/PortalPayments'));
const PortalInvoices = lazy(() => import('@/pages/portal/PortalInvoices'));
const DocumentCenter = lazy(() => import('@/pages/portal/DocumentCenter'));
const PortalHistory = lazy(() => import('@/pages/portal/PortalHistory'));
const PortalNotifications = lazy(() => import('@/pages/portal/PortalNotifications'));
const ErpCalculator = lazy(() => import('@/pages/portal/ErpCalculator'));
const PortalOrders = lazy(() => import('@/pages/portal/PortalOrders'));
const PortalMarket = lazy(() => import('@/pages/portal/PortalMarket'));
const PortalSupport = lazy(() => import('@/pages/portal/PortalSupport'));
const CompanyInfo = lazy(() => import('@/pages/portal/CompanyInfo'));
const CustomerProfile = lazy(() => import('@/pages/portal/CustomerProfile'));
const CustomerSettings = lazy(() => import('@/pages/portal/CustomerSettings'));
const Assistant = lazy(() => import('@/pages/ai/Assistant'));

// Customers land on their portal; staff see the main dashboard.
function RoleHome() {
  const role = useAuthStore((s) => s.currentUser?.role);
  if (role === 'CUSTOMER') return <Navigate to="/portal" replace />;
  return <Dashboard />;
}

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/otp', element: <OtpVerification /> },
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <RoleHome /> },
      { path: 'assistant', element: <Assistant /> },
      { path: 'my-dashboard', element: <MyDashboard /> },
      { path: 'analytics', element: <SalesAnalytics /> },

      { path: 'leads', element: <LeadsList /> },
      { path: 'leads/pipeline', element: <LeadPipeline /> },
      { path: 'leads/new', element: <LeadForm /> },
      { path: 'leads/import', element: <LeadImport /> },
      { path: 'leads/:id', element: <LeadDetail /> },
      { path: 'leads/:id/edit', element: <LeadForm /> },
      { path: 'leads/:id/convert', element: <LeadConvert /> },

      { path: 'customers', element: <CustomersList /> },
      { path: 'customers/segments', element: <CustomerSegments /> },
      { path: 'customers/new', element: <CustomerForm /> },
      { path: 'customers/:id', element: <CustomerDetail /> },
      { path: 'customers/:id/edit', element: <CustomerForm /> },
      { path: 'customers/:id/documents', element: <CustomerDocuments /> },
      { path: 'customers/:id/ledger', element: <CustomerLedger /> },

      { path: 'items', element: <ItemsList /> },
      { path: 'items/new', element: <ItemForm /> },
      { path: 'items/:id', element: <ItemDetail /> },
      { path: 'items/:id/edit', element: <ItemForm /> },

      { path: 'proposals', element: <ProposalsList /> },
      { path: 'proposals/new', element: <ProposalForm /> },
      { path: 'proposals/:id', element: <ProposalDetail /> },
      { path: 'proposals/:id/edit', element: <ProposalForm /> },
      // Quotations merged into Proposals — keep the old URL working.
      { path: 'quotations', element: <Navigate to="/proposals?status=quotations" replace /> },
      { path: 'orders', element: <SalesOrders /> },
      { path: 'orders/:id', element: <SalesOrderDetail /> },
      { path: 'invoices', element: <InvoicesList /> },
      { path: 'invoices/new', element: <CreateInvoice /> },
      { path: 'invoices/:id', element: <InvoiceDetail /> },
      { path: 'payments', element: <Payments /> },

      { path: 'routes', element: <TransportRoutes /> },
      { path: 'routes/new', element: <RouteForm /> },
      { path: 'dispatch', element: <DispatchSchedule /> },
      { path: 'trips', element: <TripTracking /> },
      { path: 'trips/:id', element: <TripTracking /> },
      { path: 'vehicles', element: <Vehicles /> },
      { path: 'vehicles/new', element: <VehicleForm /> },
      { path: 'drivers', element: <Drivers /> },
      { path: 'drivers/new', element: <DriverForm /> },
      { path: 'inventory', element: <Inventory /> },

      { path: 'tasks', element: <TasksList /> },
      { path: 'tasks/new', element: <TaskForm /> },
      { path: 'tasks/:id/edit', element: <TaskForm /> },
      { path: 'my-day', element: <MyDay /> },
      { path: 'calendar', element: <Calendar /> },

      { path: 'chat', element: <Chat /> },
      { path: 'email', element: <EmailComposer /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'call-logs', element: <CallLogs /> },

      { path: 'reports/sales', element: <SalesReports /> },
      { path: 'reports/funnel', element: <LeadFunnelReport /> },
      { path: 'reports/geo', element: <GeographicReport /> },
      { path: 'reports/builder', element: <ReportBuilder /> },

      { path: 'staff', element: <StaffList /> },
      { path: 'staff/new', element: <StaffForm /> },
      { path: 'staff/:id/edit', element: <StaffForm /> },
      { path: 'attendance', element: <Attendance /> },

      { path: 'profile', element: <ProfileSettings /> },
      { path: 'settings/company', element: <CompanySettings /> },
      { path: 'settings/roles', element: <RolesPermissions /> },
      { path: 'settings/definitions', element: <DefinitionPage /> },
      { path: 'settings/integrations', element: <Integrations /> },
      { path: 'settings/audit', element: <AuditLog /> },
      { path: 'settings/system', element: <SystemSettings /> },

      { path: 'help', element: <HelpCentre /> },
      { path: 'shortcuts', element: <ShortcutsPage /> },

      // Customer portal
      { path: 'portal', element: <PortalDashboard /> },
      { path: 'portal/products', element: <ProductTracking /> },
      { path: 'portal/payments', element: <PortalPayments /> },
      { path: 'portal/invoices', element: <PortalInvoices /> },
      { path: 'portal/documents', element: <DocumentCenter /> },
      { path: 'portal/history', element: <PortalHistory /> },
      { path: 'portal/notifications', element: <PortalNotifications /> },
      { path: 'erp-calculator', element: <ErpCalculator /> },
      { path: 'portal/orders', element: <PortalOrders /> },
      { path: 'portal/market', element: <PortalMarket /> },
      { path: 'portal/support', element: <PortalSupport /> },
      { path: 'portal/company', element: <CompanyInfo /> },
      { path: 'portal/profile', element: <CustomerProfile /> },
      { path: 'portal/settings', element: <CustomerSettings /> },

      { path: '*', element: <NotFound /> },
    ],
  },
]);
