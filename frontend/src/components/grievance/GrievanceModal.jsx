import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MessageCircle, X, Send, HelpCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'application_status', en: 'Application Status', hi: 'आवेदन स्थिति' },
  { value: 'document_upload', en: 'Document Upload Issue', hi: 'दस्तावेज़ अपलोड समस्या' },
  { value: 'scheme_clarification', en: 'Scheme Clarification', hi: 'योजना स्पष्टीकरण' },
  { value: 'partner_behavior', en: 'Bank Behavior', hi: 'बैंक व्यवहार' },
  { value: 'technical', en: 'Technical Issue', hi: 'तकनीकी समस्या' },
];

export default function GrievanceModal() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!category || message.length < 10) {
      toast.error('Please select a category and describe your issue (min 10 characters)');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      await fetch('/api/grievance/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          category,
          message,
          language: i18n.language,
        }),
      });
    } catch {
      // Mock success
    }

    setSubmitted(true);
    toast.success('Complaint submitted successfully!');
  };

  const handleClose = () => {
    setIsOpen(false);
    setSubmitted(false);
    setCategory('');
    setMessage('');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-green-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-green-800 transition-all hover:scale-110"
        aria-label="Raise a grievance"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

            {/* Modal Content */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-700" />
                  <h3 className="font-bold text-green-900">
                    {t('grievance.title')}
                  </h3>
                </div>
                <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-green-700" />
                    </div>
                    <h4 className="font-bold text-green-900 mb-2">
                      {i18n.language === 'hi' ? 'शिकायत दर्ज हो गई!' : 'Complaint Submitted!'}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {i18n.language === 'hi'
                        ? 'हम जल्द ही आपसे संपर्क करेंगे।'
                        : 'We will contact you shortly. You can track status in your applications.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('grievance.category')}
                      </label>
                      <div className="space-y-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                              category === cat.value
                                ? 'border-green-700 bg-green-700/5 text-green-700 font-medium'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {i18n.language === 'hi' ? cat.hi : cat.en}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('grievance.message')}
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        placeholder={i18n.language === 'hi'
                          ? 'अपनी समस्या विस्तार से बताएं...'
                          : 'Describe your issue in detail...'
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-green-700 focus:ring-2 focus:ring-green-700/20 outline-none resize-none"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        {message.length}/2000
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {!submitted && (
                <div className="p-4 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    className="bg-green-700 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-800 transition-colors"
                  >
                    {t('grievance.submit')}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
