import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/components/layout/RequireAuth';
import { useAuthStore } from '@/stores/authStore';

// Auth (eager — small, needed first)
import Login from '@/screens/auth/Login';
import Signup from '@/screens/auth/Signup';
import ForgotPassword from '@/screens/auth/ForgotPassword';
import ResetPassword from '@/screens/auth/ResetPassword';
import OtpVerification from '@/screens/auth/OtpVerification';

// App pages (lazy — code-split per route)
const Dashboard = lazy(() => import('@/screens/dashboard/Dashboard'));
const MyDashboard = lazy(() => import('@/screens/dashboard/MyDashboard'));
const SalesAnalytics = lazy(() => import('@/screens/dashboard/SalesAnalytics'));

const LeadsList = lazy(() => import('@/screens/leads/LeadsList'));
const LeadPipeline = lazy(() => import('@/screens/leads/LeadPipeline'));
const LeadForm = lazy(() => import('@/screens/leads/LeadForm'));
const LeadDetail = lazy(() => import('@/screens/leads/LeadDetail'));
const LeadImport = lazy(() => import('@/screens/leads/LeadImport'));
const LeadConvert = lazy(() => import('@/screens/leads/LeadConvert'));

const CustomersList = lazy(() => import('@/screens/customers/CustomersList'));
const CustomerForm = lazy(() => import('@/screens/customers/CustomerForm'));
const CustomerDetail = lazy(() => import('@/screens/customers/CustomerDetail'));
const CustomerDocuments = lazy(
  () => import('@/screens/customers/CustomerDocuments'),
);
const CustomerLedger = lazy(() => import('@/screens/customers/CustomerLedger'));
const CustomerSegments = lazy(
  () => import('@/screens/customers/CustomerSegments'),
);

const ItemsList = lazy(() => import('@/screens/items/ItemsList'));
const ItemForm = lazy(() => import('@/screens/items/ItemForm'));
const ItemDetail = lazy(() => import('@/screens/items/ItemDetail'));

const ProposalsList = lazy(() => import('@/screens/sales/ProposalsList'));
const ProposalForm = lazy(() => import('@/screens/sales/ProposalForm'));
const ProposalDetail = lazy(() => import('@/screens/sales/ProposalDetail'));
const SalesOrders = lazy(() => import('@/screens/sales/SalesOrders'));
const OrderForm = lazy(() => import('@/screens/sales/OrderForm'));
const SalesOrderDetail = lazy(() => import('@/screens/sales/SalesOrderDetail'));
const InvoicesList = lazy(() => import('@/screens/sales/InvoicesList'));
const InvoiceDetail = lazy(() => import('@/screens/sales/InvoiceDetail'));
const CreateInvoice = lazy(() => import('@/screens/sales/CreateInvoice'));
const Payments = lazy(() => import('@/screens/sales/Payments'));

const TransportRoutes = lazy(
  () => import('@/screens/operations/TransportRoutes'),
);
const RouteForm = lazy(() => import('@/screens/operations/RouteForm'));
const DispatchSchedule = lazy(
  () => import('@/screens/operations/DispatchSchedule'),
);
const TripTracking = lazy(() => import('@/screens/operations/TripTracking'));
const Vehicles = lazy(() => import('@/screens/operations/Vehicles'));
const VehicleForm = lazy(() => import('@/screens/operations/VehicleForm'));
const Drivers = lazy(() => import('@/screens/operations/Drivers'));
const DriverForm = lazy(() => import('@/screens/operations/DriverForm'));
const Inventory = lazy(() => import('@/screens/operations/Inventory'));

const TasksList = lazy(() => import('@/screens/tasks/TasksList'));
const TaskForm = lazy(() => import('@/screens/tasks/TaskForm'));
const MyDay = lazy(() => import('@/screens/tasks/MyDay'));
const Calendar = lazy(() => import('@/screens/tasks/Calendar'));

const Chat = lazy(() => import('@/screens/communication/Chat'));
const EmailComposer = lazy(() => import('@/screens/communication/EmailComposer'));
const Notifications = lazy(() => import('@/screens/communication/Notifications'));
const CallLogs = lazy(() => import('@/screens/communication/CallLogs'));

const SalesReports = lazy(() => import('@/screens/reports/SalesReports'));
const LeadFunnelReport = lazy(() => import('@/screens/reports/LeadFunnelReport'));
const GeographicReport = lazy(() => import('@/screens/reports/GeographicReport'));
const ReportBuilder = lazy(() => import('@/screens/reports/ReportBuilder'));

const StaffList = lazy(() => import('@/screens/staff/StaffList'));
const StaffForm = lazy(() => import('@/screens/staff/StaffForm'));
const Attendance = lazy(() => import('@/screens/staff/Attendance'));
const MyAttendance = lazy(() => import('@/screens/hrms/MyAttendance'));

const ProfileSettings = lazy(() => import('@/screens/settings/ProfileSettings'));
const CompanySettings = lazy(() => import('@/screens/settings/CompanySettings'));
const RolesPermissions = lazy(
  () => import('@/screens/settings/RolesPermissions'),
);
const DefinitionPage = lazy(() => import('@/screens/settings/DefinitionPage'));
const Integrations = lazy(() => import('@/screens/settings/Integrations'));
const AuditLog = lazy(() => import('@/screens/settings/AuditLog'));
const SystemSettings = lazy(() => import('@/screens/settings/SystemSettings'));

const HelpCentre = lazy(() => import('@/screens/help/HelpCentre'));
const ShortcutsPage = lazy(() => import('@/screens/help/ShortcutsPage'));
const NotFound = lazy(() => import('@/screens/NotFound'));

// Customer portal (5th role)
const PortalDashboard = lazy(() => import('@/screens/portal/PortalDashboard'));
const ProductTracking = lazy(() => import('@/screens/portal/ProductTracking'));
const PortalPayments = lazy(() => import('@/screens/portal/PortalPayments'));
const PortalInvoices = lazy(() => import('@/screens/portal/PortalInvoices'));
const PortalInvoiceDetail = lazy(() => import('@/screens/portal/PortalInvoiceDetail'));
const DocumentCenter = lazy(() => import('@/screens/portal/DocumentCenter'));
const PortalHistory = lazy(() => import('@/screens/portal/PortalHistory'));
const PortalNotifications = lazy(() => import('@/screens/portal/PortalNotifications'));
const ErpCalculator = lazy(() => import('@/screens/portal/ErpCalculator'));
const PortalOrders = lazy(() => import('@/screens/portal/PortalOrders'));
const PortalMarket = lazy(() => import('@/screens/portal/PortalMarket'));
const PortalSupport = lazy(() => import('@/screens/portal/PortalSupport'));
const CompanyInfo = lazy(() => import('@/screens/portal/CompanyInfo'));
const CustomerProfile = lazy(() => import('@/screens/portal/CustomerProfile'));
const CustomerSettings = lazy(() => import('@/screens/portal/CustomerSettings'));
const Assistant = lazy(() => import('@/screens/ai/Assistant'));

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
      { path: 'orders/new', element: <OrderForm /> },
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
      { path: 'my-attendance', element: <MyAttendance /> },

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
      { path: 'portal/invoices/:id', element: <PortalInvoiceDetail /> },
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
