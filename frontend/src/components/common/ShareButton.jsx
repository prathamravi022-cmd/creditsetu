import React from 'react';
import { Share2, MessageCircle, Copy } from 'lucide-react';

export default function ShareButton({ scheme }) {
  const shareText = scheme
    ? `Check out this scheme: ${scheme.name} - Interest: ${scheme.interestRate}, Amount: ${scheme.amountRange}. Apply at CreditSetu!`
    : 'CreditSetu - AI-Driven Government Scheme Finder for Marginalized Entrepreneurs';
  const shareUrl = window.location.href;

  const handleWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  const handleSMS = () => window.open(`sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  const handleCopy = () => { navigator.clipboard.writeText(shareText + ' ' + shareUrl); alert('Link copied!'); };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={handleWhatsApp} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
        <MessageCircle className="w-4 h-4" /> WhatsApp
      </button>
      <button onClick={handleSMS} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
        <Share2 className="w-4 h-4" /> SMS
      </button>
      <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors">
        <Copy className="w-4 h-4" /> Copy Link
      </button>
    </div>
  );
}
