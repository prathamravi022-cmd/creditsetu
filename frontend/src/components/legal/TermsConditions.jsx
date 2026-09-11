import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-900">Terms & Conditions</h1>
        </div>

        <p className="text-sm text-slate-500 mb-8">Last updated: August 2024 | Effective immediately</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using GovTech Scheme Finder ("the Platform"), you agree to be bound by these
              Terms & Conditions. If you do not agree, please do not use the Platform. This Platform is
              developed for the Smart India Hackathon (PS 26092) under the Ministry of Social Justice and
              Empowerment, Government of India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">2. Eligibility</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Platform is designed for Indian citizens seeking government credit schemes.</li>
              <li>Primary beneficiaries: SC/ST/Women entrepreneurs with annual family income ≤ ₹5.00 Lakhs.</li>
              <li>You must be at least 18 years of age to use the Platform.</li>
              <li>You must provide accurate and truthful information during registration and application.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">3. Platform Usage</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Platform provides scheme recommendations based on rule-based matching — not guaranteed approvals.</li>
              <li>Approval Probability Scores are indicative and do not guarantee loan sanctioning.</li>
              <li>EMI calculations are estimates; actual terms may vary by lending institution.</li>
              <li>Users are responsible for verifying all information before submitting applications.</li>
              <li>The Platform is not a lending institution and does not disburse funds.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">4. User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate personal, financial, and location information.</li>
              <li>Do not attempt to circumvent authentication or access restricted areas.</li>
              <li>Do not use the Platform for any fraudulent or illegal purpose.</li>
              <li>Keep your login credentials secure and do not share them.</li>
              <li>Report any security vulnerabilities or suspicious activity immediately.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">5. Intellectual Property</h2>
            <p>
              The Platform, its design, code, and content are intellectual property of the development team
              created for the Smart India Hackathon. Government scheme data and logos are property of their
              respective owners. The Platform is released under open-source terms for government use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">6. Limitation of Liability</h2>
            <p>
              The Platform is provided "as is" without warranties. We are not responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Loan application outcomes or rejection decisions made by banks/NBFCs.</li>
              <li>Delays in processing or disbursement by Channel Finance Partners.</li>
              <li>Accuracy of third-party data (interest rates, scheme criteria) that may change.</li>
              <li>Service interruptions due to maintenance or technical issues.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">7. Grievance Redressal</h2>
            <p>
              For complaints or disputes:
              <br /><strong>Step 1:</strong> Use the in-app Grievance Modal (bottom-left button).
              <br /><strong>Step 2:</strong> Email grievance@govtech-scheme.in with your application number.
              <br /><strong>Step 3:</strong> Escalate to the Grievance Officer within 30 days.
              <br /><strong>Resolution Time:</strong> We aim to resolve grievances within 7 working days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-green-900 mb-3">8. Modifications</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the Platform after
              changes constitutes acceptance. Material changes will be prominently displayed.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
