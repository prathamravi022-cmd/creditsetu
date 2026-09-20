import { DarkModeProvider } from "./store/DarkModeContext";
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoginScreen from './components/auth/LoginScreen';
import LandingPage from './components/landing/LandingPage';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import ResultsDashboard from './components/results/ResultsDashboard';
import PartnerLocator from './components/map/PartnerLocator';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import Page404 from './components/common/Page404';
import ForbiddenPage from './components/common/ForbiddenPage';
import EditProfile from './components/common/EditProfile';
import GrievanceModal from './components/grievance/GrievanceModal';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsConditions from './components/legal/TermsConditions';
import FeedbackPage from './components/legal/FeedbackPage';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <ForbiddenPage />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      {/* Legal pages (public) */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsConditions />} />
      <Route path="/feedback" element={<FeedbackPage />} />

      {/* Landing is always visible */}
      <Route path="/" element={<LandingPage />} />

      {/* Protected routes */}
      <Route
        path="/get-started"
        element={
          <ProtectedRoute>
            <OnboardingWizard />
          </ProtectedRoute>
        }
      />
      <Route path="/results" element={<ResultsDashboard />} />
      <Route path="/find-bank" element={<PartnerLocator />} />
      <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

      {/* Admin — login page (public) */}
      <Route path="/admin" element={<AdminLogin />} />
      {/* Admin — dashboard (requires admin auth) */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Page404 />} />
    </Routes>
  );
}

export default function App() {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/admin";
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DarkModeProvider>
        <div className="cs-shell min-h-screen flex flex-col text-slate-900 dark:text-gray-100 transition-colors duration-300">
          {/* Fixed ambient background: saffron/green/navy glows + faint grid */}
          <div className="cs-ambient" aria-hidden="true" />
          {!isLanding && !isAuthPage && <Navbar />}
          <main className="flex-1">
            <AppRoutes />
          </main>
          <GrievanceModal />
          {!isLanding && !isAuthPage && <Footer />}
        </div>
      </DarkModeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
