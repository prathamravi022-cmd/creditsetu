/**
 * AuthContext — Real Firebase Phone OTP Authentication
 * Supports: Google OAuth, Phone OTP (Firebase Phone Auth)
 * Admin phone gate: 9259609658
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  isFirebaseConfigured,
  auth,
  googleProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "../config/firebase";

const AuthContext = createContext(null);
const ADMIN_PHONE = "9259609658";
const STORAGE_KEY = "govtech-auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Create recaptcha container dynamically
  useEffect(() => {
    if (!document.getElementById("recaptcha-container")) {
      const div = document.createElement("div");
      div.id = "recaptcha-container";
      div.style.display = "none";
      document.body.appendChild(div);
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("fresh") === "1" || urlParams.get("new") === "1") {
      localStorage.clear();
      sessionStorage.clear();
      window.history.replaceState({}, "", window.location.pathname);
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch { localStorage.removeItem(STORAGE_KEY); }
    setLoading(false);
  }, []);

  // Persist auth state
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  // Google OAuth
  const loginWithGoogle = useCallback(async () => {
    if (auth && googleProvider) {
      try {
        const { signInWithPopup } = await import("firebase/auth");
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const userData = {
          id: fbUser.uid,
          name: fbUser.displayName || "Google User",
          email: fbUser.email || "",
          avatar: fbUser.photoURL || "",
          mobile: fbUser.phoneNumber || "",
          authMethod: "google",
          isAdmin: false,
        };
        setUser(userData);
        return userData;
      } catch (err) {
        console.error("[Auth] Google login failed:", err.message);
        throw err;
      }
    }
    throw new Error("Firebase not configured");
  }, []);

  // Phone OTP: Send OTP via Firebase
  const sendOTP = useCallback(async (mobile, recaptchaContainerId) => {
    if (!auth) throw new Error("Firebase not configured");
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          recaptchaContainerId || "recaptcha-container",
          { size: "invisible" }
        );
      }
      const fullNumber = "+91" + mobile;
      const result = await signInWithPhoneNumber(auth, fullNumber, window.recaptchaVerifier);
      setConfirmationResult(result);
      console.log("[Auth] OTP sent to", mobile);
      return { success: true, method: "firebase" };
    } catch (err) {
      console.error("[Auth] sendOTP failed:", err.message);
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch {}
        window.recaptchaVerifier = null;
      }
      throw err;
    }
  }, []);

  // Phone OTP: Verify OTP via Firebase
  const verifyOTP = useCallback(async (mobile, otp) => {
    if (confirmationResult && auth) {
      try {
        const credential = await confirmationResult.confirm(otp);
        const fbUser = credential.user;
        const isAdmin = mobile === ADMIN_PHONE;
        const userData = {
          id: fbUser.uid,
          mobile,
          name: isAdmin ? "Admin User" : "User " + mobile.slice(-4),
          authMethod: "mobile",
          isAdmin,
        };
        setUser(userData);
        setConfirmationResult(null);
        if (window.recaptchaVerifier) {
          try { window.recaptchaVerifier.clear(); } catch {}
          window.recaptchaVerifier = null;
        }
        return userData;
      } catch (err) {
        console.error("[Auth] verifyOTP failed:", err.message);
        throw new Error("Invalid OTP. Please try again.");
      }
    }
    // Dev fallback: accept any 6-digit OTP without Firebase
    if (otp && otp.length === 6 && /^[0-9]{6}$/.test(otp)) {
      console.warn("[Auth] Dev mode: accepting OTP without Firebase");
      const isAdmin = mobile === ADMIN_PHONE;
      const userData = {
        id: "mobile-" + mobile,
        mobile,
        name: isAdmin ? "Admin User" : "User " + mobile.slice(-4),
        authMethod: "mobile",
        isAdmin,
      };
      setUser(userData);
      return userData;
    }
    throw new Error("Please enter a valid 6-digit OTP.");
  }, [confirmationResult]);

  const loginWithMobile = useCallback(async (mobile, otp) => {
    return verifyOTP(mobile, otp);
  }, [verifyOTP]);

  
  // Firebase Email/Password: Signup
  const signupWithEmail = useCallback(async (email, password, name) => {
    if (!auth) throw new Error('Firebase not configured');
    try {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = result.user;
      const isAdmin = false;
      const userData = {
        id: fbUser.uid,
        name: name || email.split('@')[0],
        email: fbUser.email || email,
        mobile: '',
        authMethod: 'firebase-email',
        isAdmin,
      };
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('[Auth] signupWithEmail failed:', err.message);
      throw err;
    }
  }, []);

  // Firebase Email/Password: Login
  const loginWithEmail = useCallback(async (email, password) => {
    if (!auth) throw new Error('Firebase not configured');
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const result = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = result.user;
      const isAdmin = fbUser.email === 'prathamravi022@gmail.com';
      const userData = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
        email: fbUser.email || '',
        mobile: fbUser.phoneNumber || '',
        authMethod: 'firebase-email',
        isAdmin,
      };
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('[Auth] loginWithEmail failed:', err.message);
      throw err;
    }
  }, []);

const logout = useCallback(() => {
    setUser(null);
    setConfirmationResult(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.clear();
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch {}
      window.recaptchaVerifier = null;
    }
  }, []);

  const isAdmin = user?.isAdmin === true;

  return (
    <AuthContext.Provider
      value={{
        user, setUser, loading, isAdmin,
        loginWithGoogle, loginWithMobile, sendOTP, verifyOTP, logout, loginWithEmail, signupWithEmail,
        isAuthenticated: !!user,
        isFirebaseReady: isFirebaseConfigured && !!auth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}