/**
 * Eligibility data layer.
 *
 * One async seam between the eligibility UI and wherever the profile actually
 * lives. Today that is the account-scoped local store plus the signed-in
 * identity we already hold (Firebase auth); when a real profile endpoint
 * exists, only the three functions below change — the flow never talks to
 * storage directly.
 *
 *   fetchEligibilityProfile(user)   → GET  /api/profile
 *   persistEligibilityProfile(...)  → PUT  /api/profile
 *   readDraft / writeDraft          → optimistic local draft
 *
 * Everything is shaped so the UI can show a skeleton while the "request" is in
 * flight, and the returned object always carries `existing` so the flow knows
 * whether to open on the review card (returning user) or question one.
 */
import {
  loadProfile,
  saveProfile,
  generateAndCache,
  normalizeProfile,
  scopedStorageKey,
} from './recommender';

// Small, deliberate delay so loading states are real states rather than a
// flicker. Swapping in a network call replaces this wholesale.
const FETCH_LATENCY_MS = 320;

export const DRAFT_KEY = 'creditsetu_eligibility_draft';

/** Draft answers are scoped per account, exactly like the saved profile. */
function draftKeyFor(user) {
  return scopedStorageKey(DRAFT_KEY, user);
}

/**
 * What we already know about this person without asking: their account
 * identity. Used to greet them and to show the review card as "your details".
 */
export function identityPrefill(user) {
  if (!user) return { name: '', email: '', phone: '' };
  return {
    name: user.name || user.displayName || '',
    email: user.email || '',
    phone: user.mobile || user.phone || '',
  };
}

/**
 * Loads the remembered details for this account.
 * Resolves with `{ profile, existing, identity }`; `profile` is null for a
 * first-time visitor.
 */
export async function fetchEligibilityProfile(user) {
  await new Promise((resolve) => setTimeout(resolve, FETCH_LATENCY_MS));
  const stored = loadProfile(user);
  return {
    profile: stored || null,
    existing: Boolean(stored),
    identity: identityPrefill(user),
  };
}

/** Answers typed so far, so a refresh never loses progress. */
export function readDraft(user) {
  try {
    const raw = localStorage.getItem(draftKeyFor(user));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeDraft(user, answers) {
  try {
    localStorage.setItem(draftKeyFor(user), JSON.stringify(answers));
  } catch {
    /* storage unavailable — the flow still works for this session */
  }
}

export function clearDraft(user) {
  try {
    localStorage.removeItem(draftKeyFor(user));
  } catch {
    /* ignore */
  }
}

/**
 * Saves the collected answers, ranks schemes against them, and returns the
 * normalised profile the recommender will use.
 *
 * Existing details we did not ask about again (district, pincode, BPL flag,
 * disability, date of birth) are carried forward rather than dropped.
 */
export async function persistEligibilityProfile(answers, user) {
  const previous = loadProfile(user) || {};
  const merged = { ...previous, ...answers };
  const profile = saveProfile(merged, user);
  generateAndCache(profile);
  clearDraft(user);
  return profile;
}

/** A quiet, human summary of the profile used by the review card. */
export function profileSummary(profile = {}) {
  const p = normalizeProfile(profile);
  const income = p.income;
  return [
    { key: 'occupation', label: 'Occupation', value: labelOf(OCCUPATION_LABELS, profile.occupation) },
    { key: 'age', label: 'Age', value: p.age ? `${p.age} years` : '' },
    { key: 'gender', label: 'Gender', value: labelOf(GENDER_LABELS, p.gender) },
    { key: 'social_category', label: 'Category', value: (p.socialCategory || '').toUpperCase() },
    { key: 'state', label: 'State', value: p.state || '' },
    { key: 'location_type', label: 'Area', value: p.locationType === 'urban' ? 'Urban' : 'Rural' },
    {
      key: 'family_annual_income',
      label: 'Annual family income',
      value: income === null || income === undefined ? '' : '₹' + Number(income).toLocaleString('en-IN'),
    },
    { key: 'education', label: profile.occupation === 'student' ? 'Studying' : 'Education', value: labelOf(EDUCATION_LABELS, profile.education) },
    { key: 'schemeType', label: 'Support needed', value: labelOf(SCHEME_TYPE_LABELS, profile.schemeType) },
    // Purpose only exists for business subsidy/loan intents — a student or a
    // housing applicant should never see a leftover business purpose here.
    {
      key: 'purpose',
      label: 'Purpose',
      value: ['loan', 'subsidy'].includes(profile.schemeType) ? labelOf(PURPOSE_LABELS, profile.purpose) : '',
    },
    {
      key: 'amount',
      label: 'Approximate amount',
      value: p.amount ? '₹' + Number(p.amount).toLocaleString('en-IN') : '',
    },
  ].filter((row) => row.value);
}

/* ---------- display labels (shared with the flow) ---------- */
export const OCCUPATION_LABELS = {
  student: 'Student',
  salaried: 'Salaried',
  business: 'Self-employed / Business',
  farmer: 'Farmer',
  artisan: 'Artisan / Homemaker',
  looking: 'Looking for work',
};

export const GENDER_LABELS = { F: 'Female', M: 'Male', O: 'Other' };

export const EDUCATION_LABELS = {
  school: 'School (up to Class 10)',
  higher_secondary: 'Class 11–12',
  iti: 'ITI / Diploma',
  graduate: 'Graduate',
  postgraduate: 'Postgraduate',
  professional: 'Professional degree',
  none: 'Not studying',
};

export const SCHEME_TYPE_LABELS = {
  loan: 'Business loan',
  subsidy: 'Subsidy / Grant',
  housing: 'Housing support',
  education: 'Education support',
};

export const PURPOSE_LABELS = {
  startup: 'New business setup',
  expansion: 'Business expansion',
  working_capital: 'Working capital',
  asset_purchase: 'Asset purchase',
};

function labelOf(map, value) {
  if (!value) return '';
  return map[value] || String(value);
}
