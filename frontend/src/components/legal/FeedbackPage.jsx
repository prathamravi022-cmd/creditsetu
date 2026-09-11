import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FeedbackPage() {
  const [form, setForm] = useState({
    name: '', email: '', category: 'general', message: '', applicationId: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim() || form.message.length < 10) {
      toast.error('Please describe your feedback (minimum 10 characters)');
      return;
    }
    setLoading(true);
    // Mock submission
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
    toast.success('Feedback submitted! We will respond within 48 hours.');
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-700" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Thank You!</h2>
          <p className="text-slate-600 mb-6">
            Your feedback has been submitted successfully. Our team will review it and respond within 48 hours.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Reference: FB-{Date.now().toString(36).toUpperCase()}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-900">Feedback & Grievance</h1>
        </div>
        <p className="text-slate-500 mb-8 ml-13">
          Report issues, share feedback, or raise grievances about your application or the Platform.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>For urgent application issues:</strong> Contact your assigned bank directly or use the
            in-app Grievance Modal (bottom-left button) for faster response.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name (Optional)</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-700/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-700/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-700 outline-none"
            >
              <option value="general">General Feedback</option>
              <option value="bug">Bug Report</option>
              <option value="application">Application Issue</option>
              <option value="scheme">Scheme Clarification</option>
              <option value="bank">Bank/Partner Behavior</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Application ID (if applicable)</label>
            <input
              type="text"
              value={form.applicationId}
              onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
              placeholder="APP-YYYYMMDD-XXXX"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-700 outline-none font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              placeholder="Describe your feedback, issue, or grievance in detail..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-700/20 outline-none resize-none"
              required
              minLength={10}
            />
            <p className="text-xs text-slate-400 mt-1">{form.message.length}/2000 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Feedback
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-slate-500 space-y-1">
          <p><strong>Grievance Officer:</strong> grievance@govtech-scheme.in</p>
          <p><strong>Helpline:</strong> 1800-XXX-XXXX (Toll Free, Mon–Sat 9AM–6PM)</p>
          <p><strong>Resolution Time:</strong> Within 7 working days</p>
        </div>
      </div>
    </div>
  );
}
