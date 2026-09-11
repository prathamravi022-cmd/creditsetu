import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, X } from 'lucide-react';

const GLOSSARY_TERMS = [
  { key: 'moratorium' },
  { key: 'amortization' },
  { key: 'npa' },
  { key: 'subsidy' },
  { key: 'margin_money' },
  { key: 'bpl' },
];

export default function Glossary() {
  const { t } = useTranslation();
  const [openTerm, setOpenTerm] = useState(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {GLOSSARY_TERMS.map((term) => (
        <div key={term.key} className="relative">
          <button
            onClick={() => setOpenTerm(openTerm === term.key ? null : term.key)}
            className="w-full flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-green-700/30 transition-colors text-left"
          >
            <HelpCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-sm text-green-900 block">
                {t(`glossary.${term.key}.term`)}
              </span>
              <span className="text-xs text-slate-500 line-clamp-2">
                {t(`glossary.${term.key}.def`)}
              </span>
            </div>
          </button>

          {/* Expanded tooltip */}
          {openTerm === term.key && (
            <div className="absolute z-10 mt-2 left-0 right-0 bg-green-900 text-white p-4 rounded-xl shadow-xl animate-slide-down">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-sm">
                  {t(`glossary.${term.key}.term`)}
                </h4>
                <button
                  onClick={() => setOpenTerm(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-white/80 mt-2 leading-relaxed">
                {t(`glossary.${term.key}.def`)}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
