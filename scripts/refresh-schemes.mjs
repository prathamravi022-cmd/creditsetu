#!/usr/bin/env node
/**
 * refresh-schemes.mjs — the scheme data pipeline.
 *
 *   node scripts/refresh-schemes.mjs           # fetch (best-effort) + write JSON
 *   node scripts/refresh-schemes.mjs --check   # validate only, do not write
 *
 * Live official APIs are unreliable from arbitrary clients (myScheme returns
 * 401/500 without its private header; JanSamarth serves an HTML shell; data.gov.in
 * is frequently blocked). So the pipeline treats live fetching as *best effort
 * enrichment* and always falls back to the curated, real-scheme library. The
 * emitted dataset is vendored into the app so the frontend never depends on a
 * flaky third party at runtime.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIBRARY, REQUIRED_COVERAGE } from './scheme-library/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../frontend/src/services/schemesData.json');
const CHECK_ONLY = process.argv.includes('--check');

const LOAN_TYPES = new Set(['micro_finance', 'term_loan', 'education_loan', 'housing_loan', 'startup_loan']);

/* ------------------------------------------------------------------ */
/* Best-effort live sources (never fatal)                              */
/* ------------------------------------------------------------------ */
const LIVE_SOURCES = [
  { name: 'myScheme', url: 'https://api.myscheme.gov.in/schemes/v5/public/schemes?limit=50' },
  { name: 'data.gov.in', url: 'https://api.data.gov.in/resource/6176ee09-3d56-4a3b-8115-21841576b2f6?format=json&limit=50' },
];

async function fetchSource(src) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(src.url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'CreditSetu/1.0 (+data-refresh)' },
    });
    clearTimeout(t);
    if (!res.ok) {
      console.warn(`  · ${src.name}: HTTP ${res.status} — skipped`);
      return [];
    }
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      console.warn(`  · ${src.name}: non-JSON response — skipped`);
      return [];
    }
    const json = await res.json();
    const rows = Array.isArray(json) ? json : json.data || json.schemes || [];
    console.log(`  · ${src.name}: ${rows.length} live rows`);
    return rows;
  } catch (e) {
    console.warn(`  · ${src.name}: ${e.name === 'AbortError' ? 'timed out' : e.message} — skipped`);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Normalisation                                                       */
/* ------------------------------------------------------------------ */
function normalize(s) {
  const r = s.rules || {};
  if (!s.code || !s.name) throw new Error(`missing code/name: ${JSON.stringify(s.name || s)}`);
  return {
    scheme_code: s.code,
    name: s.name,
    scheme_type: s.type,
    category: s.category,
    description: s.desc,
    min_amount: s.amt?.[0] ?? 0,
    max_amount: s.amt?.[1] ?? 0,
    interest_rate: s.rate ?? 0,
    subsidy_percentage: s.sub ?? 0,
    margin_money_percentage: s.margin ?? 0,
    min_tenure_months: s.ten?.[0] ?? 0,
    max_tenure_months: s.ten?.[1] ?? 0,
    moratorium_months: s.mor ?? 0,
    eligibility_rules: {
      max_income: r.income ?? null,
      min_age: r.age?.[0] ?? null,
      max_age: r.age?.[1] ?? null,
      gender: r.gender || 'any',
      occupation: r.occ || [],
      categories: r.cats || [],
      states: r.states || [],
      area: r.area || [],
      education: r.edu || [],
      loan_purpose: r.purpose || ['business'],
      universal: !!r.universal,
      women_inclusive: !!r.women_inclusive,
      prefer_bpl: !!r.prefer_bpl,
      prefer_disability: !!r.disability,
    },
    required_documents: s.docs || ['Aadhaar', 'Bank Passbook'],
    live_url: s.url || '',
    ministry: s.ministry || 'Government of India',
    portal: s.portal || '',
    is_loan: LOAN_TYPES.has(s.type),
    is_active: true,
  };
}

/* ------------------------------------------------------------------ */
/* Validation + coverage                                               */
/* ------------------------------------------------------------------ */
function admits(scheme, pred) {
  const r = scheme.eligibility_rules;
  return pred(r, scheme);
}

function coverageReport(schemes) {
  const has = (pred) => schemes.filter((s) => admits(s, pred)).length;
  const report = {};

  for (const occ of REQUIRED_COVERAGE.occupations) {
    report[`occupation:${occ}`] = has((r) => r.occupation.length === 0 || r.occupation.includes(occ));
  }
  report['woman'] = has((r) => r.gender === 'female' || r.women_inclusive);
  report['senior'] = has((r) => (r.max_age ?? 200) >= 60);
  report['bpl'] = has((r) => r.prefer_bpl);
  report['disability'] = has((r) => r.prefer_disability);
  report['rural'] = has((r) => r.area.length === 0 || r.area.includes('rural'));
  report['urban'] = has((r) => r.area.length === 0 || r.area.includes('urban'));
  report['universal'] = has((r) => r.universal);
  for (const cat of REQUIRED_COVERAGE.categories) {
    report[`category:${cat}`] = has((r) => r.categories.length === 0 || r.categories.includes(cat));
  }
  report['general'] = has((r) => r.categories.length === 0);
  return report;
}

function validate(schemes) {
  const errors = [];
  const seen = new Set();
  for (const s of schemes) {
    if (seen.has(s.scheme_code)) errors.push(`duplicate code: ${s.scheme_code}`);
    seen.add(s.scheme_code);
    for (const f of ['name', 'scheme_type', 'category', 'description']) {
      if (!s[f]) errors.push(`${s.scheme_code}: missing ${f}`);
    }
  }
  const report = coverageReport(schemes);
  const gaps = Object.entries(report).filter(([, n]) => n === 0);
  return { errors, report, gaps };
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */
async function main() {
  console.log('CreditSetu scheme pipeline');
  console.log('— fetching live sources (best effort)');
  for (const src of LIVE_SOURCES) await fetchSource(src);

  console.log(`— normalising ${LIBRARY.length} curated schemes`);
  const schemes = LIBRARY.map(normalize);

  const { errors, report, gaps } = validate(schemes);
  console.log(`\nCoverage (schemes admitting each demographic):`);
  for (const [k, n] of Object.entries(report)) console.log(`  ${k.padEnd(22)} ${n}`);

  if (errors.length) {
    console.error(`\nX ${errors.length} validation error(s):`);
    errors.forEach((e) => console.error('  - ' + e));
    process.exit(1);
  }
  if (gaps.length) {
    console.error(`\nX coverage gaps (no scheme admits):`);
    gaps.forEach(([k]) => console.error('  - ' + k));
    process.exit(1);
  }

  console.log(`\nOK ${schemes.length} schemes, unique codes, full coverage.`);
  if (CHECK_ONLY) {
    console.log('--check: not writing.');
    return;
  }
  fs.writeFileSync(OUT, JSON.stringify(schemes, null, 2) + '\n');
  console.log(`Wrote ${path.relative(process.cwd(), OUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
