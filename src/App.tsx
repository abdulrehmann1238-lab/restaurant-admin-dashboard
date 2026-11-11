import { lazy, Suspense, useCallback, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { LoadingWorkspace } from './components/common/LoadingWorkspace';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { RestaurantProvider } from './context/RestaurantContext';
import { ToastProvider } from './context/ToastContext';
import { LandingPage } from './pages/LandingPage';

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const OrdersPage = lazy(() =>
  import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage })),
);
const MenuPage = lazy(() =>
  import('./pages/MenuPage').then((m) => ({ default: m.MenuPage })),
);
const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
);
const StaffPage = lazy(() =>
  import('./pages/StaffPage').then((m) => ({ default: m.StaffPage })),
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

function RouteSuspenseFallback() {
  return (
    <div className="py-20 text-center text-[13.5px] text-[var(--text-secondary)]">
      Loading view...
    </div>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const [enteringDashboard, setEnteringDashboard] = useState(false);

  const handleEnterDashboard = useCallback(() => {
    setEnteringDashboard(true);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setEnteringDashboard(false);
    navigate('/dashboard');
  }, [navigate]);

  return (
    <>
      {enteringDashboard && (
        <LoadingWorkspace onComplete={handleLoadingComplete} durationMs={1300} />
      )}

      <Routes>
        <Route
          path="/"
          element={<LandingPage onEnterDashboard={handleEnterDashboard} />}
        />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route
            index
            element={
              <Suspense fallback={<RouteSuspenseFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="orders"
            element={
              <Suspense fallback={<RouteSuspenseFallback />}>
                <OrdersPage />
              </Suspense>
            }
          />
          <Route
            path="menu"
            element={
              <Suspense fallback={<RouteSuspenseFallback />}>
                <MenuPage />
              </Suspense>
            }
          />
          <Route
            path="analytics"
            element={
              <Suspense fallback={<RouteSuspenseFallback />}>
                <AnalyticsPage />
              </Suspense>
            }
          />
          <Route
            path="staff"
            element={
              <Suspense fallback={<RouteSuspenseFallback />}>
                <StaffPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<RouteSuspenseFallback />}>
                <SettingsPage />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <RestaurantProvider>
          <AppRoutes />
        </RestaurantProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;

