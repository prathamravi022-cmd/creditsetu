import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IndianRupee, TrendingDown, Clock, Percent } from 'lucide-react';

export default function EMICalculator({ scheme, onClose }) {
  const { t } = useTranslation();

  const maxLoan = Math.min(
    scheme.amount_range.max,
    Number(sessionStorage.getItem('userForm')
      ? JSON.parse(sessionStorage.getItem('userForm')).estimated_project_cost || scheme.amount_range.max
      : scheme.amount_range.max)
  );

  const [principal, setPrincipal] = useState(
    Math.min(maxLoan, scheme.amount_range.max * 0.5)
  );
  const [tenure, setTenure] = useState(
    Math.min(scheme.tenure_range.max_months, 60)
  );
  const [moratorium, setMoratorium] = useState(scheme.moratorium_months);

  const calculation = useMemo(() => {
    const subsidy = principal * (scheme.subsidy_percentage / 100);
    const margin = principal * (scheme.margin_money_percentage / 100);
    const effectivePrincipal = principal - subsidy - margin;
    const r = scheme.interest_rate / (12 * 100);
    const n = tenure;

    let emi = 0;
    if (r > 0 && n > 0) {
      const factor = Math.pow(1 + r, n);
      emi = effectivePrincipal * r * factor / (factor - 1);
    }

    // Amortization schedule
    let balance = effectivePrincipal;
    let totalInterest = 0;
    const schedule = [];

    for (let month = 1; month <= n; month++) {
      const interest = balance * r;
      let principalPaid, emiPaid;

      if (month <= moratorium) {
        principalPaid = 0;
        emiPaid = 0;
        balance += interest;
      } else {
        emiPaid = emi;
        principalPaid = emiPaid - interest;
        if (principalPaid > balance) principalPaid = balance;
        balance -= principalPaid;
      }

      totalInterest += interest;

      schedule.push({
        month,
        emi: emiPaid,
        principal: principalPaid,
        interest,
        balance: Math.max(balance, 0),
        isMoratorium: month <= moratorium,
      });
    }

    const totalPayment = schedule.reduce((s, r) => s + r.emi, 0);

    return {
      emi,
      totalInterest,
      totalPayment,
      effectivePrincipal,
      subsidy,
      margin,
      schedule,
    };
  }, [principal, tenure, moratorium, scheme]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="pt-6">
      <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
        <IndianRupee className="w-5 h-5 text-green-700" />
        {t('results.emi_calculator')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Controls */}
        <div className="space-y-4">
          {/* Principal */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('results.project_cost')}: <span className="text-green-700 font-bold">{formatCurrency(principal)}</span>
            </label>
            <input
              type="range"
              min={scheme.amount_range.min}
              max={maxLoan}
              step={10000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-green-700"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{formatCurrency(scheme.amount_range.min)}</span>
              <span>{formatCurrency(maxLoan)}</span>
            </div>
          </div>

          {/* Tenure */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('results.tenure_months')}: <span className="text-green-700 font-bold">{tenure} months</span>
            </label>
            <input
              type="range"
              min={scheme.tenure_range.min_months}
              max={scheme.tenure_range.max_months}
              step={1}
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full accent-green-700"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{scheme.tenure_range.min_months} months</span>
              <span>{scheme.tenure_range.max_months} months</span>
            </div>
          </div>

          {/* Moratorium */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('results.moratorium_months')}: <span className="text-green-700 font-bold">{moratorium} months</span>
            </label>
            <input
              type="range"
              min={0}
              max={24}
              step={1}
              value={moratorium}
              onChange={(e) => setMoratorium(Number(e.target.value))}
              className="w-full accent-green-700"
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-slate-50 rounded-xl p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <span className="text-xs text-slate-500 block">{t('results.monthly_emi')}</span>
              <span className="text-xl font-bold text-green-700">{formatCurrency(calculation.emi)}</span>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <span className="text-xs text-slate-500 block">{t('results.total_interest')}</span>
              <span className="text-xl font-bold text-orange-600">{formatCurrency(calculation.totalInterest)}</span>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <span className="text-xs text-slate-500 block">{t('results.total_payment')}</span>
              <span className="text-lg font-bold text-green-900">{formatCurrency(calculation.totalPayment)}</span>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <span className="text-xs text-slate-500 block">{t('results.subsidy')}</span>
              <span className="text-lg font-bold text-green-600">−{formatCurrency(calculation.subsidy)}</span>
            </div>
          </div>

          {calculation.margin > 0 && (
            <div className="mt-3 text-xs text-slate-600 bg-white rounded-lg p-3 border border-slate-200">
              {t('results.margin_money')}: <strong>{formatCurrency(calculation.margin)}</strong> ({scheme.margin_money_percentage}%)
            </div>
          )}
        </div>
      </div>

      {/* Amortization Schedule (collapsible) */}
      <AmortizationTable schedule={calculation.schedule} />
    </div>
  );
}

function AmortizationTable({ schedule }) {
  const [expanded, setExpanded] = useState(false);
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (schedule.length === 0) return null;

  // Show first 6, last 2 if collapsed
  const visibleSchedule = expanded
    ? schedule
    : [...schedule.slice(0, 6), ...schedule.slice(-2)];

  return (
    <div className="mt-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-green-700 font-medium hover:underline mb-3"
      >
        {expanded ? 'Hide' : 'Show'} Amortization Schedule ({schedule.length} months)
      </button>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
              <th className="py-2 px-3">Month</th>
              <th className="py-2 px-3">EMI</th>
              <th className="py-2 px-3">Principal</th>
              <th className="py-2 px-3">Interest</th>
              <th className="py-2 px-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            {visibleSchedule.map((row, i) => (
              <tr
                key={row.month}
                className={`border-b border-slate-100 ${
                  row.isMoratorium ? 'bg-amber-50' : ''
                }`}
              >
                <td className="py-2 px-3 font-mono">
                  {row.month}
                  {row.isMoratorium && (
                    <span className="text-xs text-amber-600 ml-1">MR</span>
                  )}
                </td>
                <td className="py-2 px-3 font-medium">{formatCurrency(row.emi)}</td>
                <td className="py-2 px-3">{formatCurrency(row.principal)}</td>
                <td className="py-2 px-3 text-orange-600">{formatCurrency(row.interest)}</td>
                <td className="py-2 px-3">{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!expanded && schedule.length > 8 && (
        <p className="text-center text-xs text-slate-400 mt-2">... {schedule.length - 8} months hidden ...</p>
      )}
    </div>
  );
}
