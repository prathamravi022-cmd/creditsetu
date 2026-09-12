import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { Shield, Phone, Lock, ArrowRight, AlertCircle, Clock, RefreshCw } from "lucide-react";

var ADMIN_PHONE = "9259609658";

export default function AdminLogin() {
  var { sendOTP, verifyOTP, setUser } = useAuth();
  var [step, setStep] = useState("phone");
  var [phone, setPhone] = useState("");
  var [otp, setOtp] = useState("");
  var [error, setError] = useState("");
  var [loading, setLoading] = useState(false);
  var [countdown, setCountdown] = useState(0);
  var timerRef = useRef(null);
  var navigate = useNavigate();

  useEffect(function() {
    if (countdown > 0) {
      timerRef.current = setInterval(function() {
        setCountdown(function(c) { if (c <= 1) { clearInterval(timerRef.current); return 0; } return c - 1; });
      }, 1000);
    }
    return function() { if (timerRef.current) clearInterval(timerRef.current); };
  }, [countdown]);

  async function handlePhoneSubmit() {
    setError("");
    if (phone !== ADMIN_PHONE) {
      setError("Unauthorized! This phone number does not have admin access.");
      return;
    }
    setLoading(true);
    try {
      await sendOTP(phone, "recaptcha-container");
      setLoading(false);
      setStep("otp");
      setCountdown(30);
    } catch (err) {
      setLoading(false);
      console.warn("[Admin] Firebase sendOTP failed, using dev mode:", err.message);
      setStep("otp");
      setCountdown(30);
    }
  }

  async function handleOtpSubmit() {
    setError("");
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      var userData = await verifyOTP(phone, otp);
      setLoading(false);
      if (userData && userData.isAdmin) {
        sessionStorage.setItem("admin_phone", phone);
        setTimeout(function(){ navigate("/admin/dashboard"); }, 300);
      } else {
        setError("This number is not authorized for admin access.");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "Verification failed. Please try again.");
    }
  }

  function handleResend() {
    if (countdown > 0) return;
    setOtp("");
    setError("");
    handlePhoneSubmit();
  }

  return (<div className="min-h-screen flex items-center justify-center px-4 relative">
    <div aria-hidden="true" className="cs-orb cs-orb-green w-[380px] h-[380px] -top-32 -left-28 opacity-60" />
    <div aria-hidden="true" className="cs-orb cs-orb-saffron w-[320px] h-[320px] -bottom-32 -right-24 opacity-60" />
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[#138808] flex items-center justify-center mx-auto mb-4"><Shield className="w-8 h-8 text-white" /></div>
        <h1 className="text-2xl font-bold text-[#000080]">CreditSetu Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Authorized personnel only</p>
      </div>
      <div className="glass-card rounded-2xl p-8 relative z-10">
        {step === "phone" ? (<div>
          <div className="flex items-center gap-2 mb-4"><Phone className="w-5 h-5 text-[#FF9933]" /><h2 className="font-semibold text-[#000080]">Enter Admin Phone</h2></div>
          <p className="text-gray-500 text-xs mb-4">Only pre-authorized admin numbers can access this panel.</p>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-500 text-lg font-medium px-3 py-3 bg-gray-100 rounded-xl">+91</span>
            <input type="tel" value={phone} onChange={function(e){setPhone(e.target.value.replace(/[^0-9]/g,"").slice(0,10))}} placeholder="10-digit mobile number" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#138808] focus:ring-2 focus:ring-[#138808]/20 outline-none transition-all text-lg tracking-wider" maxLength={10} />
          </div>
          {error && <div className="flex items-center gap-2 text-red-600 text-sm mb-4"><AlertCircle className="w-4 h-4" />{error}</div>}
          <button onClick={handlePhoneSubmit} disabled={phone.length !== 10 || loading} className="w-full py-3 rounded-xl bg-[#138808] text-white font-semibold hover:bg-[#0f6d06] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? "Sending OTP..." : "Send OTP"} {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>) : (<div>
          <div className="flex items-center gap-2 mb-4"><Lock className="w-5 h-5 text-[#FF9933]" /><h2 className="font-semibold text-[#000080]">Enter OTP</h2></div>
          <p className="text-gray-500 text-sm mb-2">OTP sent to +91 {phone}</p>
          <div className="flex items-center gap-2 mb-4 text-xs">
            <Clock className="w-3 h-3 text-gray-400" />
            {countdown > 0 ? <span className="text-gray-500">Resend in {countdown}s</span> : <button onClick={handleResend} className="text-[#138808] font-semibold hover:underline flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Resend OTP</button>}
          </div>
          <input type="text" value={otp} onChange={function(e){setOtp(e.target.value.replace(/[^0-9]/g,"").slice(0,6))}} placeholder="6-digit OTP" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#138808] focus:ring-2 focus:ring-[#138808]/20 outline-none transition-all text-lg tracking-[0.5em] text-center mb-4" maxLength={6} autoFocus />
          {error && <div className="flex items-center gap-2 text-red-600 text-sm mb-4"><AlertCircle className="w-4 h-4" />{error}</div>}
          <button onClick={handleOtpSubmit} disabled={otp.length !== 6 || loading} className="w-full py-3 rounded-xl bg-[#138808] text-white font-semibold hover:bg-[#0f6d06] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? "Verifying..." : "Verify & Login"} {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
          <button onClick={function(){setStep("phone");setError("");setOtp("")}} className="w-full mt-3 text-sm text-gray-500 hover:text-[#138808] transition-colors">Change Phone Number</button>
        </div>)}
      </div>
      <p className="text-center text-xs text-gray-400 mt-6">CreditSetu — Smart India Hackathon 2026</p>
    </div>
  </div>
  );
}