import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  CheckCircle, AlertCircle, MapPin, Download,
  Calculator, FileText, ChevronDown, ChevronUp, Info,
  Shield, ExternalLink, Globe, Pencil
} from 'lucide-react';
import EMICalculator from './EMICalculator';
import Glossary from './Glossary';
import ShareButton from '../common/ShareButton';
import SkeletonCard from './SkeletonCard';
import PageBackdrop from '../art/PageBackdrop';
import ScaleCard from '../ui/ScaleCard';
import ScrollReveal from '../ui/ScrollReveal';
import { loadProfile, generateAndCache } from '../../services/recommender';
import { useAuth } from '../../store/AuthContext';

function getProbabilityColor(prob) {
  if (prob >= 80) return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40';
  if (prob >= 60) return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40';
  if (prob >= 40) return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40';
  return 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-white/10';
}

function getLabelColor(label) {
  switch (label) {
    case 'Highly Recommended': return 'bg-green-700 text-white';
    case 'Recommended': return 'bg-green-700 text-white';
    case 'Possible Match': return 'bg-amber-500 text-white';
    default: return 'bg-slate-400 text-white';
  }
}

export default function ResultsDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedScheme, setExpandedScheme] = useState(null);
  const [showEMI, setShowEMI] = useState(null);
  // Large datasets render in pages so 100+ schemes never block the main thread.
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    try {
      const data = sessionStorage.getItem('recommendations');
      if (data) {
        setRecommendations(JSON.parse(data));
        setVisibleCount(6);
      } else {
        // Remembered details mean matches can always be rebuilt (new tab, reload).
        const profile = loadProfile(user);
        if (profile) {
          setRecommendations(generateAndCache(profile));
          setVisibleCount(6);
        }
      }
    } catch (e) {
      console.error('Failed to load recommendations:', e);
    }
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, [user?.email, user?.phone]);

  const handleDownloadPDF = async (scheme) => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      const element = document.getElementById(`scheme-${scheme.scheme_id}`);
      if (!element) return;

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.setFontSize(16);
      pdf.text('CreditSetu — Application Summary', 20, 20);
      pdf.addImage(imgData, 'PNG', 0, 30, imgWidth, imgHeight);
      pdf.save(`${scheme.scheme_code}_Summary.pdf`);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('PDF generation failed. Try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 relative">
        <PageBackdrop variant="results" />
        <div className="relative z-10">
        <div className="mb-8">
          <div className="h-8 w-64 bg-white/10 rounded skeleton mb-2" />
          <div className="h-4 w-48 bg-white/10 rounded skeleton" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.count === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center relative">
        <PageBackdrop variant="results" />
        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 mb-2">No Schemes Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          We couldn't find matching schemes for your profile. Try adjusting your inputs.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/get-started"
            className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors"
          >
            Try Again
          </Link>
          <Link
            to="/edit-profile"
            className="inline-flex items-center gap-2 border border-green-700 dark:border-green-600 text-green-700 dark:text-green-300 px-6 py-3 rounded-xl font-semibold hover:bg-green-700/5 dark:hover:bg-green-500/10 transition-colors"
          >
            <Pencil className="w-4 h-4" /> Edit Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative">
      <PageBackdrop variant="results" />
      <div className="relative z-10">
      <ScrollReveal className="mb-6">
        <div className="bg-green-50 dark:bg-[#0e1a13]/40 border border-green-200 dark:border-green-800/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              You qualify for {recommendations.count} of {recommendations.total_considered}+ government schemes
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {recommendations.recommendations.filter(r => r.approval_probability >= 60).length} schemes have 60%+ approval probability
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Header */}
      <ScrollReveal className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-slate-900 dark:text-white">{t('results.title')}</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Found {recommendations.count} matching schemes for you
            </p>
          </div>
          {/* Let users refine their criteria and re-rank the schemes at any time */}
          <Link
            to="/edit-profile"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-green-700 dark:border-green-600 text-green-700 dark:text-green-300 text-sm font-semibold hover:bg-green-700/5 dark:hover:bg-green-500/10 transition-colors shrink-0"
          >
            <Pencil className="w-4 h-4" /> Edit Details
          </Link>
        </div>
      </ScrollReveal>

      {/* Hero image — Indian small-business context */}
      <ScaleCard className="mb-6 relative rounded-2xl overflow-hidden h-56 sm:h-64 w-full border border-black/5 dark:border-white/10">
        <img
          src="https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=75"
          alt="Scene from India — the families and small enterprises these government credit schemes serve"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
        <div className="relative z-10 p-4 text-sm text-white dark:text-slate-300 max-w-xl">
          <p>Government credit schemes are designed to help micro-, small and medium enterprises, self-employed workers, students and farmers like these across India.</p>
        </div>
      </ScaleCard>

      {/* Scheme Cards — rendered in pages for large result sets */}
      <div className="space-y-6">
        {recommendations.recommendations.slice(0, visibleCount).map((scheme, i) => (
          <ScrollReveal
            key={scheme.scheme_id}
            delay={i * 0.12}
            amount={0.15}
            once={true}
          >
            {/* `m-card` only takes effect below 768px: a glass surface plus a
                glowing border while tapped. Desktop keeps the plain card. */}
            <div
              id={`scheme-${scheme.scheme_id}`}
              className="m-card tap-spring bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 overflow-hidden mi-lift mi-glow"
            >
            {/* Card Header */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getLabelColor(scheme.recommendation_label)}`}>
                      {scheme.recommendation_label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {scheme.scheme_code}
                    </span>
                    {scheme.widely_eligible && (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        Widely eligible
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-1">
                    {scheme.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    {scheme.description}
                  </p>
                </div>

                {/* Probability Badge */}
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ${getProbabilityColor(scheme.approval_probability)}`}>
                    {scheme.approval_probability}%
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t('results.probability')}
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              {/* Score Breakdown */}
              {scheme.breakdown && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Score Breakdown</p>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                    {Object.entries(scheme.breakdown).map(([label, f]) => (
                      <div key={label} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400">{label}</span>
                        <span className="text-slate-600 dark:text-slate-400 font-medium">{f.pts}/{f.max}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-white/10 dark:border-white/10">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('results.amount_range')}</span>
                  <span className="font-semibold text-green-900 dark:text-green-300 text-sm">{scheme.amount_range.display}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    {scheme.is_loan ? t('results.interest_rate') : 'Benefit'}
                  </span>
                  <span className="font-semibold text-green-900 dark:text-green-300 text-sm">
                    {scheme.is_loan
                      ? `${scheme.interest_rate}% p.a.`
                      : scheme.subsidy_percentage > 0 ? 'Subsidy / support' : 'Non-monetary'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('results.tenure')}</span>
                  <span className="font-semibold text-green-900 dark:text-green-300 text-sm">
                    {scheme.is_loan && scheme.tenure_range.max_months > 0
                      ? `${scheme.tenure_range.min_months}–${scheme.tenure_range.max_months} months`
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('results.moratorium')}</span>
                  <span className="font-semibold text-green-900 dark:text-green-300 text-sm">
                    {scheme.is_loan ? `${scheme.moratorium_months} months` : '—'}
                  </span>
                </div>
              </div>

              {scheme.subsidy_percentage > 0 && (
                <div className="mt-3 inline-flex items-center gap-1 bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  {scheme.subsidy_percentage}% Government Subsidy
                </div>
              )}
            </div>

            {/* Expandable Sections */}
            <div className="border-t border-slate-100 dark:border-white/10">
              {/* Documents */}
              <button
                onClick={() => setExpandedScheme(expandedScheme === scheme.scheme_id ? null : scheme.scheme_id)}
                className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('results.documents')} ({scheme.required_documents.length})
                </span>
                {expandedScheme === scheme.scheme_id ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {expandedScheme === scheme.scheme_id && (
                <div className="px-6 pb-4">
                  <p className="text-xs font-medium text-slate-500 mb-2">Check the documents you already have:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {scheme.required_documents.map((doc, j) => (
                      <label key={j} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg p-1.5 transition-colors">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-green-700 focus:ring-green-700" />
                        <CheckCircle className="w-3 h-3 text-green-700 flex-shrink-0" />
                        {doc}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* EMI Calculator Section */}
            {showEMI === scheme.scheme_id && (
              <div className="px-6 pb-6 border-t border-slate-100 dark:border-white/10">
                <EMICalculator
                  scheme={scheme}
                  onClose={() => setShowEMI(null)}
                />
              </div>
            )}

            {/* Score Breakdown + Share */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">Source: {scheme.source === 'myscheme' ? 'myScheme.gov.in' : scheme.source === 'jansamarth' ? 'JanSamarth.in' : 'Verified Data'}</span>
              <ShareButton scheme={scheme} />
            </div>

            {/* Official Portal Links */}
            {scheme.live_url && (
              <div className="px-6 py-3 border-t border-slate-100 dark:border-white/10 bg-green-50/50 dark:bg-green-950/25">
                <p className="text-xs text-green-700 dark:text-green-300 font-medium mb-2 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> View on Official Government Portals
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href={scheme.live_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-700 text-white rounded-lg text-xs font-medium hover:bg-green-800 transition-colors">
                    <ExternalLink className="w-3 h-3" /> View on myScheme
                  </a>
                  <a href="https://www.jansamarth.in" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-900 text-white rounded-lg text-xs font-medium hover:bg-green-800 transition-colors">
                    <ExternalLink className="w-3 h-3" /> Apply on JanSamarth
                  </a>
                  {scheme.ministry && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                      {scheme.ministry}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 px-6 py-4 bg-slate-50 dark:bg-white/5">
              {scheme.is_loan && (
                <button
                  onClick={() => setShowEMI(showEMI === scheme.scheme_id ? null : scheme.scheme_id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-900 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  {t('results.calculate_emi')}
                </button>
              )}
              <Link
                to="/find-bank"
                className="flex items-center gap-1.5 px-4 py-2 border border-green-700 text-green-700 dark:border-green-600 dark:text-green-300 rounded-lg text-sm font-medium hover:bg-green-700/5 dark:hover:bg-green-500/10 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                {t('results.find_bank')}
              </Link>
              <button
                onClick={() => handleDownloadPDF(scheme)}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 dark:border-white/20 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                {t('results.download_pdf')}
              </button>
            </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {visibleCount < recommendations.recommendations.length && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisibleCount((c) => c + 6)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors"
          >
            Show more schemes ({recommendations.recommendations.length - visibleCount} remaining)
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Glossary Section */}
      <ScrollReveal className="mt-12" delay={0.2}>
        <h2 className="text-2xl font-bold text-green-900 dark:text-white mb-6 flex items-center gap-2">
          <Info className="w-6 h-6 text-green-700" />
          Financial Glossary
        </h2>
        <Glossary />
      </ScrollReveal>
      </div>
    </div>
  );
}
