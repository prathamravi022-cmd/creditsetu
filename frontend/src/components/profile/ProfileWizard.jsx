import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Building2, BadgePercent, Home, GraduationCap, Rocket, TrendingUp, Wallet, Package,
  ArrowLeft, ArrowRight, CheckCircle2, User, MapPin, Users,
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import {
  saveProfile, loadProfile, generateAndCache, scopedStorageKey,
} from '../../services/recommender';
import { cacheFormData } from '../../utils/offlineCache';
import { STATE_DISTRICTS, INDIAN_STATES } from '../../data/stateDistricts';

/**
 * ProfileWizard — the single multi-step details form.
 *
 * Both entry points render this same component:
 *   mode="onboarding" → /get-started, first run
 *   mode="edit"       → /edit-profile, updating details later
 *
 * Steps slide horizontally, the top progress bar tracks position, and swiping
 * left/right moves between steps on touch. Everything is written to one profile
 * shape (see normalizeProfile) so the recommender only ever reads one model.
 */

const TOTAL = 7;

const CATEGORIES = [
  { key: 'loan', Icon: Building2, tKey: 'onboarding.business_loan', fallback: 'Business / Enterprise loan', desc: 'Business / working capital / micro finance' },
  { key: 'subsidy', Icon: BadgePercent, tKey: 'onboarding.subsidy', fallback: 'Subsidy / Grant', desc: 'Government subsidies & grants' },
  { key: 'housing', Icon: Home, tKey: 'onboarding.housing', fallback: 'Housing loan', desc: 'Housing & home loan support' },
  { key: 'education', Icon: GraduationCap, tKey: 'onboarding.education', fallback: 'Education', desc: 'Scholarships & education loans' },
];

const PURPOSES = [
  { key: 'startup', label: 'New business setup', Icon: Rocket },
  { key: 'expansion', label: 'Business expansion', Icon: TrendingUp },
  { key: 'working_capital', label: 'Working capital', Icon: Wallet },
  { key: 'asset_purchase', label: 'Asset purchase', Icon: Package },
];

const GENDERS = [
  { key: 'M', label: 'Male' },
  { key: 'F', label: 'Female' },
  { key: 'O', label: 'Other' },
];

const SOCIAL = [
  { key: 'general', label: 'General' },
  { key: 'obc', label: 'OBC' },
  { key: 'sc', label: 'SC' },
  { key: 'st', label: 'ST' },
];

const STEP_TITLES = [
  'Scheme Category',
  'Purpose',
  'Approximate Amount',
  'Personal Details',
  'Your Location',
  'Background & Income',
  'Review',
];

const EMPTY = {
  schemeType: '',
  purpose: '',
  amount: '50000',
  gender: '',
  dob: '',
  state: '',
  district: '',
  pincode: '',
  location_type: 'rural',
  social_category: '',
  family_annual_income: '',
  is_bpl: false,
  has_disability: false,
};

function calculateAge(dob) {
  if (!dob) return '';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 && age < 120 ? String(age) : '';
}

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function ProfileWizard({ mode = 'onboarding' }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const touchStart = useRef(null);
  const formCacheKey = scopedStorageKey('onboarding', user);

  // Prefill from this account's remembered details so a returning user only
  // ever sees what we already know about them.
  useEffect(() => {
    const stored = loadProfile(user);
    if (!stored) return;
    setForm((prev) => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(stored).filter(([k, v]) => k in EMPTY && v !== undefined && v !== null && v !== '')
      ),
      amount: stored.amount ? String(stored.amount) : prev.amount,
      family_annual_income:
        stored.family_annual_income ?? stored.income ?? prev.family_annual_income,
      district: stored.district || prev.district,
    }));
  }, [user?.email, user?.phone]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const districts = useMemo(
    () => (form.state ? STATE_DISTRICTS[form.state] || [] : []),
    [form.state]
  );

  const age = calculateAge(form.dob);

  const validate = (index) => {
    if (index === 0 && !form.schemeType) return 'Choose a scheme category to continue';
    if (index === 1 && !form.purpose) return 'Choose what the funding is for';
    if (index === 2 && (!form.amount || Number(form.amount) <= 0)) return 'Enter a valid amount';
    if (index === 3 && !form.gender) return 'Select your gender';
    if (index === 3 && !form.dob) return 'Enter your date of birth';
    if (index === 3 && age === '') return 'That date of birth does not look valid';
    if (index === 4 && !form.state) return 'Select your state';
    if (index === 4 && !form.district) return 'Select your district';
    if (index === 4 && !/^[0-9]{6}$/.test(form.pincode)) return 'Enter a valid 6-digit pincode';
    if (index === 5 && !form.social_category) return 'Select your social category';
    if (index === 5 && !(Number(form.family_annual_income) > 0)) return 'Enter your annual family income';
    return null;
  };

  const goNext = () => {
    const err = validate(step);
    if (err) {
      setError(err);
      toast.error(err);
      return;
    }
    setError('');
    setStep((s) => Math.min(s + 1, TOTAL - 1));
  };

  const goBack = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = () => {
    for (let i = 0; i < TOTAL - 1; i += 1) {
      const err = validate(i);
      if (err) {
        setError(err);
        setStep(i);
        toast.error(err);
        return;
      }
    }

    const profile = {
      ...form,
      amount: Number(form.amount) || 50000,
      age,
      // Kept so the recommender's older fallbacks still resolve correctly.
      geography: form.state,
      loan_purpose: form.schemeType === 'education' ? 'education' : 'business',
    };

    saveProfile(profile, user);
    const normalised = loadProfile(user) || profile;
    generateAndCache(normalised);
    cacheFormData(formCacheKey, profile);

    setSaved(true);
    toast.success(
      mode === 'edit' ? 'Profile updated — schemes refreshed!' : 'Profile saved — here are your matched schemes'
    );
    setTimeout(() => navigate('/results'), 900);
  };

  /* ---- swipe between steps -------------------------------------- */
  const onTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    // Ignore mostly-vertical gestures so normal scrolling still works.
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) goNext();
    else goBack();
  };

  const backLabel = mode === 'edit' ? 'Cancel' : 'Back';
  const isLast = step === TOTAL - 1;

  return (
    <div className="wz-page">
      <div className="wz-shell">
        <button
          type="button"
          onClick={() => navigate(mode === 'edit' ? '/results' : '/')}
          className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </button>

        {/* Progress */}
        <div className="wz-progress-head">
          <span className="wz-step-label">{STEP_TITLES[step]}</span>
          <span className="wz-step-count">
            Step {step + 1} of {TOTAL}
          </span>
        </div>
        <div
          className="wz-progress"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-valuenow={step + 1}
          aria-label="Profile completion"
        >
          <div className="wz-progress-fill" style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
        </div>

        {/* Slides */}
        <div className="wz-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="wz-slide" style={{ transform: `translateX(-${step * 100}%)` }}>
            {/* 0 — category */}
            <section className="wz-step" aria-hidden={step !== 0}>
              <div className="wz-card">
                <div className="wz-cat">
                  <span>
                    <span className="wz-cat-title">Scheme Category</span>
                    <span className="wz-cat-hint">What kind of support are you looking for?</span>
                  </span>
                </div>
                <div className="wz-grid">
                  {CATEGORIES.map(({ key, Icon, tKey, fallback, desc }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set('schemeType', key)}
                      aria-pressed={form.schemeType === key}
                      className={`wz-option ${form.schemeType === key ? 'selected' : ''}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      <span className="wz-option-label">{t(tKey) || fallback}</span>
                      <span className="wz-option-desc">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 1 — purpose */}
            <section className="wz-step" aria-hidden={step !== 1}>
              <div className="wz-card">
                <div className="wz-cat">
                  <span>
                    <span className="wz-cat-title">Purpose</span>
                    <span className="wz-cat-hint">How will the funds be used?</span>
                  </span>
                </div>
                <div className="wz-grid">
                  {PURPOSES.map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set('purpose', key)}
                      aria-pressed={form.purpose === key}
                      className={`wz-option ${form.purpose === key ? 'selected' : ''}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      <span className="wz-option-label">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 2 — amount */}
            <section className="wz-step" aria-hidden={step !== 2}>
              <div className="wz-card">
                <div className="wz-cat">
                  <span>
                    <span className="wz-cat-title">Approximate Amount</span>
                    <span className="wz-cat-hint">Slide to set what you need</span>
                  </span>
                </div>
                <div className="wz-range-head">
                  <span>₹10,000</span>
                  <span>₹10,00,000</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="5000"
                  value={Number(form.amount) || 50000}
                  onChange={(e) => set('amount', e.target.value)}
                  className="wz-range-input"
                  aria-label="Approximate amount"
                />
                <div className="wz-amount-display">
                  <span className="text-3xl font-semibold text-slate-900 dark:text-white">
                    {inr(form.amount || 50000)}
                  </span>
                  <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                    {Number(form.amount) >= 100000
                      ? 'Typical for expansion loans'
                      : 'Typical for micro / working capital'}
                  </span>
                </div>
              </div>
            </section>

            {/* 3 — personal */}
            <section className="wz-step" aria-hidden={step !== 3}>
              <div className="wz-card">
                <div className="wz-cat">
                  <User className="h-5 w-5 text-[#138808] dark:text-[#34d399]" aria-hidden="true" />
                  <span>
                    <span className="wz-cat-title">Personal Details</span>
                    <span className="wz-cat-hint">Used to check age-based eligibility</span>
                  </span>
                </div>
                <div className="wz-fields">
                  <div>
                    <span className="wz-label">Gender</span>
                    <div className="wz-chips">
                      {GENDERS.map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => set('gender', key)}
                          aria-pressed={form.gender === key}
                          className={`wz-chip ${form.gender === key ? 'selected' : ''}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`field-float ${form.dob ? 'is-filled' : ''}`}>
                    <input
                      id="wz-dob"
                      type="date"
                      inputMode="numeric"
                      max={new Date().toISOString().slice(0, 10)}
                      value={form.dob}
                      onChange={(e) => set('dob', e.target.value)}
                      className="field-float__input"
                      placeholder=" "
                    />
                    <label htmlFor="wz-dob" className="field-float__label">
                      Date of Birth
                    </label>
                  </div>
                  {age !== '' && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Age: <strong className="text-slate-700 dark:text-slate-200">{age} years</strong>
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* 4 — location */}
            <section className="wz-step" aria-hidden={step !== 4}>
              <div className="wz-card">
                <div className="wz-cat">
                  <MapPin className="h-5 w-5 text-[#138808] dark:text-[#34d399]" aria-hidden="true" />
                  <span>
                    <span className="wz-cat-title">Your Location</span>
                    <span className="wz-cat-hint">Some schemes are state-specific</span>
                  </span>
                </div>
                <div className="wz-fields">
                  <div>
                    <label className="wz-label" htmlFor="wz-state">State</label>
                    <select
                      id="wz-state"
                      className="wz-select"
                      value={form.state}
                      onChange={(e) => {
                        set('state', e.target.value);
                        set('district', '');
                      }}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="wz-label" htmlFor="wz-district">District</label>
                    <select
                      id="wz-district"
                      className="wz-select"
                      value={form.district}
                      onChange={(e) => set('district', e.target.value)}
                      disabled={!form.state}
                    >
                      <option value="">Select District</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Numeric keypad for the pincode */}
                  <div className={`field-float ${form.pincode ? 'is-filled' : ''}`}>
                    <input
                      id="wz-pincode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoComplete="postal-code"
                      value={form.pincode}
                      onChange={(e) => set('pincode', e.target.value.replace(/[^0-9]/g, ''))}
                      className="field-float__input"
                      placeholder=" "
                    />
                    <label htmlFor="wz-pincode" className="field-float__label">
                      Pincode
                    </label>
                  </div>

                  <div>
                    <span className="wz-label">Area Type</span>
                    <div className="wz-chips">
                      {[['rural', 'Rural'], ['urban', 'Urban']].map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => set('location_type', key)}
                          aria-pressed={form.location_type === key}
                          className={`wz-chip ${form.location_type === key ? 'selected' : ''}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5 — background & income */}
            <section className="wz-step" aria-hidden={step !== 5}>
              <div className="wz-card">
                <div className="wz-cat">
                  <Users className="h-5 w-5 text-[#138808] dark:text-[#34d399]" aria-hidden="true" />
                  <span>
                    <span className="wz-cat-title">Background &amp; Income</span>
                    <span className="wz-cat-hint">Several schemes are reserved by category</span>
                  </span>
                </div>
                <div className="wz-fields">
                  <div>
                    <span className="wz-label">Social Category</span>
                    <div className="wz-chips">
                      {SOCIAL.map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => set('social_category', key)}
                          aria-pressed={form.social_category === key}
                          className={`wz-chip ${form.social_category === key ? 'selected' : ''}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Numeric keypad for the income */}
                  <div className={`field-float ${form.family_annual_income ? 'is-filled' : ''}`}>
                    <input
                      id="wz-income"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      value={form.family_annual_income}
                      onChange={(e) =>
                        set('family_annual_income', e.target.value.replace(/[^0-9]/g, ''))
                      }
                      className="field-float__input"
                      placeholder=" "
                    />
                    <label htmlFor="wz-income" className="field-float__label">
                      Family Annual Income (₹)
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      ['is_bpl', 'Below Poverty Line (BPL)'],
                      ['has_disability', 'Person with Disability'],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => set(key, !form[key])}
                        aria-pressed={form[key]}
                        className={`wz-chip ${form[key] ? 'selected' : ''}`}
                      >
                        {form[key] ? '✓ ' : ''}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 6 — review */}
            <section className="wz-step" aria-hidden={step !== 6}>
              <div className="wz-card">
                <div className="wz-cat">
                  <CheckCircle2 className="h-5 w-5 text-[#138808] dark:text-[#34d399]" aria-hidden="true" />
                  <span>
                    <span className="wz-cat-title">Review</span>
                    <span className="wz-cat-hint">Check everything before we rank your schemes</span>
                  </span>
                </div>
                <dl className="wz-review">
                  {[
                    ['Category', CATEGORIES.find((c) => c.key === form.schemeType)?.fallback || '—'],
                    ['Purpose', PURPOSES.find((p) => p.key === form.purpose)?.label || '—'],
                    ['Amount', inr(form.amount || 50000)],
                    ['Gender', GENDERS.find((g) => g.key === form.gender)?.label || '—'],
                    ['Date of Birth', form.dob || '—'],
                    ['State', form.state || '—'],
                    ['District', form.district || '—'],
                    ['Pincode', form.pincode || '—'],
                    ['Area', form.location_type === 'urban' ? 'Urban' : 'Rural'],
                    ['Social Category', SOCIAL.find((s) => s.key === form.social_category)?.label || '—'],
                    ['Annual Income', form.family_annual_income ? inr(form.family_annual_income) : '—'],
                  ].map(([label, value]) => (
                    <div className="wz-review-row" key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          </div>

          {saved && (
            <div className="wz-saved">
              <div className="wz-saved-inner">
                <span className="wz-saved-icon">✓</span>
                <h2 className="text-xl font-semibold">Finding your schemes…</h2>
                <p className="mt-1 text-sm opacity-70">
                  Matching your profile against 21 government credit schemes.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop / tablet navigation */}
        <div className="wz-nav">
          <button
            type="button"
            className="wz-btn wz-btn-secondary"
            onClick={step === 0 ? () => navigate(mode === 'edit' ? '/results' : '/') : goBack}
          >
            {step === 0 ? backLabel : 'Back'}
          </button>
          <button
            type="button"
            className="wz-btn wz-btn-primary"
            onClick={isLast ? handleSubmit : goNext}
          >
            {isLast ? (mode === 'edit' ? 'Save & Update Results' : 'Find My Schemes') : 'Continue'}
          </button>
        </div>

        {error && <p className="wz-error mt-2 text-center">{error}</p>}
        <p className="wz-swipe-hint">Swipe left or right to move between steps</p>
      </div>

      {/* Mobile sticky action bar, pinned to the bottom edge */}
      <div className="wz-sticky">
        <div className="mx-auto max-w-sm px-3">
          <div className="flex items-center gap-2 rounded-2xl border border-gray-200/80 bg-white/92 p-2 shadow-[0_18px_44px_-18px_rgba(15,36,64,0.5)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1b1b1d]/92">
            <button
              type="button"
              onClick={step === 0 ? () => navigate(mode === 'edit' ? '/results' : '/') : goBack}
              className="wz-btn wz-btn-secondary tap-spring flex-1"
            >
              {step === 0 ? backLabel : 'Back'}
            </button>
            <button
              type="button"
              onClick={isLast ? handleSubmit : goNext}
              className="wz-btn wz-btn-primary tap-spring flex-[1.4] whitespace-nowrap"
            >
              {isLast ? (
                <>
                  {mode === 'edit' ? 'Save' : 'Find Schemes'} <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
