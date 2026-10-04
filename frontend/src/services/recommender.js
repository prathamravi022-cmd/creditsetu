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

/** Gender arrives as 'F', 'female', 'M' … from different forms — settle on one code. */
function normalizeGender(value) {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'f' || v === 'female' || v === 'woman') return 'F';
  if (v === 'm' || v === 'male' || v === 'man') return 'M';
  return v ? 'O' : '';
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
  // Already-normalised profiles arrive in camelCase (saveProfile returns one),
  // so every field is read in both spellings — otherwise re-normalising a saved
  // profile silently reset the social category to 'general' and dropped matches.
  const categoryRaw = raw.social_category ?? raw.category ?? raw.socialCategory;
  const locationRaw = raw.location_type ?? raw.locationType;

  return {
    schemeType: wizardType || (intent === 'education' ? 'education' : intent === 'housing' ? 'housing' : 'loan'),
    purpose: purpose || loanPurpose || 'startup',
    amount: Number(amountRaw) || 50000,
    state: raw.state || raw.geography || '',
    socialCategory: String(categoryRaw || 'general').toLowerCase(),
    income: incomeRaw === '' || incomeRaw === undefined ? null : Number(incomeRaw),
    isBpl: Boolean(raw.is_bpl ?? raw.bpl ?? raw.isBpl),
    hasDisability: Boolean(raw.has_disability ?? raw.disability ?? raw.hasDisability),
    locationType: locationRaw || 'rural',
    age: Number(raw.age) || null,
    gender: normalizeGender(raw.gender),
    // Occupation and education are what the eligibility flow branches on
    // (a student never sees business questions); they also feed the fit score.
    occupation: String(raw.occupation || '').trim().toLowerCase(),
    education: String(raw.education || '').trim().toLowerCase(),
    isStudent: String(raw.occupation || raw.employment || '').trim().toLowerCase() === 'student',
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

// Floor: the engine always returns at least this many schemes.
const MIN_RESULTS = 6;

function labelFor(p) {
  if (p >= 80) return 'Highly Recommended';
  if (p >= 60) return 'Recommended';
  if (p >= 40) return 'Possible Match';
  return 'Low Match';
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/**
 * Scores one scheme against a profile.
 *
 * Hard gates are limited to objective, published exclusions — social category,
 * gender, age and state. Everything else is scored, so a broad 100+ scheme
 * dataset never over-filters: an unusual profile still sees the closest real
 * schemes instead of an empty screen. Returns null when a hard gate fails.
 */
function scoreScheme(scheme, profile) {
  const r = scheme.eligibility_rules || {};
  const cats = r.categories || [];
  const states = r.states || [];

  const catOk =
    cats.length === 0 ||
    !profile.socialCategory ||
    cats.includes(profile.socialCategory) ||
    (profile.gender === 'F' && r.women_inclusive);
  if (!catOk) return null;

  if (r.gender && r.gender !== 'any' && profile.gender && profile.gender !== r.gender) return null;

  if (profile.age) {
    if (r.min_age != null && profile.age < r.min_age) return null;
    if (r.max_age != null && profile.age > r.max_age) return null;
  }

  if (!statesMatch(profile.state, states)) return null;

  // Income fit (30)
  let incomePts;
  if (profile.income == null || r.max_income == null) incomePts = 22;
  else if (profile.income <= r.max_income) incomePts = 30;
  else incomePts = clamp(Math.round(30 - ((profile.income - r.max_income) / r.max_income) * 40), 0, 30);

  // Category exclusivity (20) — reserved-category schemes score a touch higher.
  const catPts = cats.length === 0 ? 16 : cats.includes(profile.socialCategory) ? 20 : 10;

  // State reach (10)
  const locPts = states.length === 0 ? 8 : 10;

  // Purpose alignment (15)
  const wants = profile.intent === 'education' ? 'education' : profile.intent === 'housing' ? 'housing' : 'business';
  const purposes = r.loan_purpose || [];
  const purposePts = purposes.length === 0 ? 10 : purposes.includes(wants) ? 15 : 4;

  // Amount band (10)
  const min = Number(scheme.min_amount) || 0;
  const max = Number(scheme.max_amount) || 0;
  let amountPts;
  if (!scheme.is_loan) amountPts = 8;
  else if (profile.amount >= min && profile.amount <= max) amountPts = 10;
  else if (profile.amount < min) amountPts = 5;
  else amountPts = profile.amount <= max * 1.5 ? 8 : 3;

  // Occupation fit (8)
  const occs = r.occupation || [];
  const occPts = occs.length === 0 ? 5 : occs.includes(profile.occupation) ? 8 : 2;

  // Area fit (4)
  const areas = r.area || [];
  const areaPts = areas.length === 0 ? 3 : areas.includes(profile.locationType) ? 4 : 1;

  // Education fit (3)
  const edus = r.education || [];
  const eduPts = edus.length === 0 ? 2 : edus.includes(profile.education) ? 3 : 1;

  // Targeted support (3)
  let supportPts = 1;
  if (profile.isBpl && r.prefer_bpl) supportPts += 1;
  if (profile.hasDisability && r.prefer_disability) supportPts += 1;

  // Age targeting (5) — reward schemes whose own age band fits (senior/youth schemes).
  let agePts = 0;
  if (profile.age) {
    if (r.min_age != null && r.min_age >= 60 && profile.age >= r.min_age) agePts = 5;
    else if (r.max_age != null && r.max_age <= 45 && profile.age <= r.max_age) agePts = 3;
  }

  const raw = incomePts + catPts + locPts + purposePts + amountPts + occPts + areaPts + eduPts + supportPts + agePts;
  // Universal schemes are always eligible; bias them down so specific matches rank first.
  const biased = r.universal ? raw - 10 : raw;
  const probability = clamp(Math.round(biased), 18, 96);

  return {
    scheme_id: scheme.scheme_code,
    scheme_code: scheme.scheme_code,
    name: scheme.name,
    description: scheme.description,
    category: scheme.category,
    recommendation_label: labelFor(probability),
    approval_probability: probability,
    widely_eligible: !!r.universal,
    is_loan: !!scheme.is_loan,
    breakdown: {
      Income: { pts: incomePts, max: 30 },
      Category: { pts: catPts, max: 20 },
      Location: { pts: locPts, max: 10 },
      Purpose: { pts: purposePts, max: 15 },
      Cost: { pts: amountPts, max: 10 },
      Occupation: { pts: occPts, max: 8 },
      Area: { pts: areaPts, max: 4 },
      Education: { pts: eduPts, max: 3 },
      Support: { pts: supportPts, max: 3 },
      Age: { pts: agePts, max: 5 },
    },
    amount_range: {
      min,
      max,
      display: max > 0 ? `${inr(min)} – ${inr(max)}` : 'Non-monetary / varies',
    },
    interest_rate: scheme.interest_rate,
    tenure_range: {
      min_months: Number(scheme.min_tenure_months) || 0,
      max_months: Number(scheme.max_tenure_months) || 0,
    },
    moratorium_months: Number(scheme.moratorium_months) || 0,
    subsidy_percentage: Number(scheme.subsidy_percentage) || 0,
    margin_money_percentage: Number(scheme.margin_money_percentage) || 0,
    required_documents: scheme.required_documents || [],
    source: 'local',
    live_url: scheme.live_url || '',
    ministry: scheme.ministry || 'Government of India',
    portal: scheme.portal || '',
  };
}

/** Rank every scheme against a profile, guaranteeing a non-empty result set. */
export function buildRecommendations(rawProfile) {
  const profile = normalizeProfile(rawProfile);
  const ranked = ALL_SCHEMES.map((s) => scoreScheme(s, profile))
    .filter(Boolean)
    .sort((a, b) => b.approval_probability - a.approval_probability);

  // Guaranteed floor: top the list up with universally-eligible schemes so a
  // narrow or unusual profile never lands on the "No Schemes Found" screen.
  if (ranked.length < MIN_RESULTS) {
    const seen = new Set(ranked.map((r) => r.scheme_code));
    const fillers = ALL_SCHEMES.filter((s) => s.eligibility_rules?.universal && !seen.has(s.scheme_code))
      .map((s) => scoreScheme(s, profile))
      .filter(Boolean)
      .sort((a, b) => b.approval_probability - a.approval_probability);
    for (const f of fillers) {
      if (ranked.length >= MIN_RESULTS) break;
      if (seen.has(f.scheme_code)) continue;
      seen.add(f.scheme_code);
      ranked.push({ ...f, widely_eligible: true });
    }
  }

  return {
    count: ranked.length,
    total_considered: ALL_SCHEMES.length,
    widely_eligible_count: ranked.filter((r) => r.widely_eligible).length,
    profile,
    generated_at: new Date().toISOString(),
    recommendations: ranked,
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
