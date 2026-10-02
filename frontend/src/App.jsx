import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./store/AuthContext";
import { DarkModeProvider } from "./store/DarkModeContext";
import { AuthModalProvider, useAuthModal } from "./store/AuthModalContext";
import { MobileMenuProvider, useMobileMenu } from "./store/MobileMenuContext";
import AuthModal from "./components/auth/AuthModal";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import MobileMenu from "./components/common/MobileMenu";
import MobileStickyCta from "./components/common/MobileStickyCta";
import PageTransition from "./components/common/PageTransition";
import ProfileWizard from "./components/profile/ProfileWizard";
import EligibilityFlow from "./components/eligibility/EligibilityFlow";

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
  const { user, loading } = useAuth();
  // Wait for the saved session to be restored, otherwise a hard reload on a
  // protected URL (e.g. /admin/dashboard) bounces the user home before the
  // stored account has been read back from localStorage.
  if (loading) return null;
  if (!user) {
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
  return (
    <DarkModeProvider>
      <AuthProvider>
        <AuthModalProvider>
          <MobileMenuProvider>
            <Shell>{children}</Shell>
          </MobileMenuProvider>
        </AuthModalProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

/** Renders the global chrome plus the one, shared auth modal. */
function Shell({ children }) {
  const { authOpen, openAuth, closeAuth } = useAuthModal();
  const { menuOpen, closeMenu } = useMobileMenu();
  const { pathname } = useLocation();
  // The landing page ships its own header and footer, so the global chrome is
  // skipped there to avoid rendering two navbars / footers on top of each other.
  const isLanding = pathname === "/";
  // MobileStickyCta floats over the page on exactly these routes, so the footer
  // reserves the CTA's height here (see MobileStickyCta's route map) to keep
  // its link row readable behind the button. Everywhere else the content runs
  // all the way down to the bottom edge.
  const hasFloatingCta = pathname === "/" || pathname === "/results";
  return (
    <div className={hasFloatingCta ? "page-shell has-floating-cta" : "page-shell"}>
      {!isLanding && <Navbar onAuthOpen={openAuth} />}
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      {!isLanding && <Footer />}

      {/* The single mobile drawer — opened by the hamburger in the app bar */}
      <MobileMenu open={menuOpen} onClose={closeMenu} />
      <MobileStickyCta />
      <AuthModal open={authOpen} onClose={closeAuth} />
    </div>
  );
}

/** Landing route wired to the shared auth modal so its CTAs are never dead. */
function LandingRoute() {
  const { openAuth } = useAuthModal();
  return (
    <Suspense fallback={<LoadFailed />}>
      <Landing onAuthOpen={openAuth} />
    </Suspense>
  );
}

const Landing = lazy(() => import("./components/landing/LandingPage"));
const Results = lazy(() => import("./components/results/ResultsDashboard"));
const Map = lazy(() => import("./components/map/PartnerLocator"));
// survey/faq/feedback routes were removed from this build to match the current filesystem
const Admin = lazy(() => import("./components/admin/AdminDashboard"));

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
          element={<LandingRoute />}
        />

        {/* Core product surfaces */}
        {/* First-timers walk the eligibility questions; returning users open on
            the flow's confirm card. Deeper details live behind /edit-profile. */}
        <Route
          path="/get-started"
          element={
            <Suspense fallback={<LoadFailed />}>
              <EligibilityFlow />
            </Suspense>
          }
        />
        <Route
          path="/onboarding"
          element={
            <Suspense fallback={<LoadFailed />}>
              <EligibilityFlow />
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
              <ProfileWizard mode="edit" />
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
