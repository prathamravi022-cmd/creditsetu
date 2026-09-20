/**
 * AuthModal — Premium Supabase authentication modal.
 * Opens directly (no login page needed).
 * Features: fade-in, slide-up, backdrop-blur, shake animation,
 * inline errors, loading spinner, skeleton loader, admin redirect.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../config/supabase';
import { useAuth } from '../../store/AuthContext';

const ADMIN_EMAIL = 'prathamravi022@gmail.com';
const ADMIN_PHONE = '9259609658';

/* ─── Inline SVG spinner ─── */
function Spinner({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ─── CSS keyframes injected once ─── */
const STYLE_ID = 'auth-modal-styles';
function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes authFadeIn { from { opacity:0 } to { opacity:1 } }
    @keyframes authSlideUp { from { opacity:0; transform:translateY(24px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
    @keyframes authShake { 0%,100%{transform:translateX(0)} 10%,30%,50%,70%,90%{transform:translateX(-4px)} 20%,40%,60%,80%{transform:translateX(4px)} }
    @keyframes authPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    .auth-modal-backdrop { animation: authFadeIn 0.25s ease-out }
    .auth-modal-panel { animation: authSlideUp 0.35s cubic-bezier(0.16,1,0.3,1) }
    .auth-shake { animation: authShake 0.45s ease-in-out }
    .auth-skeleton { animation: authPulse 1.5s ease-in-out infinite }
  `;
  document.head.appendChild(style);
}

/* ─── Main component ─── */
export default function AuthModal({ open, onClose }) {
  const navigate = useNavigate();
  const { setUser, loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();

  const [mode, setMode] = useState('login'); // login | signup | phone | otp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shakeField, setShakeField] = useState('');
  const [success, setSuccess] = useState(false);

  const emailRef = useRef(null);
  const otpRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => { ensureStyles(); }, []);

  // Focus first input on open
  useEffect(() => {
    if (!open) return;
    setTimeout(() => emailRef.current?.focus(), 400);
    // Reset state
    setMode('login'); setEmail(''); setPassword(''); setPhone(''); setOtp('');
    setOtpSent(false); setLoading(false); setError(''); setSuccess(false);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const triggerShake = useCallback((field) => {
    setShakeField(field);
    setTimeout(() => setShakeField(''), 500);
  }, []);

  const handleError = useCallback((msg, field) => {
    setError(msg);
    if (field) triggerShake(field);
  }, [triggerShake]);

  const isAdminUser = (userEmail, userPhone) => {
    return userEmail === ADMIN_EMAIL || userPhone === ADMIN_PHONE;
  };

  /* ─── Email/Password Login ─── */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) { handleError('Email is required', 'email'); return; }
    if (!password) { handleError('Password is required', 'password'); return; }

    setLoading(true); setError('');
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: supaErr } = await supabase.auth.signInWithPassword({ email, password });
        if (supaErr) throw supaErr;
        const u = data.user;
        const admin = isAdminUser(u.email, u.phone);
        const userData = {
          id: u.id, name: u.user_metadata?.name || u.email?.split('@')[0] || 'User',
          email: u.email || '', mobile: u.phone || '',
          authMethod: 'supabase', isAdmin: admin,
        };
        setUser(userData);
        setSuccess(true);
        setTimeout(() => {
          onClose();
          navigate(admin ? '/admin/dashboard' : '/get-started');
        }, 600);
      } else {
        // Firebase email/password fallback
        const userData = await loginWithEmail(email, password);
        const admin = isAdminUser(userData.email, userData.mobile);
        if (admin) userData.isAdmin = true;
        setUser(userData);
        setSuccess(true);
        setTimeout(() => {
          onClose();
          navigate(admin ? "/admin/dashboard" : "/get-started");
        }, 600);
        return;
      }
    } catch (err) {
      const msg = err.message || 'Login failed';
      if (msg.includes('Invalid login credentials')) {
        handleError('Invalid email or password. Please try again.', 'email');
      } else if (msg.includes('Email not confirmed')) {
        handleError('Please confirm your email first. Check your inbox.', 'email');
      } else {
        // Fallback to Firebase
        try {
          const userData = await loginWithGoogle();
        const admin = isAdminUser(userData.email, userData.mobile);
        if (admin) userData.isAdmin = true;
        setUser(userData);
        setSuccess(true);
        setTimeout(() => {
          onClose();
          navigate(admin ? "/admin/dashboard" : "/get-started");
        }, 600);
          return;
        } catch (fbErr) {
          handleError(fbErr.message || msg, "email");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  /* ─── Email/Password Signup ─── */
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email.trim()) { handleError('Email is required', 'email'); return; }
    if (!password || password.length < 6) { handleError('Password must be at least 6 characters', 'password'); return; }

    setLoading(true); setError('');
    try {
      if (isSupabaseConfigured && supabase) {
        const { error: supaErr } = await supabase.auth.signUp({
          email, password,
          options: { data: { name: email.split('@')[0] } },
        });
        if (supaErr) throw supaErr;
        setSuccess(true);
        setMode('login');
        setError('');
        // Show success message briefly
      } else {
        // Firebase email/password fallback
        const userData = await signupWithEmail(email, password, email.split("@")[0]);
        setUser(userData);
        setSuccess(true);
        setTimeout(() => {
          onClose();
          navigate("/get-started");
        }, 800);
        return;
      }
    } catch (err) {
      const msg = err.message || 'Signup failed';
      if (msg.includes('already registered')) {
        handleError('This email is already registered. Please sign in.', 'email');
      } else {
        handleError(msg, 'email');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ─── Phone OTP: Send ─── */
  const handleSendOTP = async () => {
    if (!phone.trim() || phone.length < 10) {
      handleError('Enter a valid 10-digit mobile number', 'phone');
      return;
    }
    setLoading(true); setError('');
    try {
      if (isSupabaseConfigured && supabase) {
        const { error: supaErr } = await supabase.auth.signInWithOtp({ phone: '+91' + phone });
        if (supaErr) throw supaErr;
      }
      setOtpSent(true);
      setMode('otp');
    } catch (err) {
      const msg = err.message || 'Failed to send OTP';
      if (msg.includes('SMS')) {
        handleError('SMS service unavailable. Please try email login.', 'phone');
      } else {
        handleError(msg, 'phone');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ─── Phone OTP: Verify ─── */
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { handleError('Enter the 6-digit OTP', 'otp'); return; }

    setLoading(true); setError('');
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: supaErr } = await supabase.auth.verifyOtp({
          phone: '+91' + phone, token: otp, type: 'sms',
        });
        if (supaErr) throw supaErr;
        const u = data.user;
        const admin = isAdminUser(u.email, u.phone);
        const userData = {
          id: u.id, name: u.user_metadata?.name || 'User ' + phone.slice(-4),
          email: u.email || '', mobile: u.phone || phone,
          authMethod: 'phone', isAdmin: admin,
        };
        setUser(userData);
      } else {
        // Dev fallback
        const admin = isAdminUser('', phone);
        const userData = {
          id: 'phone-' + phone, mobile: phone,
          name: admin ? 'Admin User' : 'User ' + phone.slice(-4),
          authMethod: 'phone', isAdmin: admin,
        };
        setUser(userData);
      }
      setSuccess(true);
      setTimeout(() => {
        onClose();
        navigate(isAdminUser('', phone) ? '/admin/dashboard' : '/get-started');
      }, 600);
    } catch (err) {
      const msg = err.message || 'OTP verification failed';
      if (msg.includes('Invalid') || msg.includes('expired')) {
        handleError('Invalid or expired OTP. Please try again.', 'otp');
      } else {
        handleError(msg, 'otp');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ─── Google OAuth ─── */
  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      if (isSupabaseConfigured && supabase) {
        const { error: supaErr } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin },
        });
        if (supaErr) throw supaErr;
      } else {
        await loginWithGoogle();
        setSuccess(true);
        setTimeout(() => { onClose(); navigate('/get-started'); }, 600);
      }
    } catch (err) {
      handleError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const inputCls = (field) =>
    `w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-800 dark:text-white ${
      shakeField === field
        ? 'border-red-500 auth-shake'
        : 'border-gray-200 dark:border-gray-700 focus:border-[#138808] focus:ring-2 focus:ring-[#138808]/20'
    }`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 auth-modal-backdrop"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={panelRef}
        className="auth-modal-panel relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success overlay */}
        {success && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white dark:bg-gray-900">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-green-700">Welcome!</p>
          </div>
        )}

        {/* Close button */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#138808] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {mode === 'signup' ? 'Create Account' : mode === 'phone' || mode === 'otp' ? 'Phone Login' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {mode === 'signup' ? 'Join CreditSetu to discover schemes' : mode === 'otp' ? 'Enter the code sent to +91 ' + phone : 'Sign in to your account'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* ─── Login form ─── */}
          {mode === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input ref={emailRef} type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className={inputCls('email')} autoComplete="email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className={inputCls('password')} autoComplete="current-password" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-[#138808] hover:bg-[#0f6d06] text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><Spinner /> Signing in...</> : 'Sign In'}
              </button>
            </form>
          )}

          {/* ─── Signup form ─── */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input ref={emailRef} type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className={inputCls('email')} autoComplete="email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters" className={inputCls('password')} autoComplete="new-password" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-[#138808] hover:bg-[#0f6d06] text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><Spinner /> Creating account...</> : 'Create Account'}
              </button>
            </form>
          )}

          {/* ─── Phone input ─── */}
          {mode === 'phone' && (
            <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
                    +91
                  </div>
                  <input ref={emailRef} type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210" className={inputCls('phone')} autoComplete="tel" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-[#138808] hover:bg-[#0f6d06] text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><Spinner /> Sending OTP...</> : 'Send OTP'}
              </button>
            </form>
          )}

          {/* ─── OTP verify ─── */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">OTP Code</label>
                <input ref={otpRef} type="text" inputMode="numeric" maxLength={6} value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" className={inputCls('otp') + ' text-center text-2xl tracking-[0.3em] font-mono'} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-[#138808] hover:bg-[#0f6d06] text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><Spinner /> Verifying...</> : 'Verify OTP'}
              </button>
              <button type="button" onClick={() => { setMode('phone'); setOtpSent(false); setOtp(''); setError(''); }}
                className="w-full py-2 text-sm text-gray-500 hover:text-[#138808] transition-colors">
                ← Change number
              </button>
            </form>
          )}

          {/* ─── Divider ─── */}
          {mode !== 'otp' && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Google button */}
              <button onClick={handleGoogle} disabled={loading}
                className="w-full py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all disabled:opacity-60 flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>

              {/* Phone OTP button */}
              <button onClick={() => { setMode('phone'); setError(''); }} disabled={loading}
                className="w-full mt-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Continue with Phone OTP
              </button>
            </>
          )}

          {/* ─── Mode switcher ─── */}
          <div className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); setError(''); }} className="text-[#138808] font-semibold hover:underline">Sign up</button>
              </>
            ) : mode === 'signup' ? (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); }} className="text-[#138808] font-semibold hover:underline">Sign in</button>
              </>
            ) : mode === 'phone' ? (
              <>Prefer email?{' '}
                <button onClick={() => { setMode('login'); setError(''); }} className="text-[#138808] font-semibold hover:underline">Sign in with email</button>
              </>
            ) : null}
          </div>

          {/* Terms */}
          <p className="mt-4 text-center text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
            By continuing, you agree to our <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
            <br />Government data is handled per DPDP Act 2023.
          </p>
        </div>
      </div>
    </div>
  );
}
