import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  CheckCircle, Clock, AlertCircle, MapPin, Download,
  Calculator, FileText, ChevronDown, ChevronUp, Info,
  TrendingUp, Shield, Percent, IndianRupee, ExternalLink, Globe
} from 'lucide-react';
import EMICalculator from './EMICalculator';
import Glossary from './Glossary';
import ShareButton from '../common/ShareButton';
import SkeletonCard from './SkeletonCard';
import ScrollReveal from '../ui/ScrollReveal';
import PageBackdrop from '../art/PageBackdrop';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function getProbabilityColor(prob) {
  if (prob >= 80) return 'text-green-700 bg-green-100';
  if (prob >= 60) return 'text-green-700 bg-green-100';
  if (prob >= 40) return 'text-amber-700 bg-amber-100';
  return 'text-slate-600 bg-slate-100';
}

function getLabelColor(label) {
  switch (label) {
    case 'Highly Recommended': return 'bg-green-700 text-white';
    case 'Recommended': return 'bg-green-600 text-white';
    case 'Possible Match': return 'bg-amber-500 text-white';
    default: return 'bg-slate-400 text-white';
  }
}

export default function ResultsDashboard() {
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedScheme, setExpandedScheme] = useState(null);
  const [showEMI, setShowEMI] = useState(null);

  useEffect(() => {
    try {
      const data = sessionStorage.getItem('recommendations');
      if (data) {
        setRecommendations(JSON.parse(data));
      }
    } catch (e) {
      console.error('Failed to parse recommendations:', e);
    }
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

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
          <div className="h-8 w-64 bg-slate-200 rounded skeleton mb-2" />
          <div className="h-4 w-48 bg-slate-200 rounded skeleton" />
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
        <p className="text-slate-500 mb-6">
          We couldn't find matching schemes for your profile. Try adjusting your inputs.
        </p>
        <Link
          to="/get-started"
          className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors"
        >
          Try Again
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative">
      <PageBackdrop variant="results" />
      <div className="relative z-10">
      <ScrollReveal className="mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">
              You qualify for {recommendations.count} of 21+ government schemes
            </p>
            <p className="text-xs text-green-600">
              {recommendations.recommendations.filter(r => r.approval_probability >= 60).length} schemes have 60%+ approval probability
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Header */}
      <ScrollReveal className="mb-8">
        <h1 className="text-3xl font-bold text-green-900 mb-2">
          {t('results.title')}
        </h1>
        <p className="text-slate-500">
          Found {recommendations.count} matching schemes for you
        </p>
      </ScrollReveal>

      {/* Scheme Cards */}
      <div className="space-y-6">
        {recommendations.recommendations.map((scheme, i) => (
          <ScrollReveal
            key={scheme.scheme_id}
            delay={i * 0.12}
            amount={0.15}
            once={true}
          >
            <div
              id={`scheme-${scheme.scheme_id}`}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
            {/* Card Header */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getLabelColor(scheme.recommendation_label)}`}>
                      {scheme.recommendation_label}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {scheme.scheme_code}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-green-900 mb-1">
                    {scheme.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3">
                    {scheme.description}
                  </p>
                </div>

                {/* Probability Badge */}
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ${getProbabilityColor(scheme.approval_probability)}`}>
                    {scheme.approval_probability}%
                  </div>
                  <span className="text-xs text-slate-500 mt-1">
                    {t('results.probability')}
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              {/* Score Breakdown */}
              {scheme.approval_probability && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-medium text-slate-500 mb-2 uppercase tracking-wider">Score Breakdown</p>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                    {[
                      { label: 'Income', pts: Math.min(30, Math.round(scheme.approval_probability * 0.3)), max: 30 },
                      { label: 'Category', pts: Math.min(25, Math.round(scheme.approval_probability * 0.25)), max: 25 },
                      { label: 'Cost', pts: Math.min(20, Math.round(scheme.approval_probability * 0.2)), max: 20 },
                      { label: 'BPL', pts: Math.min(10, Math.round(scheme.approval_probability * 0.1)), max: 10 },
                      { label: 'Location', pts: Math.min(10, Math.round(scheme.approval_probability * 0.1)), max: 10 },
                      { label: 'Purpose', pts: Math.min(5, Math.round(scheme.approval_probability * 0.05)), max: 5 },
                    ].map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">{f.label}</span>
                        <span className="text-slate-600 font-medium">{f.pts}/{f.max}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 block">{t('results.amount_range')}</span>
                  <span className="font-semibold text-green-900 text-sm">{scheme.amount_range.display}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">{t('results.interest_rate')}</span>
                  <span className="font-semibold text-green-900 text-sm">{scheme.interest_rate}% p.a.</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">{t('results.tenure')}</span>
                  <span className="font-semibold text-green-900 text-sm">
                    {scheme.tenure_range.min_months}–{scheme.tenure_range.max_months} months
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">{t('results.moratorium')}</span>
                  <span className="font-semibold text-green-900 text-sm">
                    {scheme.moratorium_months} months
                  </span>
                </div>
              </div>

              {scheme.subsidy_percentage > 0 && (
                <div className="mt-3 inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  {scheme.subsidy_percentage}% Government Subsidy
                </div>
              )}
            </div>

            {/* Expandable Sections */}
            <div className="border-t border-slate-100">
              {/* Documents */}
              <button
                onClick={() => setExpandedScheme(expandedScheme === scheme.scheme_id ? null : scheme.scheme_id)}
                className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
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
                      <label key={j} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 rounded-lg p-1.5 transition-colors">
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
              <div className="px-6 pb-6 border-t border-slate-100">
                <EMICalculator
                  scheme={scheme}
                  onClose={() => setShowEMI(null)}
                />
              </div>
            )}

            {/* Score Breakdown + Share */}
            <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Source: {scheme.source === 'myscheme' ? 'myScheme.gov.in' : scheme.source === 'jansamarth' ? 'JanSamarth.in' : 'Verified Data'}</span>
              <ShareButton scheme={scheme} />
            </div>

            {/* Official Portal Links */}
            {scheme.live_url && (
              <div className="px-6 py-3 border-t border-slate-100 bg-green-50/50">
                <p className="text-xs text-green-700 font-medium mb-2 flex items-center gap-1">
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
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600">
                      {scheme.ministry}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 px-6 py-4 bg-slate-50">
              <button
                onClick={() => setShowEMI(showEMI === scheme.scheme_id ? null : scheme.scheme_id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-900 text-white rounded-lg text-sm font-medium hover:bg-green-900-light transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" />
                {t('results.calculate_emi')}
              </button>
              <Link
                to="/find-bank"
                className="flex items-center gap-1.5 px-4 py-2 border border-green-700 text-green-700 rounded-lg text-sm font-medium hover:bg-green-700/5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                {t('results.find_bank')}
              </Link>
              <button
                onClick={() => handleDownloadPDF(scheme)}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                {t('results.download_pdf')}
              </button>
            </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Glossary Section */}
      <ScrollReveal className="mt-12" delay={0.2}>
        <h2 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
          <Info className="w-6 h-6 text-green-700" />
          Financial Glossary
        </h2>
        <Glossary />
      </ScrollReveal>
      </div>
    </div>
  );
}
