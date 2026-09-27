import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./store/AuthContext";
import { DarkModeProvider } from "./store/DarkModeContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import LandingPage from "./components/landing/LandingPage";
import ResultsDashboard from "./components/results/ResultsDashboard";
import OnboardingWizard from "./components/onboarding/OnboardingWizard";
import FindBankMap from "./components/map/PartnerLocator";
/* survey/faq/feedback pages were removed from this build — keep imports only if those folders exist */
import AdminDashboard from "./components/admin/AdminDashboard";
/* AdminAuditLog / AdminBankLocator / AdminConfig were removed from this build to match the current filesystem */

const LoadFailed = () => (
  <main style={{ padding: "3rem", textAlign: "center", color: "#fff" }}>
    <h2>Something went wrong loading this page.</h2>
    <button
      onClick={() => window.location.href = "/"}
      style={{
        marginTop: "1rem",
        padding: "0.6rem 1.4rem",
        background: "#ff9933",
        border: "none",
        borderRadius: "0.5rem",
        color: "#fff",
        fontWeight: "600",
        cursor: "pointer",
      }}
    >
      Back to home
    </button>
  </main>
);

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) {
    if (adminOnly) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/" replace />;
  }
  if (adminOnly) {
    const isAdmin =
      (user.email && user.email.toLowerCase() === "prathamravi022@gmail.com") ||
      (user.phone && String(user.phone).replace(/[^0-9]/g, "") === "9259609658");
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  }
  return children;
}

function RootLayout({ children }) {
  const { pathname } = useLocation();
  // The landing page ships its own header and footer, so the global chrome is
  // skipped there to avoid rendering two navbars / footers on top of each other.
  const isLanding = pathname === "/";
  return (
    <DarkModeProvider>
      <AuthProvider>
        <div className="page-shell">
          {!isLanding && <Navbar />}
          <main>{children}</main>
          {!isLanding && <Footer />}
        </div>
      </AuthProvider>
    </DarkModeProvider>
  );
}

const Landing = lazy(() => import("./components/landing/LandingPage"));
const Results = lazy(() => import("./components/results/ResultsDashboard"));
const Map = lazy(() => import("./components/map/PartnerLocator"));
// survey/faq/feedback routes were removed from this build to match the current filesystem
const Admin = lazy(() => import("./components/admin/AdminDashboard"));
const EditProfile = lazy(() => import("./components/common/EditProfile"));
const PrivacyPolicy = lazy(() => import("./components/legal/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./components/legal/TermsConditions"));
const FeedbackPage = lazy(() => import("./components/legal/FeedbackPage"));
// AdminLog/AdminMap/AdminConfigComponent were removed from this build to match the current filesystem

export default function App() {
  return (
    <RootLayout>
      {/* Public marketing surface */}
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadFailed />}>
              <Landing />
            </Suspense>
          }
        />

        {/* Core product surfaces */}
        <Route
          path="/get-started"
          element={
            <Suspense fallback={<LoadFailed />}>
              <OnboardingWizard />
            </Suspense>
          }
        />
        <Route
          path="/onboarding"
          element={
            <Suspense fallback={<LoadFailed />}>
              <OnboardingWizard />
            </Suspense>
          }
        />
        <Route
          path="/find-schemes"
          element={
            <Suspense fallback={<LoadFailed />}>
              <Results />
            </Suspense>
          }
        />
        <Route
          path="/schemes"
          element={
            <Suspense fallback={<LoadFailed />}>
              <Results />
            </Suspense>
          }
        />
        <Route
          path="/results"
          element={
            <Suspense fallback={<LoadFailed />}>
              <Results />
            </Suspense>
          }
        />
        <Route
          path="/find-bank"
          element={
            <Suspense fallback={<LoadFailed />}>
              <Map />
            </Suspense>
          }
        />
        <Route
          path="/bank-locator"
          element={
            <Suspense fallback={<LoadFailed />}>
              <Map />
            </Suspense>
          }
        />

        {/* Editable profile — reachable from the menu and the Schemes page */}
        <Route
          path="/edit-profile"
          element={
            <Suspense fallback={<LoadFailed />}>
              <EditProfile />
            </Suspense>
          }
        />

        {/* Trust, feedback, and support */}
        <Route
          path="/privacy-policy"
          element={
            <Suspense fallback={<LoadFailed />}>
              <PrivacyPolicy />
            </Suspense>
          }
        />
        <Route
          path="/terms"
          element={
            <Suspense fallback={<LoadFailed />}>
              <TermsConditions />
            </Suspense>
          }
        />
        <Route
          path="/feedback"
          element={
            <Suspense fallback={<LoadFailed />}>
              <FeedbackPage />
            </Suspense>
          }
        />
        {/* Admin surface — gated behind admin identity */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <Suspense fallback={<LoadFailed />}>
                <Admin />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Not found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RootLayout>
  );
}
