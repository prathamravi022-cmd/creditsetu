/**
 * Recommender + profile store.
 *
 * One shared place that turns a user's onboarding/edited profile into a ranked
 * list of eligible government schemes. Used by the onboarding wizard, the
 * Edit Profile page and the Results (Schemes) page so all three stay in sync.
 */
import SCHEMES_JSON from './schemesData.json';

const ALL_SCHEMES = Array.isArray(SCHEMES_JSON) ? SCHEMES_JSON : SCHEMES_JSON.schemes || [];

export const PROFILE_KEY = 'creditsetu_profile';
// Per-account caches are stored as `<base>::<account>`, so a shared device still
// remembers each user's own details without them overwriting each other.
const SCOPE_SEPARATOR = '::';
export const RESULTS_KEY = 'recommendations';

/* ---------- state name <-> code so 'UP' and 'Uttar Pradesh' both match ---------- */
const CODE_TO_NAME = {
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CG: 'Chhattisgarh',
  CT: 'Chhattisgarh',
  GA: 'Goa',
  GJ: 'Gujarat',
  HR: 'Haryana',
  HP: 'Himachal Pradesh',
  JH: 'Jharkhand',
  KA: 'Karnataka',
  KL: 'Kerala',
  MP: 'Madhya Pradesh',
  MH: 'Maharashtra',
  MN: 'Manipur',
  ML: 'Meghalaya',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OD: 'Odisha',
  OR: 'Odisha',
  PB: 'Punjab',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TN: 'Tamil Nadu',
  TG: 'Telangana',
  TS: 'Telangana',
  TR: 'Tripura',
  UP: 'Uttar Pradesh',
  UK: 'Uttarakhand',
  UA: 'Uttarakhand',
  WB: 'West Bengal',
  DL: 'Delhi',
  JK: 'Jammu and Kashmir',
  HP_UT: 'Himachal Pradesh',
};

const NAME_TO_CODE = Object.entries(CODE_TO_NAME).reduce((acc, [code, name]) => {
  if (!acc[name]) acc[name] = code;
  return acc;
}, {});

function stateVariants(value) {
  if (!value) return [];
  const raw = String(value).trim();
  const variants = new Set([raw.toLowerCase()]);
  const byName = NAME_TO_CODE[raw];
  if (byName) variants.add(byName.toLowerCase());
  const byCode = CODE_TO_NAME[raw.toUpperCase()];
  if (byCode) variants.add(byCode.toLowerCase());
  return [...variants];
}

function statesMatch(userState, schemeStates) {
  if (!schemeStates || schemeStates.length === 0) return true;
  if (!userState) return true; // unknown → don't exclude
  const mine = stateVariants(userState);
  return schemeStates.some((s) => stateVariants(s).some((v) => mine.includes(v)));
}

/* ---------- profile normalisation ---------- */
/** Maps the wizard's light profile AND the edit-profile's rich form into one shape. */
export function normalizeProfile(raw = {}) {
  const wizardType = raw.schemeType || '';
  const purpose = raw.purpose || '';
  const loanPurpose = raw.loan_purpose || '';

  let intent = 'business';
  if (wizardType === 'education' || loanPurpose === 'education') intent = 'education';
  else if (wizardType === 'housing') intent = 'housing';
  else if (wizardType === 'subsidy') intent = 'subsidy';
  else if (wizardType === 'loan' || loanPurpose === 'business') intent = 'business';

  const incomeRaw = raw.family_annual_income ?? raw.income;
  const amountRaw = raw.amount ?? raw.estimated_project_cost;

  return {
    schemeType: wizardType || (intent === 'education' ? 'education' : intent === 'housing' ? 'housing' : 'loan'),
    purpose: purpose || loanPurpose || 'startup',
    amount: Number(amountRaw) || 50000,
    state: raw.state || raw.geography || '',
    socialCategory: (raw.social_category || raw.category || 'general').toLowerCase(),
    income: incomeRaw === '' || incomeRaw === undefined ? null : Number(incomeRaw),
    isBpl: Boolean(raw.is_bpl ?? raw.bpl),
    hasDisability: Boolean(raw.has_disability ?? raw.disability),
    locationType: raw.location_type || 'rural',
    age: Number(raw.age) || null,
    gender: raw.gender || '',
    intent,
  };
}

/**
 * Scopes an storage key to the signed-in account (email / phone / uid) so two
 * people sharing one device don't overwrite each other's details. Anonymous
 * visits share the single device-level slot.
 */
export function scopedStorageKey(base, user) {
  if (!user) return base;
  const id = user.email || user.phone || user.uid || user.id;
  return id ? `${base}${SCOPE_SEPARATOR}${String(id).trim().toLowerCase()}` : base;
}

/** Cache key for this user's own details. */
export function profileKeyFor(user) {
  return scopedStorageKey(PROFILE_KEY, user);
}

function readProfileAt(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Saves the profile. Always mirrors into the device cache so anonymous reads keep
 * working, and additionally into this account's own slot when we know who it is.
 */
export function saveProfile(raw, user) {
  const profile = normalizeProfile(raw);
  const payload = JSON.stringify({ ...raw, ...profile, updatedAt: new Date().toISOString() });
  try {
    localStorage.setItem(PROFILE_KEY, payload);
    const scopedKey = profileKeyFor(user);
    if (scopedKey !== PROFILE_KEY) localStorage.setItem(scopedKey, payload);
  } catch {
    /* storage may be unavailable — recommendations still work for this session */
  }
  return profile;
}

/**
 * Reads the remembered details: this account's own cache first, then the device
 * cache as a fallback so a returning visitor is never asked to refill the form.
 */
export function loadProfile(user) {
  return readProfileAt(profileKeyFor(user)) || readProfileAt(PROFILE_KEY);
}

export function hasProfile(user) {
  return Boolean(loadProfile(user));
}

export function clearProfile(user) {
  try {
    localStorage.removeItem(profileKeyFor(user));
    localStorage.removeItem(PROFILE_KEY);
    sessionStorage.removeItem(RESULTS_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Where a profile-driven CTA should send this user:
 * returning users (details already saved) go straight to their Schemes page,
 * first-time users land on the details form.
 */
export function eligibilityTarget(user) {
  return hasProfile(user) ? '/results' : '/get-started';
}

/* ---------- scoring ---------- */
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

function labelFor(p) {
  if (p >= 80) return 'Highly Recommended';
  if (p >= 60) return 'Recommended';
  if (p >= 40) return 'Possible Match';
  return 'Low Match';
}

function scoreScheme(scheme, profile) {
  const rules = scheme.eligibility_rules || {};
  const categories = rules.categories || [];
  const states = rules.states || [];
  const purposes = rules.loan_purpose || [];

  // Hard eligibility gates — where the scheme is explicit and the user is known.
  const categoryOk =
    categories.length === 0 || !profile.socialCategory || categories.includes(profile.socialCategory);
  if (!categoryOk) return null;

  const stateOk = statesMatch(profile.state, states);
  if (!stateOk) return null;

  const wantsEducation = profile.intent === 'education';
  const purposeOk =
    purposes.length === 0 ||
    purposes.includes(wantsEducation ? 'education' : 'business') ||
    (profile.intent === 'housing' && scheme.scheme_type === 'housing_loan');
  if (!purposeOk) return null;

  let score = 0;

  // Income fit (30)
  const maxIncome = Number(rules.max_income) || 600000;
  if (profile.income === null) score += 20;
  else if (profile.income <= maxIncome) score += 30;
  else score += Math.max(0, Math.round(30 - ((profile.income - maxIncome) / maxIncome) * 40));

  // Social category scarcity (25)
  if (categories.length === 0) score += 22;
  else score += 25;

  // Location (20)
  if (states.length === 0) score += 18;
  else score += 20;

  // Purpose alignment (15)
  if (purposes.length === 0) score += 12;
  else score += 15;

  // Amount within the scheme's band (10)
  const min = Number(scheme.min_amount) || 0;
  const max = Number(scheme.max_amount) || 0;
  if (profile.amount >= min && profile.amount <= max) score += 10;
  else if (profile.amount < min) score += 4;
  else score += profile.amount <= max * 1.5 ? 8 : 2;

  // BPL / disability support programmes (5)
  if ((profile.isBpl && rules.prefer_bpl) || (profile.hasDisability && rules.prefer_disability)) score += 5;
  else score += 2;

  const probability = Math.max(20, Math.min(96, score));

  return {
    scheme_id: scheme.scheme_code,
    scheme_code: scheme.scheme_code,
    name: scheme.name,
    description: scheme.description,
    recommendation_label: labelFor(probability),
    approval_probability: probability,
    amount_range: {
      min: min,
      max: max,
      display: `${inr(min)} – ${inr(max)}`,
    },
    interest_rate: scheme.interest_rate,
    tenure_range: {
      min_months: Number(scheme.min_tenure_months) || 12,
      max_months: Number(scheme.max_tenure_months) || 60,
    },
    moratorium_months: Number(scheme.moratorium_months) || 0,
    subsidy_percentage: Number(scheme.subsidy_percentage) || 0,
    required_documents: scheme.required_documents || [],
    source: 'local',
    live_url: scheme.live_url || '',
    ministry: scheme.ministry || 'Ministry of Social Justice',
  };
}

/** Rank every scheme against a profile and return the object the Results page expects. */
export function buildRecommendations(rawProfile) {
  const profile = normalizeProfile(rawProfile);
  const ranked = ALL_SCHEMES.map((s) => scoreScheme(s, profile))
    .filter(Boolean)
    .sort((a, b) => b.approval_probability - a.approval_probability);

  const top = ranked.slice(0, 8);

  return {
    count: top.length,
    total_considered: ALL_SCHEMES.length,
    profile,
    generated_at: new Date().toISOString(),
    recommendations: top,
  };
}

/** Build, store for the Results page, and return the recommendations. */
export function generateAndCache(rawProfile) {
  const results = buildRecommendations(rawProfile);
  try {
    sessionStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  } catch {
    /* ignore */
  }
  return results;
}
