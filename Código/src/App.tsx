import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NPSProvider } from "./contexts/NPSContext";
import { Toaster } from "./components/ui/toaster";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import Navigation from "./components/layout/Navigation";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import QuestionsPage from "./pages/admin/QuestionsPage";
import UsersPage from "./pages/admin/UsersPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import ReportsPage from "./pages/admin/ReportsPage";

// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import EvaluationsPage from "./pages/user/EvaluationsPage";

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/user" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <DashboardLayout navigation={<Navigation isAdmin={isAdmin} />}>
      <Routes>
        {/* Redirect root based on role */}
        <Route path="/" element={<Navigate to={isAdmin ? "/admin" : "/user"} replace />} />
        <Route path="/login" element={<Navigate to={isAdmin ? "/admin" : "/user"} replace />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <ProtectedRoute requireAdmin>
              <QuestionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requireAdmin>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requireAdmin>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* User Routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/evaluations"
          element={
            <ProtectedRoute>
              <EvaluationsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to={isAdmin ? "/admin" : "/user"} replace />} />
      </Routes>
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <NPSProvider>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <AppRoutes />
          <Toaster />
        </Suspense>
      </NPSProvider>
    </AuthProvider>
  );
}

export default App;
