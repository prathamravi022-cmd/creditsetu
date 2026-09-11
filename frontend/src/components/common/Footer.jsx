import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-green-900 dark:bg-gray-950 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">CreditSetu Scheme Finder</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t('footer.disclaimer')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3 text-slate-300">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/get-started" className="hover:text-white transition-colors">Check Eligibility</Link></li>
              <li><Link to="/find-bank" className="hover:text-white transition-colors">Find a Bank</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3 text-slate-300">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/feedback" className="hover:text-white transition-colors">Feedback / Grievance</Link></li>
              <li><Link to="/grievance" className="hover:text-white transition-colors">Report an Issue</Link></li>
            </ul>
          </div>

          {/* Ministry */}
          <div>
            <h3 className="font-semibold mb-3 text-slate-300">Ministry</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ministry of Social Justice & Empowerment<br />
              Government of India<br />
              Smart India Hackathon — PS 26092
            </p>
            <p className="text-xs text-slate-500 mt-3">
              Helpline: 1800-XXX-XXXX<br />
              (Toll Free, Mon–Sat 9AM–6PM)
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <span>{t('footer.made_with')}</span>
          <span>© 2024 CreditSetu Scheme Finder. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
