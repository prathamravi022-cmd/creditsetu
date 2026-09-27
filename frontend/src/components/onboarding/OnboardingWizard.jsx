import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../store/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Tilt3D from "../ui/Tilt3D";
import { saveProfile, loadProfile, generateAndCache } from "../../services/recommender";

/* scoped premium styles (no .scss file required) */

export default function OnboardingWizard() {
  const t = useTranslation().t;
  const { user, premium, isPremium } = useAuth();
  const navigate = useNavigate();
  const stepRef = useRef(null);
  const [step, setStep] = useState(0);
  const [schemeType, setSchemeType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("50000");
  const [geography, setGeography] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Prefill from a previously saved profile so "Edit Details" is seamless.
  useEffect(() => {
    const saved = loadProfile();
    if (!saved) return;
    if (saved.schemeType) setSchemeType(saved.schemeType);
    if (saved.purpose) setPurpose(saved.purpose);
    if (saved.amount) setAmount(String(saved.amount));
    if (saved.state || saved.geography) setGeography(saved.state || saved.geography);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleContinue = () => {
    const err = validateStep(step);
    if (err) { toast.error(err); return; }
    setStep(Math.min(step + 1, 4));
  };
  const handleBack = () => setStep(Math.max(step - 1, 0));
  const isLast = () => step === 4;

  const validateStep = (s) => {
    if (s === 0 && !schemeType) return "Please choose a scheme category";
    if (s === 1 && !purpose) return "Please choose a purpose";
    if (s === 2 && (!amount || Number(amount) <= 0)) return "Please set a valid amount";
    if (s === 3 && !geography) return "Please select your state";
    return null;
  };

  const handleSubmit = () => {
    for (let s = 0; s <= 4; s += 1) {
      const err = validateStep(s);
      if (err) { toast.error(err); setStep(s); return; }
    }

    const profile = {
      schemeType,
      purpose,
      amount: Number(amount) || 50000,
      state: geography,
      geography,
      ...loadProfile(),
    };

    // Persist the profile and the freshly ranked schemes, then land on the
    // Schemes page (not the homepage) so the user sees their matches right away.
    const savedProfile = saveProfile(profile);
    generateAndCache(savedProfile);

    setSubmitted(true);
    toast.success("Profile saved — here are your matched schemes");
    setTimeout(() => navigate("/results"), 900);
  };

  const riskLabel = (p) => {
    if (p >= 80) return "Low Risk";
    if (p >= 60) return "Moderate Risk";
    return "High Risk";
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-stage">
        <div className="onboarding-slide" key={step} style={{ transform: `translateX(-${step * 100}%)` }}>
          {/* Step 0 */}
          <section className="onboarding-card tilt-card">
            <div className="onboarding-cat">
              <span className="onboarding-dot">01</span>
              <span className="onboarding-cat-title">Scheme Category</span>
            </div>
            <div className="onboarding-grid">
              {[
                { key: "loan", label: t("onboarding.business_loan"), description: "Business / working capital / micro finance", icon: "M12 2l2.9 6.2 6.8.9-5 4.7 1.3 6.7L12 17.8 6 20.5l1.3-6.7-5-4.7 6.8-.9z", accent: "em-alert" },
                { key: "subsidy", label: t("onboarding.subsidy"), description: "Government subsidies & grants", icon: "M12 2l2.9 6.2 6.8.9-5 4.7 1.3 6.7L12 17.8 6 20.5l1.3-6.7-5-4.7 6.8-.9z", accent: "em-purple" },
                { key: "housing", label: t("onboarding.housing"), description: "Housing & home loan support", icon: "M12 2l2.9 6.2 6.8.9-5 4.7 1.3 6.7L12 17.8 6 20.5l1.3-6.7-5-4.7 6.8-.9z", accent: "em-navy" },
                { key: "education", label: t("onboarding.education"), description: "Scholarships & education loans", icon: "M12 2l2.9 6.2 6.8.9-5 4.7 1.3 6.7L12 17.8 6 20.5l1.3-6.7-5-4.7 6.8-.9z", accent: "em-green" }
              ].map((item) => {
                const checked = schemeType === item.key;
                return (
                  <button
                    key={item.key}
                    className={`onboarding-option ${checked ? "selected" : ""}`}
                    onClick={() => setSchemeType(item.key)}
                    type="button"
                    aria-pressed={checked}
                  >
                    <div className={`onboarding-icon-ring ${item.accent}`}>
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d={item.icon} /></svg>
                    </div>
                    <span className="onboarding-option-label">{item.label}</span>
                    <span className="onboarding-option-desc">{item.description}</span>
                  </button>
                );
              })}
            </div>

            {schemeType && (
              <div className="onboarding-scheme-preview tilt-card preview-card">
                <div className="sc-preview-head">
                  <span className="text-xs tracking-widest uppercase opacity-60">Top Match</span>
                  <span className="sc-preview-badge">AI Match</span>
                </div>
                <div className="sc-preview-body">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">{t("onboarding.selected_category_label")}</div>
                      <div className="text-sm opacity-70 mt-1">{schemeType === "loan" ? "Business / Working Capital" : schemeType === "subsidy" ? "Government Subsidy" : schemeType === "housing" ? "Housing Support" : "Education Support"}</div>
                    </div>
                    <div className="text-3xl">
                      {schemeType === "loan" ? "₹10.0L" : schemeType === "subsidy" ? "₹50.0K" : schemeType === "housing" ? "₹25.0L" : "₹12.0L"}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-3">
                    <div className="h-full rounded-full bg-em-alert transition-all duration-700" style={{ width: "86%" }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1.5">
                    <span>Approval chance</span>
                    <span>86%</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Step 1 */}
        <section className="onboarding-card tilt-card">
          <div className="onboarding-cat">
            <span className="onboarding-dot">02</span>
            <span className="onboarding-cat-title">Purpose</span>
          </div>
          <div className="onboarding-grid">
            {[
              { key: "startup", label: "New business setup", icon: "M12 2l2.9 6.2 6.8.9-5 4.7 1.3 6.7L12 17.8 6 20.5l1.3-6.7-5-4.7 6.8-.9z" },
              { key: "expansion", label: "Business expansion", icon: "M12 2l2.9 6.2 6.8.9-5 4.7 1.3 6.7L12 17.8 6 20.5l1.3-6.7-5-4.7 6.8-.9z" },
              { key: "working_capital", label: "Working capital", icon: "M12 2l2.9 6.2 6.8.9-5 4.7 1.3 6.7L12 17.8 6 20.5l1.3-6.7-5-4.7 6.8-.9z" },
              { key: "asset_purchase", label: "Asset purchase", icon: "M12 2l2.9 6.2 6.8.9-5 4.7 1.3 6.7L12 17.8 6 20.5l1.3-6.7-5-4.7 6.8-.9z" }
            ].map((item) => {
              const checked = purpose === item.key;
              return (
                <button key={item.key} className={`onboarding-option ${checked ? "selected" : ""}`} onClick={() => setPurpose(item.key)} type="button" aria-pressed={checked}>
                  <div className="onboarding-icon-ring em-alert">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d={item.icon} /></svg>
                  </div>
                  <span className="onboarding-option-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2 - amount */}
        <section className="onboarding-card tilt-card">
          <div className="onboarding-cat">
            <span className="onboarding-dot">03</span>
            <span className="onboarding-cat-title">Approximate Amount</span>
          </div>
          <div className="onboarding-range-wrap">
            <div className="onboarding-range">
              <span className="opacity-50 text-xs">₹10,000</span>
              <span className="opacity-50 text-xs">₹10,00,000</span>
            </div>
            <input type="range" min="10000" max="1000000" step="5000" value={amount ? Number(amount) : 50000} onChange={(e) => setAmount(e.target.value)} className="onboarding-range-input" />
            <div className="onboarding-amount-display">
              <span className="text-3xl font-semibold">₹{Number(amount || 50000).toLocaleString("en-IN")}</span>
              <span className="opacity-60 text-sm block mt-1">{amount && Number(amount) >= 100000 ? "Great for expansion loans" : "Typical for micro / working capital"}</span>
            </div>
          </div>
        </section>

        {/* Step 3 - geography */}
        <section className="onboarding-card tilt-card">
          <div className="onboarding-cat">
            <span className="onboarding-dot">04</span>
            <span className="onboarding-cat-title">Your State</span>
          </div>
          <div className="onboarding-grid">
            {[
              { key: "UP", label: "Uttar Pradesh" },
              { key: "WB", label: "West Bengal" },
              { key: "MH", label: "Maharashtra" },
              { key: "TN", label: "Tamil Nadu" }
            ].map((item) => {
              const sel = geography === item.key;
              return (
                <button key={item.key} className={`onboarding-option ${sel ? "selected" : ""}`} onClick={() => setGeography(item.key)} type="button" aria-pressed={sel}>
                  <span className="onboarding-option-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 4 - summary */}
        <section className="onboarding-card tilt-card text-center">
          <div className="onboarding-cat">
            <span className="onboarding-dot">05</span>
            <span className="onboarding-cat-title">Your Profile</span>
          </div>
          <div className="onboarding-summary-circle">
            <div className="onboarding-summary-card">
              <div className="text-xs tracking-widest uppercase opacity-60">User Profile</div>
              <div className="text-xl font-semibold mt-1">{schemeType === "loan" ? "Business / Working Capital" : schemeType === "subsidy" ? "Subsidy / Grant" : schemeType === "housing" ? "Housing" : "Education"}</div>
              <div className="text-4xl mt-2">{amount ? "₹" + Number(amount).toLocaleString("en-IN") : "₹50,000"}</div>
              <div className="text-sm opacity-70">Purpose: {purpose}</div>
              <div className="text-sm opacity-70">State: {geography}</div>
            </div>
          </div>
        </section>

        {submitted && (
          <div className="onboarding-thank-you">
            <div className="onboarding-thank-you-inner">
              <span className="onboarding-thank-you-icon">✓</span>
              <h2 className="text-2xl font-semibold">Finding your schemes…</h2>
              <p>Matching your profile against 21 government credit schemes.</p>
            </div>
          </div>
        )}
      </div>

      {/* Stepper */}
      <div className="onboarding-stepper" role="tablist" aria-label="Onboarding steps">
        {[0,1,2,3,4].map((n) => (
          <button key={n} className={`onboarding-stepper-dot ${step === n ? "active" : ""} ${n < step ? "done" : ""}`} onClick={() => setStep(n)} type="button" role="tab" aria-selected={step === n} aria-label={`Go to step ${n + 1}`}>
            <span>{n + 1}</span>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="onboarding-nav">
        {step === 0 ? (
          <button className="onboarding-btn-secondary" onClick={handleBack} type="button">Back</button>
        ) : (
          <button className="onboarding-btn-secondary" onClick={handleBack} type="button">Back</button>
        )}
        <button
          className="onboarding-btn-primary"
          onClick={isLast() ? handleSubmit : handleContinue}
          type="button"
        >
          {isLast() ? "Find My Schemes" : "Continue"}
        </button>
      </div>

      <style>{`
        .onboarding-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #0b1220 0%, #060a12 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }
        .onboarding-stage {
          position: relative;
          width: 100%;
          max-width: 640px;
          overflow: hidden;
          border-radius: 1.25rem;
        }
        .onboarding-slide {
          display: flex;
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .onboarding-card {
          width: 100%;
          padding: 1.5rem;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 1rem;
        }
        .onboarding-cat {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }
        .onboarding-dot {
          font-size: 0.7rem;
          padding: 0.2rem 0.6rem;
          background: rgba(255,255,255,0.1);
          border-radius: 999px;
          color: rgba(255,255,255,0.7);
        }
        .onboarding-cat-title {
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          color: rgba(255,255,255,0.8);
        }
        .onboarding-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .onboarding-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 0.75rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          color: rgba(255,255,255,0.85);
        }
        .onboarding-option:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.14);
        }
        .onboarding-option.selected {
          background: rgba(255,153,51,0.14);
          border-color: #ff9933;
          box-shadow: 0 0 0 1px rgba(255,153,51,0.2), 0 8px 24px -8px rgba(255,153,51,0.35);
        }
        .onboarding-icon-ring {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ff9933;
          box-shadow: 0 0 14px rgba(255,153,51,0.25);
        }
        .onboarding-option-label {
          font-size: 0.85rem;
          font-weight: 500;
        }
        .onboarding-option-desc {
          font-size: 0.7rem;
          opacity: 0.7;
        }
        .onboarding-range-wrap {
          margin-top: 0.5rem;
        }
        .onboarding-range {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .onboarding-range-input {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.12);
          border-radius: 999px;
          outline: none;
        }
        .onboarding-range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ff9933;
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(255,153,51,0.2);
        }
        .onboarding-amount-display {
          text-align: center;
          margin-top: 1rem;
        }
        .onboarding-summary-circle {
          margin: 1rem auto;
          width: 100%;
          max-width: 280px;
        }
        .onboarding-summary-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1rem;
          padding: 1.25rem;
          color: rgba(255,255,255,0.9);
        }
        .onboarding-stepper {
          display: flex;
          gap: 0.5rem;
          margin: 1.5rem 0;
        }
        .onboarding-stepper-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .onboarding-stepper-dot.active {
          background: #ff9933;
          border-color: #ff9933;
          color: white;
          box-shadow: 0 0 0 4px rgba(255,153,51,0.2);
        }
        .onboarding-stepper-dot.done {
          background: rgba(255,153,51,0.2);
          border-color: #ff9933;
          color: #ff9933;
        }
        .onboarding-nav {
          display: flex;
          justify-content: space-between;
          width: 100%;
          max-width: 640px;
          margin-top: 0.5rem;
        }
        .onboarding-btn-primary, .onboarding-btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        .onboarding-btn-primary {
          background: #ff9933;
          color: white;
          box-shadow: 0 0 0 1px rgba(255,153,51,0.3), 0 8px 24px -8px rgba(255,153,51,0.4);
        }
        .onboarding-btn-primary:hover {
          background: #ffaa44;
          transform: translateY(-1px);
        }
        .onboarding-btn-secondary {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .onboarding-btn-secondary:hover {
          background: rgba(255,255,255,0.12);
        }
        .onboarding-thank-you {
          position: absolute;
          inset: 0;
          background: rgba(6,10,18,0.92);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 1.25rem;
        }
        .onboarding-thank-you-inner {
          text-align: center;
          color: white;
        }
        .onboarding-thank-you-icon {
          display: inline-flex;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #ff9933;
          color: white;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 0 0 4px rgba(255,153,51,0.2);
        }

        /* Light theme overrides — light is the default experience. */
        html:not(.dark) .onboarding-page { background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); }
        html:not(.dark) .onboarding-card { background: rgba(255,255,255,0.92); border-color: rgba(15,23,42,0.08); box-shadow: 0 12px 32px -22px rgba(15,23,42,0.35); }
        html:not(.dark) .onboarding-dot { background: rgba(15,23,42,0.06); color: rgba(15,23,42,0.65); }
        html:not(.dark) .onboarding-cat-title { color: rgba(15,23,42,0.75); }
        html:not(.dark) .onboarding-option { background: #ffffff; border-color: rgba(15,23,42,0.08); color: #0f172a; }
        html:not(.dark) .onboarding-option:hover { background: #f8fafc; border-color: rgba(15,23,42,0.18); }
        html:not(.dark) .onboarding-option-desc { opacity: 0.65; }
        html:not(.dark) .onboarding-range-input { background: rgba(15,23,42,0.12); }
        html:not(.dark) .onboarding-summary-card { background: #ffffff; border-color: rgba(15,23,42,0.1); color: #1e293b; }
        html:not(.dark) .onboarding-stepper-dot { background: rgba(15,23,42,0.05); border-color: rgba(15,23,42,0.12); color: rgba(15,23,42,0.6); }
        html:not(.dark) .onboarding-btn-secondary { background: rgba(15,23,42,0.04); color: rgba(15,23,42,0.8); border-color: rgba(15,23,42,0.14); }
        html:not(.dark) .onboarding-btn-secondary:hover { background: rgba(15,23,42,0.08); }
        html:not(.dark) .onboarding-thank-you { background: rgba(255,255,255,0.94); }
        html:not(.dark) .onboarding-thank-you-inner { color: #0f172a; }
      `}</style>
    </div>
  );
}
