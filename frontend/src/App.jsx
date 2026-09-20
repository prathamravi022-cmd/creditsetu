import { DarkModeProvider } from "./store/DarkModeContext";
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AuthModal from './components/auth/AuthModal';
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

/* ─── Skeleton loader for session check ─── */
function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-sm p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="flex gap-2 mt-4">
            <div className="w-3 h-3 rounded-full bg-[#FF9933] animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-[#138808] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <ForbiddenPage />;
  }

  return children;
}

function AppRoutes({ onAuthOpen }) {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/forbidden" element={<ForbiddenPage />} />

      {/* Legal pages (public) */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsConditions />} />
      <Route path="/feedback" element={<FeedbackPage />} />

      {/* Landing is always visible */}
      <Route path="/" element={<LandingPage onAuthOpen={onAuthOpen} />} />

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
      <Route path="/admin" element={<AdminLogin onAuthOpen={onAuthOpen} />} />
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

function AppInner() {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const isAuthPage = location.pathname === "/admin";
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Open auth modal when navigating to old /login route
  useEffect(() => {
    if (location.pathname === "/login") {
      setAuthModalOpen(true);
    }
  }, [location.pathname]);

  const openAuth = () => setAuthModalOpen(true);
  const closeAuth = () => setAuthModalOpen(false);

  return (
    <div className="cs-shell min-h-screen flex flex-col text-slate-900 dark:text-gray-100 transition-colors duration-300">
      {/* Fixed ambient background */}
      <div className="cs-ambient" aria-hidden="true" />
      {!isLanding && !isAuthPage && <Navbar onAuthOpen={openAuth} />}
      <main className="flex-1">
        <AppRoutes onAuthOpen={openAuth} />
      </main>
      <GrievanceModal />
      {!isLanding && !isAuthPage && <Footer />}
      <AuthModal open={authModalOpen} onClose={closeAuth} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DarkModeProvider>
          <AppInner />
        </DarkModeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
