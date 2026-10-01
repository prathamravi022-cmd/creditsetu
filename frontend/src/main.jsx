import { ClerkProvider } from '@clerk/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import './i18n/config';
import './index.css';
// Imported after index.css on purpose: these wizard rules must win over
// Tailwind's preflight (which resets button backgrounds) regardless of
// specificity, and a plain @import at the top of index.css would land before it.
import './styles/wizard.css';
import './styles/eligibility.css';

// Register Service Worker
if ("serviceWorker" in navigator) { window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {})); }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f2440',
            color: '#f8fafc',
            borderRadius: '0.5rem',
          },
          success: {
            iconTheme: { primary: '#15803d', secondary: '#f8fafc' },
          },
        }}
      />
      <ClerkProvider afterSignOutUrl="/">
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>
);