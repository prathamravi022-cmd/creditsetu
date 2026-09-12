/**
 * LoginScreen — Phase 0 authentication.
 * Google OAuth + Mobile OTP verification.
 * Admin phone gate for 9259609658.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../store/AuthContext';
import {
  Shield, Smartphone, Send, Check, Globe,
  ArrowRight, Lock, User
} from 'lucide-react';
import MoltenMetal from '../ui/MoltenMetal';

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithMobile, sendOTP } = useAuth();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const countdownRef = useRef(null);

  const langs = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'mr', label: 'मराठी' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
  ];

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Logged in with Google!');
      navigate('/get-started');
    } catch {
      toast.error('Google login failed');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (otpCountdown > 0) {
      countdownRef.current = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(countdownRef.current);
  }, [otpCountdown]);

  const handleSendOTP = async () => {
    if (mobile.length < 10) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    try {
      await sendOTP(mobile);
      toast.success('OTP sent to ' + mobile);
    } catch(e) {
      console.warn('[Login] Firebase OTP failed, using dev mode:', e.message);
      toast.success('Development mode: enter any 6-digit OTP');
    }
    setOtpSent(true);
    setOtpCountdown(60);
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 4) {
      toast.error('Enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const user = await loginWithMobile(mobile, otp);
      toast.success(`Welcome${user.isAdmin ? ' Admin' : ''}!`);

      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/get-started');
      }
    } catch {
      toast.error('Please enter a valid 6-digit OTP.');
    }
    setLoading(false);
  };

  return (
  <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* MoltenMetal animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-700" />
        <MoltenMetal
          color1="#064e3b"
          color2="#15803d"
          color3="#bbf7d0"
          speed={0.15}
          scale={2.5}
          detail={3}
          glow={0.8}
          coreSize={0.05}
          swirl={0.5}
          fold={-0.1}
          blackPoint={0.12}
          brightness={0.7}
          colorMode="molten"
          grain={true}
          grainIntensity={0.02}
          mouseInteraction={true}
          mouseStrength={0.12}
          opacity={0.45}
        />
      </div>
      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-green-900/30 via-transparent to-green-900/40" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            CreditSetu Scheme Finder
          </h1>
          <p className="text-green-200 text-sm">
            {t('landing.trust')}
          </p>
        </div>

        {/* Language Dropdown */}
        <select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="absolute top-4 right-4 flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors bg-white/10 backdrop-blur-sm border border-white/20"
        >
          {langs.map((l) => (
            <option key={l.code} value={l.code} className="text-gray-900">{l.label}</option>
          ))}
        </select>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Mobile + OTP */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-slate-100 rounded-l-xl border border-r-0 border-slate-300">
                  <span className="text-sm text-slate-500">+91</span>
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  className="flex-1 px-4 py-3 rounded-r-xl border border-slate-300 focus:border-green-700 focus:ring-2 focus:ring-green-700/20 outline-none font-mono"
                  disabled={otpVerified}
                />
                {!otpVerified && (
                  <button
                    onClick={handleSendOTP}
                    className="px-4 py-3 bg-green-700 text-white rounded-xl font-medium hover:bg-green-800 transition-colors whitespace-nowrap"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>              {otpSent && !otpVerified && (
              <div style={{ transition: "all 0.3s ease", opacity: otpSent ? 1 : 0, maxHeight: otpSent ? "500px" : "0px", overflow: "hidden" }}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Enter OTP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-green-700 focus:ring-2 focus:ring-green-700/20 outline-none font-mono text-lg tracking-[0.3em] text-center"
                  />
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading}
                    className="px-6 py-3 bg-green-700 text-white rounded-xl font-medium hover:bg-green-800 transition-colors"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-400">
                    Enter the 6-digit OTP sent to your mobile.
                  </p>
                  {otpCountdown > 0 ? (
                    <span className="text-xs text-slate-400">
                      Resend in {otpCountdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="text-xs text-green-700 font-medium hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            {otpVerified && (
              <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                <Check className="w-4 h-4" /> Phone verified
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-xs text-slate-400 text-center mt-6">
            By continuing, you agree to our Terms of Service.
            <br />
            Government data is handled per DPDP Act 2023.
          </p>
        </div>

        {/* Admin Notice */}              <p className="text-center text-green-300/60 text-xs mt-4">
          Admin access is restricted to authorized personnel.
        </p>
      </motion.div>
    </div>
  );
}
