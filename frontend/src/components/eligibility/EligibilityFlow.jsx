/**
 * EligibilityFlow — the eligibility section's card-based step flow.
 *
 * One question per card (Typeform-style), with dynamic branching: students skip
 * the business questions, housing/education intents skip "purpose", and every
 * answer is written straight into the same profile shape the recommender reads
 * (see services/recommender.js → normalizeProfile).
 *
 * Returning users open on the review card — "Confirm & Proceed" — so they never
 * re-enter details we already hold. First-time users walk the questions instead.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Award, BadgeCheck, BadgePercent, BookOpen,
  Briefcase, Building2, CheckCircle2, GraduationCap, Hammer, Home,
  Landmark, PencilLine, Rocket, Search, Sparkles, Sprout, Store, Tractor, TrendingUp,
  UserRound, Wallet, Package, Wrench,
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { INDIAN_STATES } from '../../data/stateDistricts';
import {
  fetchEligibilityProfile,
  persistEligibilityProfile,
  readDraft,
  writeDraft,
  profileSummary,
} from '../../services/eligibilityProfile';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

/* ---------- question definitions ---------- */
/* `show(answers)` is the branching rule; a question is skipped when it is false. */
const QUESTIONS = [
  {
    id: 'occupation',
    key: 'occupation',
    type: 'choice',
    twoCol: true,
    autoAdvance: true,
    title: 'What do you do?',
    hint: 'This decides which schemes we look at first — students see education support, farmers see agriculture support.',
    options: [
      { value: 'student', label: 'Student', desc: 'School, college or training', Icon: GraduationCap },
      { value: 'salaried', label: 'Salaried', desc: 'Employed with a monthly salary', Icon: Briefcase },
      { value: 'business', label: 'Self-employed', desc: 'Own shop, trade or enterprise', Icon: Store },
      { value: 'farmer', label: 'Farmer', desc: 'Farming or allied activities', Icon: Tractor },
      { value: 'artisan', label: 'Artisan / Homemaker', desc: 'Handicraft, tailoring, household work', Icon: Hammer },
      { value: 'looking', label: 'Looking for work', desc: 'Between jobs or starting out', Icon: Search },
    ],
  },
  {
    id: 'age',
    key: 'age',
    type: 'slider',
    min: 18,
    max: 70,
    step: 1,
    title: 'How old are you?',
    hint: 'Several schemes have age limits for applicants.',
    format: (v) => `${v} years`,
    sub: (v) => (v < 25 ? 'Youth-focused schemes are open to you' : v > 60 ? 'Senior-friendly schemes will be prioritised' : 'Most credit schemes are open to this age'),
  },
  {
    id: 'gender',
    key: 'gender',
    type: 'choice',
    autoAdvance: true,
    title: 'Gender',
    hint: 'Used only to surface schemes reserved for women entrepreneurs.',
    options: [
      { value: 'F', label: 'Female', desc: 'Women-focused schemes apply', Icon: UserRound },
      { value: 'M', label: 'Male', desc: '', Icon: UserRound },
      { value: 'O', label: 'Other', desc: '', Icon: Sparkles },
    ],
  },
  {
    id: 'social_category',
    key: 'social_category',
    type: 'choice',
    twoCol: true,
    autoAdvance: true,
    title: 'Social category',
    hint: 'Many government credit schemes are reserved for SC, ST and OBC applicants.',
    options: [
      { value: 'general', label: 'General', desc: '', badge: 'GEN' },
      { value: 'obc', label: 'OBC', desc: '', badge: 'OBC' },
      { value: 'sc', label: 'Scheduled Caste', desc: '', badge: 'SC' },
      { value: 'st', label: 'Scheduled Tribe', desc: '', badge: 'ST' },
    ],
  },
  {
    id: 'state',
    key: 'state',
    type: 'state',
    title: 'Which state are you domiciled in?',
    hint: 'Scheme availability and co-funding rules change from state to state.',
  },
  {
    id: 'location_type',
    key: 'location_type',
    type: 'choice',
    twoCol: true,
    autoAdvance: true,
    title: 'Do you live in a rural or urban area?',
    hint: 'Rural livelihood and urban enterprise schemes are treated differently.',
    options: [
      { value: 'rural', label: 'Rural', desc: 'Village, block or gram panchayat', Icon: Sprout },
      { value: 'urban', label: 'Urban', desc: 'City or town', Icon: Building2 },
    ],
  },
  {
    id: 'family_annual_income',
    key: 'family_annual_income',
    type: 'slider',
    min: 0,
    max: 1000000,
    step: 25000,
    title: 'Annual family income',
    hint: 'Most schemes cap income at ₹5 lakh, so this is the single biggest filter.',
    format: (v) => inr(v),
    sub: (v) => (v <= 100000 ? 'Below Poverty Line support applies to you' : v <= 500000 ? 'Within the limit of most schemes' : 'Only uncapped schemes will match'),
    chip: { key: 'is_bpl', label: 'Family holds a BPL card' },
  },
  {
    id: 'education',
    key: 'education',
    type: 'choice',
    twoCol: true,
    autoAdvance: true,
    title: (a) => (a.occupation === 'student' ? 'What are you studying?' : 'Highest education completed'),
    hint: (a) => (a.occupation === 'student'
      ? 'Scholarships and study loans depend on your current level.'
      : 'Skill, fellowship and research schemes depend on your qualification.'),
    options: (a) => (a.occupation === 'student'
      ? [
          { value: 'school', label: 'School', desc: 'Up to Class 10', Icon: BookOpen },
          { value: 'higher_secondary', label: 'Class 11–12', desc: 'Higher secondary', Icon: BookOpen },
          { value: 'iti', label: 'ITI / Diploma', desc: 'Vocational or polytechnic', Icon: Wrench },
          { value: 'graduate', label: 'Undergraduate', desc: 'Bachelor degree in progress', Icon: GraduationCap },
          { value: 'postgraduate', label: 'Postgraduate', desc: 'Masters or research work', Icon: Award },
        ]
      : [
          { value: 'school', label: 'Class 10 or below', desc: '', Icon: BookOpen },
          { value: 'higher_secondary', label: 'Class 12', desc: '', Icon: BookOpen },
          { value: 'iti', label: 'ITI / Diploma', desc: 'Vocational trade', Icon: Wrench },
          { value: 'graduate', label: 'Graduate', desc: 'Bachelor degree', Icon: GraduationCap },
          { value: 'postgraduate', label: 'Postgraduate', desc: 'Masters, research or above', Icon: Award },
          { value: 'none', label: 'None of these', desc: '', Icon: BadgeCheck },
        ]),
  },
  {
    id: 'schemeType',
    key: 'schemeType',
    type: 'choice',
    twoCol: true,
    autoAdvance: true,
    show: (a) => a.occupation !== 'student',
    title: 'What kind of support do you need?',
    hint: 'Pick the closest match — you can change it later.',
    options: [
      { value: 'loan', label: 'Business loan', desc: 'Working capital or enterprise credit', Icon: Landmark },
      { value: 'subsidy', label: 'Subsidy / Grant', desc: 'Government support you do not repay', Icon: BadgePercent },
      { value: 'housing', label: 'Housing support', desc: 'Home loan or construction credit', Icon: Home },
      { value: 'education', label: 'Education support', desc: 'Study loan or scholarship', Icon: GraduationCap },
    ],
  },
  {
    id: 'purpose',
    key: 'purpose',
    type: 'choice',
    autoAdvance: true,
    show: (a) => ['loan', 'subsidy'].includes(a.schemeType),
    title: 'What is the funding for?',
    hint: '',
    options: [
      { value: 'startup', label: 'New business setup', desc: '', Icon: Rocket },
      { value: 'expansion', label: 'Business expansion', desc: '', Icon: TrendingUp },
      { value: 'working_capital', label: 'Working capital', desc: '', Icon: Wallet },
      { value: 'asset_purchase', label: 'Equipment / asset purchase', desc: '', Icon: Package },
    ],
  },
  {
    id: 'amount',
    key: 'amount',
    type: 'slider',
    min: 10000,
    max: 1000000,
    step: 5000,
    title: (a) => (a.schemeType === 'education' ? 'How much study support do you need?' : a.schemeType === 'housing' ? 'How much housing support do you need?' : 'How much funding do you need?'),
    hint: 'An approximate figure is enough — we match you against the scheme bands.',
    format: (v) => inr(v),
    sub: (v) => (v >= 500000 ? 'Large-ticket term loans and CGTMSE cover this' : v >= 100000 ? 'Most MUDRA and state schemes cover this' : 'Micro-finance and Shishu loans cover this'),
  },
  { id: 'review', type: 'review' },
];

/** Questions visible for the answers given so far, in order. */
function visibleQuestions(answers) {
  return QUESTIONS.filter((q) => !q.show || q.show(answers));
}

/** A question's copy can be a plain string or a function of the answers. */
function resolve(value, answers) {
  return typeof value === 'function' ? value(answers) : value;
}

/** Has this question been answered? Sliders always carry a default. */
function isAnswered(id, answers) {
  if (id === 'review') return true;
  const value = answers[id];
  if (id === 'age' || id === 'amount' || id === 'family_annual_income') return Number(value) > 0;
  return value !== undefined && value !== null && value !== '';
}

/** First question still missing an answer — where a resumed draft picks up. */
function firstUnanswered(answers) {
  const list = visibleQuestions(answers);
  const pending = list.find((q) => q.id !== 'review' && !isAnswered(q.id, answers));
  return (pending || list[list.length - 1] || QUESTIONS[0]).id;
}

export default function EligibilityFlow() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading | ready | saving
  const [answers, setAnswers] = useState({ amount: 50000, age: 30, family_annual_income: 200000, location_type: 'rural' });
  const [identity, setIdentity] = useState({ name: '', email: '', phone: '' });
  const [existing, setExisting] = useState(false);
  const [path, setPath] = useState(['occupation']);
  const [direction, setDirection] = useState('forward');
  const [error, setError] = useState('');
  const timer = useRef(0);

  /* ---- load everything we already know about this account ---- */
  useEffect(() => {
    let alive = true;
    setStatus('loading');
    (async () => {
      const { profile, existing: found, identity: who } = await fetchEligibilityProfile(user);
      if (!alive) return;
      setIdentity(who);
      setExisting(found);
      const draft = readDraft(user);
      const base = { ...(profile || {}), ...(draft || {}) };
      const seeded = {
        amount: Number(base.amount) || 50000,
        age: Number(base.age) || 30,
        family_annual_income: Number(base.family_annual_income ?? base.income) || (base.income === 0 ? 0 : 200000),
        ...base,
      };
      setAnswers(seeded);
      // Returning users with nothing in progress open on the confirm card.
      setPath([found && !draft ? 'review' : firstUnanswered(seeded)]);
      setStatus('ready');
    })();
    return () => { alive = false; clearTimeout(timer.current); };
  }, [user]);

  const visible = useMemo(() => visibleQuestions(answers), [answers]);
  const currentId = path[path.length - 1];
  const question = visible.find((q) => q.id === currentId) || visible[0];
  const total = visible.length;
  const position = Math.max(1, visible.findIndex((q) => q.id === question.id) + 1);
  const percent = question.id === 'review' ? 100 : Math.round(((position - 1) / Math.max(1, total - 1)) * 100);

  const setAnswer = useCallback((key, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      // A student only ever needs education support, so the category question
      // is skipped and the intent is set for them.
      if (key === 'occupation') {
        if (value === 'student') {
          next.schemeType = 'education';
          // Students are never asked about business purpose, so drop any stale
          // value carried over from an earlier business profile.
          next.purpose = '';
        } else if (prev.schemeType === 'education' && prev.occupation === 'student') {
          next.schemeType = '';
        }
      }
      writeDraft(user, next);
      return next;
    });
    setError('');
  }, [user]);

  const goTo = useCallback((id) => {
    setDirection('forward');
    setPath((p) => [...p, id]);
  }, []);

  const goNext = useCallback(() => {
    const list = visibleQuestions(answers);
    const i = list.findIndex((q) => q.id === question.id);
    const next = list[i + 1];
    if (next) goTo(next.id);
  }, [answers, question, goTo]);

  const goBack = useCallback(() => {
    setDirection('back');
    setError('');
    setPath((p) => {
      let next = p.slice(0, -1);
      const list = visibleQuestions(answers);
      // Skip history entries that the branching has removed (e.g. purpose).
      while (next.length && !list.some((q) => q.id === next[next.length - 1])) next = next.slice(0, -1);
      return next.length ? next : ['occupation'];
    });
  }, [answers]);

  /* ---- one question at a time, so picking an option moves on ---- */
  const manual = question.type === 'slider' || question.type === 'state' || question.id === 'review';

  const choose = useCallback((key, value) => {
    setAnswer(key, value);
    if (!manual) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => goNext(), 220);
    }
  }, [setAnswer, manual, goNext]);

  const submit = useCallback(async () => {
    setStatus('saving');
    const supportType = answers.schemeType || (answers.occupation === 'student' ? 'education' : 'loan');
    const payload = {
      ...answers,
      age: Number(answers.age),
      amount: Number(answers.amount) || 50000,
      family_annual_income: Number(answers.family_annual_income) || 0,
      geography: answers.state,
      schemeType: supportType,
      // Keep the stored purpose honest: only business intents carry one.
      purpose: ['loan', 'subsidy'].includes(supportType) ? answers.purpose || '' : '',
      loan_purpose: supportType === 'education' ? 'education' : 'business',
    };
    try {
      await persistEligibilityProfile(payload, user);
      toast.success('Details saved — here are your matched schemes');
      navigate('/results');
    } catch {
      setStatus('ready');
      setError('We could not save your details. Please try again.');
    }
  }, [answers, user, navigate]);

  /* ---- keyboard: 1–9 picks an option, Enter continues, ← goes back ---- */
  useEffect(() => {
    if (status !== 'ready') return undefined;
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') { goNext(); return; }
      if (e.key === 'ArrowLeft') { goBack(); return; }
      if (e.key === 'Enter' && manual) { e.preventDefault(); if (question.id === 'review') submit(); else goNext(); return; }
      const n = Number(e.key);
      if (n >= 1 && n <= 9 && question.options) {
        const options = resolve(question.options, answers) || [];
        const pick = options[n - 1];
        if (pick) choose(question.key, pick.value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, manual, question, answers, choose, goBack, goNext, submit]);

  const atReviewStart = question.id === 'review' && existing && path.length === 1;
  const startOver = () => { setDirection('back'); setError(''); setPath(['occupation']); };

  return (
    <div className="ef-page">
      <div className="ef-shell">
        {/* Glowing progress bar — the whole point of a one-question flow is
            that you can always see how far you have left. */}
        <div className="ef-head">
          <span className="ef-step-label">
            {status === 'loading'
              ? 'Fetching your details'
              : question.id === 'review'
                ? 'Almost there'
                : `Question ${Math.min(position, total - 1)} of ${Math.max(1, total - 1)}`}
          </span>
          <span className="ef-step-title">
            {status === 'loading' ? 'Just a moment' : existing ? 'Welcome back' : 'Check eligibility'}
          </span>
        </div>
        <div
          className="ef-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={status === 'loading' ? 0 : percent}
          aria-label="Eligibility check progress"
        >
          <div className="ef-progress-fill" style={{ width: `${status === 'loading' ? 8 : Math.max(6, percent)}%` }} />
        </div>

        {status === 'loading' ? (
          <SkeletonCard />
        ) : (
          <div className="ef-card">
            <div
              key={`${question.id}-${path.length}`}
              className={`ef-panel ${direction === 'back' ? 'is-back' : 'is-forward'}`}
            >
              {question.type === 'review' ? (
                <ReviewCard
                  answers={answers}
                  identity={identity}
                  existing={existing}
                  error={error}
                  onEdit={startOver}
                />
              ) : (
                <>
                  <h1 className="ef-q">{resolve(question.title, answers)}</h1>
                  {resolve(question.hint, answers) ? (
                    <p className="ef-q-hint">{resolve(question.hint, answers)}</p>
                  ) : null}

                  {question.type === 'choice' && (
                    <ChoiceList question={question} answers={answers} onChoose={choose} />
                  )}
                  {question.type === 'slider' && (
                    <SliderQuestion
                      question={question}
                      value={Number(answers[question.key])}
                      answers={answers}
                      onPatch={setAnswer}
                    />
                  )}
                  {question.type === 'state' && (
                    <StateQuestion value={answers.state} onChoose={(v) => choose('state', v)} />
                  )}
                  {error ? <p className="ef-error" role="alert">{error}</p> : null}
                </>
              )}
            </div>
          </div>
        )}

        {status !== 'loading' && (
          <div className="ef-actions">
            {atReviewStart ? (
              <button type="button" className="ef-btn ef-btn-ghost" onClick={startOver}>
                <PencilLine className="w-4 h-4" /> Update details
              </button>
            ) : (
              <button
                type="button"
                className="ef-btn ef-btn-ghost"
                onClick={goBack}
                disabled={question.id === 'review' && !existing}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}

            {question.id === 'review' ? (
              <button
                type="button"
                className="ef-btn ef-btn-primary"
                onClick={submit}
                disabled={status === 'saving'}
              >
                {status === 'saving' ? (
                  <>
                    <span className="ef-spinner" aria-hidden="true" /> Finding schemes…
                  </>
                ) : (
                  <>
                    Confirm &amp; Proceed <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                className="ef-btn ef-btn-primary"
                onClick={goNext}
                disabled={!isAnswered(question.id, answers)}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- presentational pieces ---------- */

function ChoiceList({ question, answers, onChoose }) {
  const options = resolve(question.options, answers) || [];
  return (
    <div
      className={`ef-choices ${question.twoCol ? 'two-col' : ''}`}
      role="group"
      aria-label={resolve(question.title, answers)}
    >
      {options.map((option, index) => {
        const pressed = answers[question.key] === option.value;
        const OptionIcon = option.Icon;
        return (
          <button
            key={option.value}
            type="button"
            className="ef-choice"
            aria-pressed={pressed}
            onClick={() => onChoose(question.key, option.value)}
          >
            <span className="ef-choice-icon" aria-hidden="true">
              {OptionIcon
                ? <OptionIcon className="w-5 h-5" />
                : <span className="text-[10px] font-bold tracking-wide">{option.badge}</span>}
            </span>
            <span className="ef-choice-body">
              <span className="ef-choice-label">{option.label}</span>
              {option.desc ? <span className="ef-choice-desc">{option.desc}</span> : null}
            </span>
            {index < 9 ? <span className="ef-choice-key" aria-hidden="true">{index + 1}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function SliderQuestion({ question, value, answers, onPatch }) {
  const { min, max, step, key, chip } = question;
  const pct = Math.round(((value - min) / Math.max(1, max - min)) * 100);
  const chipOn = chip ? Boolean(answers[chip.key]) : false;
  return (
    <div className="ef-slider-wrap">
      <div className="ef-value">{question.format ? question.format(value) : value}</div>
      {question.sub ? <div className="ef-value-sub">{question.sub(value)}</div> : null}
      <input
        type="range"
        className="ef-slider"
        style={{ '--ef-fill': `${pct}%` }}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onPatch(key, Number(e.target.value))}
        aria-label={resolve(question.title, answers)}
        aria-valuetext={question.format ? question.format(value) : String(value)}
      />
      <div className="ef-scale">
        <span>{question.format ? question.format(min) : min}</span>
        <span>{question.format ? question.format(max) : max}</span>
      </div>
      {chip ? (
        <button
          type="button"
          className="ef-chip"
          aria-pressed={chipOn}
          onClick={() => onPatch(chip.key, !chipOn)}
        >
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          {chipOn ? `${chip.label} — yes` : chip.label}
        </button>
      ) : null}
    </div>
  );
}

function StateQuestion({ value, onChoose }) {
  const [query, setQuery] = useState('');
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? INDIAN_STATES.filter((s) => s.toLowerCase().includes(q)) : INDIAN_STATES;
  }, [query]);
  return (
    <div>
      <input
        type="search"
        className="ef-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your state or union territory"
        aria-label="Search states and union territories"
      />
      <div className="ef-state-grid" role="group" aria-label="States and union territories">
        {list.map((state) => (
          <button
            key={state}
            type="button"
            className="ef-state-btn"
            aria-pressed={value === state}
            onClick={() => onChoose(state)}
          >
            {state}
          </button>
        ))}
      </div>
      {list.length === 0 ? <p className="ef-empty">No state matches “{query}”.</p> : null}
    </div>
  );
}

function ReviewCard({ answers, identity, existing, error, onEdit }) {
  const rows = profileSummary(answers);
  const who = identity.name || identity.email || 'Signed-in user';
  const initials = who.trim().slice(0, 2).toUpperCase();
  return (
    <>
      <h1 className="ef-q">{existing ? 'We already have your details' : 'Ready to find your schemes'}</h1>
      <p className="ef-q-hint">
        {existing
          ? 'Confirm and we will match this profile against 21 government schemes. Update anything that has changed.'
          : 'One last look — change any answer, then we will match you.'}
      </p>

      {(identity.name || identity.email || identity.phone) && (
        <div className="ef-identity">
          <span className="ef-identity-avatar" aria-hidden="true">{initials}</span>
          <div className="min-w-0">
            <div className="font-semibold truncate">{who}</div>
            <div className="truncate opacity-80">{[identity.email, identity.phone].filter(Boolean).join(' · ')}</div>
          </div>
        </div>
      )}

      <div className="ef-review" role="list">
        {rows.map((row) => (
          <div className="ef-review-row" role="listitem" key={row.key}>
            <span className="ef-review-label">{row.label}</span>
            <span className="ef-review-value">{row.value}</span>
          </div>
        ))}
      </div>

      <Link className="ef-link" to="/edit-profile">
        Add district, pincode, BPL or disability details <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>

      {error ? <p className="ef-error" role="alert">{error}</p> : null}
      <button type="button" className="ef-link" onClick={onEdit}>
        <PencilLine className="w-3.5 h-3.5" /> Change my answers
      </button>
    </>
  );
}

function SkeletonCard() {
  return (
    <div className="ef-card" aria-busy="true" aria-live="polite" aria-label="Loading your saved details">
      <div className="ef-panel">
        <div className="ef-skel ef-skel-line" style={{ width: '58%', height: '1.15rem' }} />
        <div className="ef-skel ef-skel-line" style={{ width: '86%' }} />
        <div className="ef-skel ef-skel-card" />
        <div className="ef-skel ef-skel-card" />
        <div className="ef-skel ef-skel-card" style={{ height: 46 }} />
      </div>
    </div>
  );
}

