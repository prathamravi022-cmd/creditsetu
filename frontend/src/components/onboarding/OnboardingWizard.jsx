/**
 * Onboarding Wizard — 4 progressive steps with mandatory field validation.
 * Changes: DOB field (age 12-80), mandatory red asterisks, district dropdown,
 * disabled Next button, step percentage, estimated time, save & exit.
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../store/AuthContext';
import { cacheFormData, getCachedFormData, cacheSchemes } from '../../utils/offlineCache';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { STATE_DISTRICTS, INDIAN_STATES } from '../../data/stateDistricts';
import {
  ChevronRight, ChevronLeft, Languages, MapPin, Users,
  Wallet, Check, Mic, MicOff, Calendar, AlertCircle,
  Building2, TreePine, Save, Info, Clock, User
} from 'lucide-react';
import PageBackdrop from '../art/PageBackdrop';

const TOTAL_STEPS = 4;
const STEPS = [
  { key: 'step1', icon: User, color: 'bg-green-700' },
  { key: 'step2', icon: MapPin, color: 'bg-green-900' },
  { key: 'step3', icon: Users, color: 'bg-purple-600' },
  { key: 'step4', icon: Wallet, color: 'bg-orange-500' },
];

function calculateAge(dob) {
  if (!dob) return '';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatCurrency(val) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
}

export default function OnboardingWizard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const { transcript, startListening, stopListening } = useVoiceInput();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    language: 'en',
    gender: '',
    dob: '',
    age: '',
    state: 'Uttar Pradesh',
    district: '',
    pincode: '',
    location_type: 'rural',
    social_category: '',
    has_disability: false,
    disability_type: '',
    is_bpl: false,
    family_annual_income: '',
    loan_purpose: 'business',
    estimated_project_cost: 100000,
  });

  const availableDistricts = useMemo(() => {
    return form.state ? (STATE_DISTRICTS[form.state] || []) : [];
  }, [form.state]);

  useEffect(() => {
    getCachedFormData('onboarding').then((cached) => {
      if (cached) setForm((prev) => ({ ...prev, ...cached }));
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => cacheFormData('onboarding', form), 500);
    return () => clearTimeout(timer);
  }, [form]);

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const updateDob = useCallback((dob) => {
    const age = calculateAge(dob);
    setForm((prev) => ({ ...prev, dob, age: age.toString() }));
    setErrors((prev) => ({ ...prev, dob: '', age: '' }));
  }, []);

  const stepValid = useMemo(() => {
    if (step === 1) return !!(form.gender && form.dob && form.age && Number(form.age) >= 12 && Number(form.age) <= 80);
    if (step === 2) return !!(form.state && form.district && form.pincode && form.pincode.length === 6);
    if (step === 3) return !!form.social_category;
    if (step === 4) return !!(form.family_annual_income && Number(form.family_annual_income) > 0 && form.loan_purpose);
    return false;
  }, [step, form]);

  const validate = () => {
    const errs = {};
    if (step === 1) {
      if (!form.gender) errs.gender = 'Gender is required';
      if (!form.dob) errs.dob = 'Date of Birth is required';
      if (form.age && (Number(form.age) < 12 || Number(form.age) > 80)) errs.age = 'Age must be between 12 and 80';
    }
    if (step === 2) {
      if (!form.state) errs.state = 'State is required';
      if (!form.district) errs.district = 'District is required';
      if (!form.pincode || form.pincode.length !== 6) errs.pincode = 'Valid 6-digit pincode is required';
    }
    if (step === 3) {
      if (!form.social_category) errs.social_category = 'Social category is required';
    }
    if (step === 4) {
      if (!form.family_annual_income || Number(form.family_annual_income) <= 0) errs.family_annual_income = 'Annual income is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validate()) {
      toast.error('Please fill all required fields');
      return;
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
    else handleSubmit();
  };

  const prev = () => { if (step > 1) setStep(step - 1); };

  const handleSaveExit = () => {
    cacheFormData('onboarding', form);
    toast.success('Progress saved! You can continue later.');
    navigate('/');
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/schemes/recommend/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          social_category: form.social_category,
          family_annual_income: Number(form.family_annual_income),
          estimated_project_cost: Number(form.estimated_project_cost),
          loan_purpose: form.loan_purpose,
          is_bpl: form.is_bpl,
          state: form.state,
          district: form.district,
          location_type: form.location_type,
          age: Number(form.age),
          dob: form.dob,
          gender: form.gender,
        }),
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      sessionStorage.setItem('recommendations', JSON.stringify(data));
      sessionStorage.setItem('userForm', JSON.stringify(form));
      await cacheSchemes(data);
      toast.success(`Found ${data.count} matching schemes!`);
      navigate('/results');
    } catch {
      toast.success('Demo mode: Showing sample results');
      const mockData = getMockRecommendations();
      sessionStorage.setItem('recommendations', JSON.stringify(mockData));
      sessionStorage.setItem('userForm', JSON.stringify(form));
      await cacheSchemes(mockData);
      navigate('/results');
    }
    setLoading(false);
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser');
      return;
    }
    if (voiceEnabled) {
      stopListening();
      setVoiceEnabled(false);
      toast.success('Voice input disabled');
    } else {
      const lang = i18n.language === 'en' ? 'en-IN' : i18n.language + '-IN';
      startListening(lang);
      setVoiceEnabled(true);
      toast.success('Speak now... voice input enabled');
    }
  };

  useEffect(() => {
    if (voiceEnabled && transcript) {
      // Fill the name field when voice transcript comes in
      setForm(f => ({ ...f, name: transcript }));
    }
  }, [transcript, voiceEnabled]);

  const RequiredMark = () => <span className="text-red-500 ml-0.5">*</span>;

  const FieldError = ({ field }) => errors[field] ? (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" /> {errors[field]}
    </p>
  ) : null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative">
      <PageBackdrop variant="onboarding" />
      {/* Decorative corner glows */}
      <div aria-hidden="true" className="cs-orb cs-orb-green w-[360px] h-[360px] -top-32 -right-28 opacity-60" />
      <div aria-hidden="true" className="cs-orb cs-orb-saffron w-[320px] h-[320px] -bottom-32 -left-24 opacity-50" />
      <div className="w-full max-w-2xl">
        {/* Header with time estimate */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>{t("onboarding.header.step", {step, total: TOTAL_STEPS, mins: TOTAL_STEPS - step + 1})} — About {TOTAL_STEPS - step + 1} min left</span>
          </div>
          <button onClick={handleSaveExit} className="flex items-center gap-1 text-sm text-slate-500 hover:text-green-700 transition-colors">
            <Save className="w-4 h-4" /> {t("onboarding.save_exit")}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className={`flex items-center gap-1 text-xs font-medium ${step > i + 1 ? 'text-green-700' : step === i + 1 ? 'text-green-900' : 'text-slate-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${step > i + 1 ? 'bg-green-700 text-white' : step === i + 1 ? `${s.color} text-white` : 'bg-gray-200 text-slate-400'}`}>
                    {step > i + 1 ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="hidden sm:inline">{t(`onboarding.${s.key}.title`)}</span>
                </div>
              );
            })}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div className="h-full bg-green-700 rounded-full" initial={{ width: 0 }} animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
          <p className="text-xs text-slate-400 text-right mt-1">{t("onboarding.percent_complete", {pct: Math.round((step / TOTAL_STEPS) * 100)})}</p>
        </div>

        {/* Step Content */}
        <div className="glass-card rounded-2xl p-8 relative z-10">
          <h2 className="text-2xl font-bold text-green-900 mb-6">{t(`onboarding.step${step}.title`)}</h2>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>

              {/* STEP 1: Basics — DOB, Gender, Language */}
              {step === 1 && (
                <div className="space-y-5">

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('onboarding.step1.language')} <Info className="w-3 h-3 inline text-slate-400" title="Choose your preferred language for the form" />
                    </label>
                    <select value={form.language} onChange={(e) => update('language', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-700/20 outline-none">
                      <option value="en">English</option>
                      <option value="hi">हिंदी (Hindi)</option>
                      <option value="bn">বাংলা (Bengali)</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="te">తెలుగు (Telugu)</option>
                      <option value="mr">मराठी (Marathi)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('onboarding.step1.gender')}<RequiredMark />
                      </label>
                      <select value={form.gender} onChange={(e) => update('gender', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border focus:border-green-700 outline-none ${errors.gender ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                        <option value="">{t("onboarding.select_gender")}</option>
                        <option value="M">{t("onboarding.male")}</option>
                        <option value="F">{t("onboarding.female")}</option>
                        <option value="O">{t("onboarding.other")}</option>
                      </select>
                      <FieldError field="gender" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {t("onboarding.dob")}<RequiredMark />
                      </label>
                      <input type="date" value={form.dob} onChange={(e) => updateDob(e.target.value)}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 12)).toISOString().split('T')[0]}
                        min="1946-01-01"
                        className={`w-full px-4 py-3 rounded-xl border focus:border-green-700 outline-none ${errors.dob ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                      <FieldError field="dob" />
                    </div>
                  </div>

                  {form.age && (
                    <div className={`flex items-center gap-2 text-sm ${Number(form.age) >= 12 && Number(form.age) <= 80 ? 'text-green-700' : 'text-red-500'}`}>
                      {Number(form.age) >= 12 && Number(form.age) <= 80 ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {t("onboarding.you_are", {age: form.age})}
                      {Number(form.age) < 12 && ' ' + t('onboarding.min_age')}
                      {Number(form.age) > 80 && ' ' + t('onboarding.max_age')}
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {voiceEnabled ? <Mic className="w-5 h-5 text-green-700" /> : <MicOff className="w-5 h-5 text-slate-400" />}
                      <span className="text-sm font-medium text-slate-700">{t('onboarding.step1.voice_toggle')}</span>
                    </div>
                    <button onClick={toggleVoice}
                      className={`relative w-12 h-6 rounded-full transition-colors ${voiceEnabled ? 'bg-green-700' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Location — State, District (dropdown), Pincode */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('onboarding.step2.state')}<RequiredMark />
                    </label>
                    <select value={form.state} onChange={(e) => { update('state', e.target.value); update('district', ''); }}
                      className={`w-full px-4 py-3 rounded-xl border focus:border-green-700 outline-none ${errors.state ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                      <option value="">{t("onboarding.select_state")}</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <p className="text-xs text-slate-400 mt-1">{t("onboarding.districts_available", {count: availableDistricts.length})}</p>
                    <FieldError field="state" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('onboarding.step2.district')}<RequiredMark />
                    </label>
                    <select value={form.district} onChange={(e) => update('district', e.target.value)}
                      disabled={!form.state}
                      className={`w-full px-4 py-3 rounded-xl border focus:border-green-700 outline-none disabled:bg-gray-100 ${errors.district ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                      <option value="">{form.state ? t("onboarding.select_district") : t("onboarding.select_state_first")}</option>
                      {availableDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <FieldError field="district" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('onboarding.step2.pincode')}<RequiredMark />
                    </label>
                    <input type="text" value={form.pincode} onChange={(e) => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="e.g., 226001" maxLength={6}
                      className={`w-full px-4 py-3 rounded-xl border focus:border-green-700 outline-none font-mono ${errors.pincode ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                    {form.pincode && form.pincode.length === 6 && (
                      <p className="text-xs text-green-700 mt-1">📍 {t("onboarding.pincode_ok")}</p>
                    )}
                    <FieldError field="pincode" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      {t('onboarding.step2.location_type')}<RequiredMark />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'urban', label: t('onboarding.step2.urban'), icon: Building2 },
                        { value: 'rural', label: t('onboarding.step2.rural'), icon: TreePine },
                      ].map((opt) => (
                        <button key={opt.value} onClick={() => update('location_type', opt.value)}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-all ${form.location_type === opt.value ? 'border-green-700 bg-green-50 text-green-700' : 'border-gray-200 text-slate-600 hover:border-gray-300'}`}>
                          <opt.icon className="w-4 h-4" /> {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Social Category */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      {t('onboarding.step3.category')}<RequiredMark />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'general', label: t('onboarding.step3.general'), desc: 'General category' },
                        { value: 'obc', label: t('onboarding.step3.obc'), desc: 'OBC schemes available' },
                        { value: 'sc', label: t('onboarding.step3.sc'), desc: 'SC/ST schemes + MoSJE' },
                        { value: 'st', label: t('onboarding.step3.st'), desc: 'ST schemes + MoSJE' },
                      ].map((cat) => (
                        <button key={cat.value} onClick={() => update('social_category', cat.value)}
                          className={`py-3 px-4 rounded-xl border-2 text-left transition-all ${form.social_category === cat.value ? 'border-green-700 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <p className={`font-medium text-sm ${form.social_category === cat.value ? 'text-green-700' : 'text-slate-600'}`}>{cat.label}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{cat.desc}</p>
                        </button>
                      ))}
                    </div>
                    {errors.social_category && <FieldError field="social_category" />}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-slate-700">{t('onboarding.step3.disability')}</span>
                    <button onClick={() => update('has_disability', !form.has_disability)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${form.has_disability ? 'bg-green-700' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.has_disability ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {form.has_disability && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t('onboarding.step3.disability_type')}<RequiredMark /></label>
                      <select value={form.disability_type} onChange={(e) => update('disability_type', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-700 outline-none">
                        <option value="">{t("onboarding.select_type")}</option>
                        <option value="visual">{t("onboarding.visual")}</option>
                        <option value="hearing">{t("onboarding.hearing")}</option>
                        <option value="mobility">{t("onboarding.mobility")}</option>
                        <option value="mental">{t("onboarding.mental")}</option>
                        <option value="multiple">{t("onboarding.multiple")}</option>
                        <option value="other">{t("onboarding.step1.other")}</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Financial Intent */}
              {step === 4 && (
                <div className="space-y-5">
                  {/* Form Summary */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <p className="text-xs font-medium text-green-700 mb-2">{t("onboarding.profile_summary")}:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <span>👤 {form.gender === "M" ? t("onboarding.male") : form.gender === "F" ? t("onboarding.female") : t("onboarding.other")}, {form.age} yrs</span>
                      <span>📍 {form.district}, {form.state}</span>
                      <span>🏷️ {form.social_category.toUpperCase()}</span>
                      <span>🏘️ {form.location_type === "urban" ? t("onboarding.urban") : t("onboarding.rural")}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <span className="text-sm font-medium text-slate-700">{t('onboarding.step4.bpl')}</span>
                      <p className="text-xs text-slate-400">{t("onboarding.bpl_hint")}</p>
                    </div>
                    <button onClick={() => update('is_bpl', !form.is_bpl)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${form.is_bpl ? 'bg-green-700' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_bpl ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('onboarding.step4.income')}<RequiredMark />
                    </label>
                    <input type="number" value={form.family_annual_income}
                      onChange={(e) => update('family_annual_income', e.target.value)}
                      placeholder="e.g., 300000" min="0"
                      className={`w-full px-4 py-3 rounded-xl border focus:border-green-700 outline-none ${errors.family_annual_income ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                    {form.family_annual_income && (
                      <p className="text-xs mt-1">
                        <span className="text-slate-500">= {formatCurrency(Number(form.family_annual_income))} / year</span>
                        {Number(form.family_annual_income) <= 500000 && (
                          <span className="text-green-700 ml-2">{t('onboarding.eligible_mosje')}</span>
                        )}
                      </p>
                    )}
                    <FieldError field="family_annual_income" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      {t('onboarding.step4.purpose')}<RequiredMark />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'business', label: t('onboarding.step4.business'), desc: '{t("onboarding.business_loan")}' },
                        { value: 'education', label: t('onboarding.step4.education'), desc: '{t("onboarding.education_loan")}' },
                      ].map((opt) => (
                        <button key={opt.value} onClick={() => update('loan_purpose', opt.value)}
                          className={`py-3 rounded-xl border-2 font-medium transition-all ${form.loan_purpose === opt.value ? 'border-green-700 bg-green-50 text-green-700' : 'border-gray-200 text-slate-600 hover:border-gray-300'}`}>
                          <p>{opt.label}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('onboarding.step4.cost')}: <span className="text-green-700 font-bold">{formatCurrency(form.estimated_project_cost)}</span>
                    </label>
                    <input type="range" min={10000} max={5000000} step={10000} value={form.estimated_project_cost}
                      onChange={(e) => update('estimated_project_cost', Number(e.target.value))}
                      className="w-full accent-green-700" />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>₹10,000</span>
                      <span>₹50,00,000</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{t('onboarding.step4.cost_hint')}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button onClick={prev} disabled={step === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${step === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-gray-100'}`}>
              <ChevronLeft className="w-4 h-4" /> {t('onboarding.back')}
            </button>
            <button onClick={next} disabled={loading || !stepValid}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors ${loading || !stepValid ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-700 text-white hover:bg-green-800'}`}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : step === TOTAL_STEPS ? (
                <>{t('onboarding.submit')} <Check className="w-4 h-4" /></>
              ) : (
                <>{t('onboarding.next')} <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getMockRecommendations() {
  return {
    count: 3,
    recommendations: [
      { scheme_id: 'mock-1', scheme_code: 'NSFDC-MF-001', name: 'NSFDC Micro Finance Scheme', scheme_type: 'micro_finance', description: 'Small ticket loans for SC/ST entrepreneurs to start micro-enterprises.', amount_range: { min: 50000, max: 140000, display: '₹50,000 – ₹1,40,000' }, interest_rate: 6.5, subsidy_percentage: 5, margin_money_percentage: 5, tenure_range: { min_months: 12, max_months: 60 }, moratorium_months: 6, required_documents: ['Aadhaar Card', 'Caste Certificate (SC/ST)', 'Income Certificate', 'Bank Passbook', 'Passport Size Photo', 'Project Report'], approval_probability: 85, recommendation_label: 'Highly Recommended', live_url: 'https://www.myscheme.gov.in/scheme/nsfdc-micro-finance-scheme', ministry: 'Ministry of Social Justice & Empowerment' },
      { scheme_id: 'mock-2', scheme_code: 'MUDRA-PM-004', name: 'Pradhan Mantri MUDRA Yojana', scheme_type: 'micro_finance', description: 'Loans up to ₹10 lakh for non-farm income-generating activities.', amount_range: { min: 10000, max: 1000000, display: '₹10,000 – ₹10,00,000' }, interest_rate: 7.5, subsidy_percentage: 0, margin_money_percentage: 0, tenure_range: { min_months: 12, max_months: 60 }, moratorium_months: 0, required_documents: ['Aadhaar Card', 'PAN Card', 'Address Proof', 'Passport Size Photo', 'Project Report'], approval_probability: 72, recommendation_label: 'Recommended', live_url: 'https://www.myscheme.gov.in/scheme/pradhan-mantri-mudra-yojana-pmmy', ministry: 'Ministry of Finance' },
      { scheme_id: 'mock-3', scheme_code: 'NSFDC-TL-002', name: 'NSFDC Term Loan Scheme', scheme_type: 'term_loan', description: 'Larger loans for SC/ST entrepreneurs to set up medium-scale enterprises.', amount_range: { min: 140000, max: 5000000, display: '₹1,40,000 – ₹50,00,000' }, interest_rate: 8.0, subsidy_percentage: 10, margin_money_percentage: 10, tenure_range: { min_months: 12, max_months: 120 }, moratorium_months: 6, required_documents: ['Aadhaar Card', 'Caste Certificate', 'Income Certificate', 'DPR', 'Bank Passbook', 'Land Documents'], approval_probability: 45, recommendation_label: 'Possible Match', live_url: 'https://www.myscheme.gov.in/scheme/nsfdc-term-loan-scheme', ministry: 'Ministry of Social Justice & Empowerment' },
    ],
  };
}
