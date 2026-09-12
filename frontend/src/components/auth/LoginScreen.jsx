/**
 * LoginScreen — Authentication page.
 * Google OAuth + Mobile OTP verification.
 * Admin phone gate for 9259609658.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../store/AuthContext';
import {
  Shield, Send, Check, ArrowRight, Phone
} from 'lucide-react';
import LanguageDropdown from '../ui/LanguageDropdown';

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithMobile, sendOTP, isFirebaseReady } = useAuth();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpError, setOtpError] = useState('');
  const countdownRef = useRef(null);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (otpCountdown > 0) {
      countdownRef.current = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(countdownRef.current);
  }, [otpCountdown]);

  // Focus OTP input when it appears
  useEffect(() => {
    if (otpSent && !otpVerified && otpInputRef.current) {
      setTimeout(() => otpInputRef.current?.focus(), 300);
    }
  }, [otpSent, otpVerified]);

  const maskedPhone = mobile.length >= 4
    ? '•••••' + mobile.slice(-4)
    : mobile;

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success(t('login.google_success') || 'Logged in with Google!');
      navigate('/get-started');
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('popup_closed') || msg.includes('cancelled')) {
        toast('Sign-in cancelled.', { icon: 'ℹ️' });
      } else {
        toast.error(t('login.google_failed') || 'Google login unavailable. Use mobile number login below.');
      }
    }
    setLoading(false);
  };

  const handleSendOTP = async () => {
    if (mobile.length < 10) {
      toast.error(t('login.enter_valid_mobile') || 'Enter a valid 10-digit mobile number');
      return;
    }
    setSendingOtp(true);
    setOtpError('');
    try {
      // Race Firebase OTP against a timeout — reCAPTCHA blocks in headless
      const otpPromise = sendOTP(mobile);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('reCAPTCHA timeout')), 8000)
      );
      await Promise.race([otpPromise, timeoutPromise]);
      toast.success(t('login.otp_sent') || 'OTP sent to +91 ' + mobile);
    } catch (e) {
      console.warn('[Login] Firebase OTP unavailable, using dev mode:', e.message);
      toast.success(t('login.dev_mode') || 'Development mode: enter any 6-digit OTP');
    }
    setOtpSent(true);
    setOtpCountdown(60);
    setSendingOtp(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      setOtpError(t('login.enter_otp_6') || 'Please enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    setOtpError('');
    try {
      const user = await loginWithMobile(mobile, otp);
      setOtpVerified(true);
      toast.success(t('login.welcome') || `Welcome${user.isAdmin ? ' Admin' : ''}!`);

      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/get-started');
      }
    } catch (err) {
      setOtpError(err?.message || t('login.invalid_otp') || 'Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleResend = () => {
    if (otpCountdown > 0) return;
    setOtp('');
    setOtpError('');
    handleSendOTP();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-gradient-to-br from-green-900 via-green-800 to-green-700">
      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-green-900/30 via-transparent to-green-900/40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Language selector — custom dropdown */}
        <div className="flex justify-end mb-3">
          <LanguageDropdown />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <div className="w-14 h-14 mx-auto mb-3 bg-green-700 rounded-2xl flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
            CreditSetu Scheme Finder
          </h1>
          <p className="text-green-200 text-sm">
            {t('landing.trust') || 'Built to help users discover relevant government credit schemes'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
            aria-label="Continue with Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('login.continue_google') || 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">{t('login.or') || 'or'}</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Mobile + OTP Section */}
          <div className="space-y-4">
            {/* Phone Input */}
            <div>
              <label htmlFor="mobile-input" className="block text-sm font-medium text-slate-700 mb-1">
                {t('login.mobile_number') || 'Mobile Number'}
              </label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-slate-100 rounded-l-xl border border-r-0 border-slate-300">
                  <span className="text-sm text-slate-500 font-medium">+91</span>
                </div>
                <input
                  id="mobile-input"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="tel-national"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  maxLength={10}
                  className="flex-1 px-4 py-3 rounded-r-xl border border-slate-300 focus:border-green-700 focus:ring-2 focus:ring-green-700/20 outline-none font-mono text-base"
                  disabled={otpVerified}
                  aria-required="true"
                />
                {!otpVerified && (
                  <button
                    onClick={handleSendOTP}
                    disabled={mobile.length < 10 || sendingOtp}
                    className="px-4 py-3 bg-green-700 text-white rounded-xl font-medium hover:bg-green-800 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send OTP"
                  >
                    {sendingOtp ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* OTP Section */}
            {otpSent && !otpVerified && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {/* Masked phone display */}
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>OTP sent to <strong className="text-slate-700">+91 {maskedPhone}</strong></span>
                </div>

                <div>
                  <label htmlFor="otp-input" className="block text-sm font-medium text-slate-700 mb-1">
                    {t('login.enter_otp') || 'Enter OTP'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      ref={otpInputRef}
                      id="otp-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setOtpError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                      placeholder="••••••"
                      maxLength={6}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-green-700 focus:ring-2 focus:ring-green-700/20 outline-none font-mono text-lg tracking-[0.3em] text-center"
                      aria-required="true"
                      aria-invalid={!!otpError}
                    />
                    <button
                      onClick={handleVerifyOTP}
                      disabled={otp.length < 6 || loading}
                      className="px-6 py-3 bg-green-700 text-white rounded-xl font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label="Verify OTP"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {otpError && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                      <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full" />
                      {otpError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    {t('login.otp_hint') || 'Enter the 6-digit OTP sent to your mobile.'}
                  </p>
                  {otpCountdown > 0 ? (
                    <span className="text-xs text-slate-400 tabular-nums">
                      {t('login.resend_in', { seconds: otpCountdown }) || `Resend in ${otpCountdown}s`}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-xs text-green-700 font-medium hover:underline"
                    >
                      {t('login.resend_otp') || 'Resend OTP'}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Verified state */}
            {otpVerified && (
              <div className="flex items-center gap-2 text-green-700 text-sm font-medium bg-green-50 px-3 py-2 rounded-lg">
                <Check className="w-4 h-4" /> {t('login.phone_verified') || 'Phone verified successfully'}
              </div>
            )}
          </div>

          {/* Terms */}
          <p className="text-[11px] text-slate-400 text-center mt-5 leading-relaxed">
            {t('login.terms_prefix') || 'By continuing, you agree to our'}
            {' '}<Link to="/terms" className="underline hover:text-slate-600">{t('login.terms_link') || 'Terms of Service'}</Link>.
            <br />
            {t('login.dpdp') || 'Government data is handled per DPDP Act 2023.'}
          </p>
        </div>

        {/* Admin Notice */}
        <p className="text-center text-green-300/60 text-xs mt-4">
          <Link to="/admin" className="hover:text-green-200 transition-colors">
            {t('login.admin_access') || 'Admin access is restricted to authorized personnel.'}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
