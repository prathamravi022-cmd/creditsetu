/**
 * Real-Time Scheme Data Fetcher
 * Fetches from official portals (myScheme / JanSamarth) with local fallback.
 * All schemes include live_url for official portal linking.
 */
import LOCAL_SCHEMES from './schemesData.json';

const MYSCHEME_API = 'https://www.myscheme.gov.in';
const JANSAMARTH_API = 'https://www.jansamarth.in';

async function fetchFromMyScheme() {
  try {
    const resp = await fetch(MYSCHEME_API + '/api/scheme-listing?ministry=Ministry+of+Social+Justice', {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: 'application/json' },
    });
    if (!resp.ok) throw new Error(resp.status);
    const data = await resp.json();
    return (data.schemes || data.results || []).map(s => ({
      scheme_code: 'MS-' + (s.slug || s.schemeId || Date.now()),
      name: s.schemeName || s.name || 'Government Scheme',
      scheme_type: s.sector || 'term_loan',
      description: s.shortDescription || '',
      min_amount: Number(s.minLoanAmount || 10000),
      max_amount: Number(s.maxLoanAmount || 1000000),
      interest_rate: Number(s.interestRate || 7),
      subsidy_percentage: Number(s.subsidy || 0),
      margin_money_percentage: Number(s.marginMoney || 0),
      min_tenure_months: 12, max_tenure_months: 120,
      moratorium_months: Number(s.moratorium || 0),
      eligibility_rules: { max_income: 500000, categories: ['sc', 'st', 'obc'], states: [], loan_purpose: ['business'] },
      required_documents: s.documentsRequired || [],
      approval_probability: 50,
      recommendation_label: 'Possible Match',
      source: 'myscheme',
      live_url: 'https://www.myscheme.gov.in/scheme/' + (s.slug || ''),
      ministry: s.ministry || 'Ministry of Social Justice',
    }));
  } catch { return null; }
}

async function fetchFromJanSamarth() {
  try {
    const resp = await fetch(JANSAMARTH_API + '/api/v1/scheme/getAllSchemes', {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: 'application/json' },
    });
    if (!resp.ok) throw new Error(resp.status);
    const data = await resp.json();
    return (data.data || data.schemes || []).map(s => ({
      scheme_code: 'JS-' + (s.productCode || s.code || Date.now()),
      name: s.productName || s.name || 'Financial Scheme',
      scheme_type: 'term_loan',
      description: s.description || '',
      min_amount: Number(s.minLoanAmount || 10000),
      max_amount: Number(s.maxLoanAmount || 5000000),
      interest_rate: Number(s.interestRate || 7),
      subsidy_percentage: 0, margin_money_percentage: 0,
      min_tenure_months: 12, max_tenure_months: 120,
      moratorium_months: 0,
      eligibility_rules: { max_income: 500000, categories: ['sc', 'st', 'obc'], states: [], loan_purpose: ['business'] },
      required_documents: [],
      approval_probability: 50,
      recommendation_label: 'Possible Match',
      source: 'jansamarth',
      live_url: 'https://www.jansamarth.in/scheme/' + (s.productCode || ''),
      ministry: 'Ministry of Finance',
    }));
  } catch { return null; }
}

export async function fetchSchemes() {
  const [ms, js] = await Promise.allSettled([fetchFromMyScheme(), fetchFromJanSamarth()]);
  const live = [];
  if (ms.status === 'fulfilled' && ms.value) live.push(...ms.value);
  if (js.status === 'fulfilled' && js.value) live.push(...js.value);
  const schemes = live.length > 0 ? live : LOCAL_SCHEMES;
  return {
    schemes,
    sources: {
      myscheme: ms.status === 'fulfilled' && ms.value ? 'live' : 'offline',
      jansamarth: js.status === 'fulfilled' && js.value ? 'live' : 'offline',
      local: 'always-available',
    },
    timestamp: Date.now(),
    total: schemes.length,
  };
}

export async function fetchSchemeByCode(code) {
  const data = await fetchSchemes();
  return data.schemes.find(s => s.scheme_code === code) || null;
}