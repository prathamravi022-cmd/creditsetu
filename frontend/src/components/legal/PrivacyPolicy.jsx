import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import PageBackdrop from '../art/PageBackdrop';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative">
      <PageBackdrop variant="legal" />
      <Link to="/" className="relative z-10 inline-flex items-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="glass-card rounded-2xl p-8 md:p-12 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-900">Privacy Policy</h1>
        </div>

        <p className="text-sm text-slate-500 mb-8">Last updated: August 2024 | Effective immediately</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">1. Introduction</h2>
            <p>
              This Privacy Policy describes how GovTech Scheme Finder ("the Platform"), developed for the
              Smart India Hackathon (Problem Statement 26092, Ministry of Social Justice and Empowerment),
              collects, uses, stores, and protects your personal information. We are committed to protecting
              your privacy in compliance with the Digital Personal Data Protection (DPDP) Act, 2023.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">2. Information We Collect</h2>
            <p>We collect the following categories of information:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Authentication Data:</strong> Mobile number, Google account profile (name, email, avatar) — collected only during login.</li>
              <li><strong>Demographic Data:</strong> Gender, age, social category (SC/ST/OBC/General), disability status — used for scheme eligibility matching.</li>
              <li><strong>Location Data:</strong> State, district, pincode, urban/rural classification — used for nearest bank routing.</li>
              <li><strong>Financial Data:</strong> Family annual income, BPL status, loan purpose, estimated project cost — used for scheme recommendation only.</li>
              <li><strong>Application Data:</strong> Loan applications, document checklists, EMI calculations — stored locally in your browser.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To match you with eligible government credit schemes.</li>
              <li>To calculate transparent EMI schedules and subsidy deductions.</li>
              <li>To locate the nearest eligible bank partner within your area.</li>
              <li>To route your application to the appropriate Channel Finance Partner.</li>
              <li>To send SMS status updates about your application (via Twilio, with your consent).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">4. Data Storage & Security</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Local Storage:</strong> Form data, matched schemes, and document checklists are stored in your browser's IndexedDB for offline access.</li>
              <li><strong>Session Storage:</strong> Current session data is stored in sessionStorage and cleared when you close the browser.</li>
              <li><strong>Server Storage:</strong> Application data is stored in encrypted PostgreSQL databases with PostGIS extension.</li>
              <li><strong>Encryption:</strong> All data is transmitted over HTTPS. Aadhaar numbers are encrypted and stored as redacted placeholders.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">5. Data Sharing</h2>
            <p>
              We share your data ONLY with:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The specific Channel Finance Partner (bank/NBFC) you apply to — limited to your application details.</li>
              <li>NSFDC/Ministry of Social Justice for aggregate analytics (anonymized).</li>
              <li>We NEVER sell, rent, or share your data with third-party advertisers or data brokers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">6. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of all data we hold about you.</li>
              <li><strong>Right to Correction:</strong> Update or correct your personal information.</li>
              <li><strong>Right to Deletion:</strong> Request deletion of your account and all associated data.</li>
              <li><strong>Right to Withdraw Consent:</strong> Opt out of SMS notifications at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">7. Grievance Officer</h2>
            <p>
              For any privacy-related concerns, contact our Grievance Officer:
              <br /><strong>Email:</strong> grievance@govtech-scheme.in
              <br /><strong>Phone:</strong> 1800-XXX-XXXX (Toll Free)
              <br /><strong>Response Time:</strong> Within 48 hours of receipt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Material changes will be notified via the Platform
              and/or SMS. Continued use constitutes acceptance of the updated policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
