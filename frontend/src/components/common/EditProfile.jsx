/**
 * Edit Profile page — allows users to update their onboarding data.
 * Changes saved → can re-run recommender for updated results.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../../store/AuthContext';
import { getCachedFormData, cacheFormData } from '../../utils/offlineCache';
import { STATE_DISTRICTS, INDIAN_STATES } from '../../data/stateDistricts';
import { User, MapPin, Users, Wallet, Save, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import PageBackdrop from '../art/PageBackdrop';

function calculateAge(dob) {
  if (!dob) return '';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatCurrency(val) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
}

export default function EditProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    gender: '', dob: '', age: '', state: 'Uttar Pradesh', district: '',
    pincode: '', location_type: 'rural', social_category: '',
    has_disability: false, disability_type: '', is_bpl: false,
    family_annual_income: '', loan_purpose: 'business', estimated_project_cost: 100000,
  });

  const availableDistricts = useMemo(() => form.state ? (STATE_DISTRICTS[form.state] || []) : [], [form.state]);
  const totalFields = 10;
  const filledFields = [form.gender, form.dob, form.state, form.district, form.pincode, form.social_category, form.family_annual_income, form.loan_purpose, form.age, form.location_type].filter(Boolean).length;
  const completionPct = Math.round((filledFields / totalFields) * 100);

  useEffect(() => {
    getCachedFormData('onboarding').then((cached) => {
      if (cached) setForm((prev) => ({ ...prev, ...cached }));
    });
  }, []);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const updateDob = (dob) => {
    const age = calculateAge(dob);
    setForm((prev) => ({ ...prev, dob, age: age.toString() }));
  };

  const handleSave = () => {
    cacheFormData('onboarding', form);
    toast.success('Profile updated successfully!');
    navigate('/results');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 relative">
      <PageBackdrop variant="profile" />
      <button onClick={() => navigate(-1)} className="relative z-10 flex items-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-green-900">Edit Profile</h1>
            <p className="text-sm text-slate-500">Update your details to get better scheme recommendations</p>
          </div>
        </div>

        {/* Completion Status */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Profile Completion</span>
            <span className={`text-sm font-bold ${completionPct >= 80 ? 'text-green-700' : 'text-orange-500'}`}>{completionPct}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-700 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        <div className="space-y-5">
          {/* Personal */}
          <div>
            <h3 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-700 outline-none">
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                <input type="date" value={form.dob} onChange={(e) => updateDob(e.target.value)}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 12)).toISOString().split('T')[0]} min="1946-01-01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-700 outline-none" />
                {form.age && <p className="text-xs text-green-700 mt-1">Age: {form.age} years</p>}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
                <select value={form.state} onChange={(e) => { update('state', e.target.value); update('district', ''); }} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-700 outline-none">
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">District *</label>
                <select value={form.district} onChange={(e) => update('district', e.target.value)} disabled={!form.state}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-700 outline-none disabled:bg-gray-100">
                  <option value="">Select District</option>
                  {availableDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Pincode *</label>
              <input type="text" value={form.pincode} onChange={(e) => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-700 outline-none font-mono" />
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Social Category</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ value: 'general', label: 'General' }, { value: 'obc', label: 'OBC' }, { value: 'sc', label: 'SC' }, { value: 'st', label: 'ST' }].map((cat) => (
                <button key={cat.value} onClick={() => update('social_category', cat.value)}
                  className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${form.social_category === cat.value ? 'border-green-700 bg-green-50 text-green-700' : 'border-gray-200 text-slate-600'}`}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Financial */}
          <div>
            <h3 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2"><Wallet className="w-4 h-4" /> Financial Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-slate-700">Below Poverty Line (BPL)</span>
                <button onClick={() => update('is_bpl', !form.is_bpl)} className={`relative w-12 h-6 rounded-full transition-colors ${form.is_bpl ? 'bg-green-700' : 'bg-slate-300'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_bpl ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Family Annual Income *</label>
                <input type="number" value={form.family_annual_income} onChange={(e) => update('family_annual_income', e.target.value)} placeholder="e.g., 300000" min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-700 outline-none" />
                {form.family_annual_income && <p className="text-xs text-slate-500 mt-1">= {formatCurrency(Number(form.family_annual_income))}/year {Number(form.family_annual_income) <= 500000 && <span className="text-green-700">✅ MoSJE eligible</span>}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => update('loan_purpose', 'business')} className={`py-2.5 rounded-xl border-2 text-sm font-medium ${form.loan_purpose === 'business' ? 'border-green-700 bg-green-50 text-green-700' : 'border-gray-200 text-slate-600'}`}>Business</button>
                <button onClick={() => update('loan_purpose', 'education')} className={`py-2.5 rounded-xl border-2 text-sm font-medium ${form.loan_purpose === 'education' ? 'border-green-700 bg-green-50 text-green-700' : 'border-gray-200 text-slate-600'}`}>Education</button>
              </div>
            </div>
          </div>

          <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors">
            <Save className="w-4 h-4" /> Save Profile & Update Results
          </button>
        </div>
      </div>
    </div>
  );
}
