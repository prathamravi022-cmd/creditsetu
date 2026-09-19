import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff, Home } from 'lucide-react';
import PageBackdrop from '../art/PageBackdrop';

export default function ForbiddenPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 relative">
      <PageBackdrop variant="admin" />
      <div className="text-center max-w-md relative z-10">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <ShieldOff className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-5xl font-bold text-red-600 mb-2">403</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-3">
          Access Denied
        </h2>
        <p className="text-slate-500 mb-6 leading-relaxed">
          You do not have permission to access the Admin Panel.
          Admin access is restricted to authorized personnel only.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          <strong>Unauthorized access is logged.</strong>
          <br />
          This attempt has been recorded for security purposes.
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors"
        >
          <Home className="w-4 h-4" />
          Go to Beneficiary Portal
        </Link>
      </div>
    </div>
  );
}
