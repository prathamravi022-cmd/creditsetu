import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import PageBackdrop from '../art/PageBackdrop';

export default function Page404() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 relative">
      <PageBackdrop variant="notfound" />
      <div className="text-center relative z-10">
        <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-slate-400" />
        </div>
        <h1 className="text-6xl font-bold text-green-700 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors"
        >
          <Home className="w-4 h-4" />
          Go back to Home
        </Link>
      </div>
    </div>
  );
}
