import { buildRecommendations } from '../frontend/src/services/recommender.js';

const profiles = [
  { label: 'Student / education / general / rural / 18', schemeType: 'education', occupation: 'student', education: 'higher_secondary', social_category: 'general', location_type: 'rural', age: 18, family_annual_income: 150000, state: 'Bihar', gender: 'M' },
  { label: 'Farmer / rural / OBC / 45', schemeType: 'loan', occupation: 'farmer', social_category: 'obc', location_type: 'rural', age: 45, family_annual_income: 200000, state: 'Uttar Pradesh', gender: 'M' },
  { label: 'Business owner / urban / general / 35', schemeType: 'loan', occupation: 'business', social_category: 'general', location_type: 'urban', age: 35, family_annual_income: 800000, amount: 500000, state: 'Maharashtra', gender: 'M' },
  { label: 'Woman / urban / general / 30 / looking', schemeType: 'loan', occupation: 'looking', social_category: 'general', location_type: 'urban', age: 30, family_annual_income: 300000, state: 'Delhi', gender: 'F' },
  { label: 'Senior / rural / SC / BPL / 65', schemeType: 'loan', occupation: 'farmer', social_category: 'sc', location_type: 'rural', age: 65, family_annual_income: 80000, is_bpl: true, state: 'Jharkhand', gender: 'M' },
  { label: 'Salaried / urban / general / 40', schemeType: 'loan', occupation: 'salaried', social_category: 'general', location_type: 'urban', age: 40, family_annual_income: 900000, state: 'Karnataka', gender: 'M' },
  { label: 'Unemployed youth / rural / 22', schemeType: 'loan', occupation: 'looking', social_category: 'general', location_type: 'rural', age: 22, family_annual_income: 120000, state: 'Madhya Pradesh', gender: 'M' },
  { label: 'Disabled / urban / 35', schemeType: 'loan', occupation: 'artisan', social_category: 'obc', location_type: 'urban', age: 35, has_disability: true, family_annual_income: 250000, state: 'Tamil Nadu', gender: 'F' },
  { label: 'MINORITY student / urban / 20', schemeType: 'education', occupation: 'student', social_category: 'minority', location_type: 'urban', age: 20, family_annual_income: 180000, state: 'West Bengal', gender: 'M' },
  { label: 'Empty profile (worst case)', schemeType: 'loan' },
];

let failures = 0;
for (const p of profiles) {
  const { label, ...raw } = p;
  const r = buildRecommendations(raw);
  const top = r.recommendations.slice(0, 3).map((x) => `${x.scheme_code}(${x.approval_probability}%)`).join(', ');
  const ok = r.count > 0;
  if (!ok) failures++;
  console.log(`${ok ? 'OK ' : 'X  '} ${label.padEnd(42)} count=${String(r.count).padStart(3)}  top: ${top}`);
}

console.log(failures === 0 ? '\nAll profiles returned at least one scheme.' : `\n${failures} profile(s) returned ZERO schemes.`);

// Performance: full 100+ scheme ranking must stay well under a frame budget.
const ITER = 2000;
const t0 = performance.now();
let n = 0;
for (let i = 0; i < ITER; i++) n = buildRecommendations(profiles[i % profiles.length]).total_considered;
const ms = performance.now() - t0;
console.log(`Perf: ${ITER} full rankings over ${n} schemes in ${ms.toFixed(0)}ms → ${(ms / ITER).toFixed(3)}ms per ranking.`);

process.exit(failures === 0 ? 0 : 1);
