import { ClerkProvider } from '@clerk/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './i18n/config';
import './index.css';

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
      <ClerkProvider 
        afterSignOutUrl="/"
        appearance={{
          variables: {
            colorPrimary: '#15803d',
            colorBackground: '#ffffff',
            colorText: '#1e293b',
            borderRadius: '0.75rem',
          },
          elements: {
            card: 'shadow-xl',
            formButtonPrimary: 'bg-green-700 hover:bg-green-800 text-white',
            socialButtonsBlockButton: 'border-slate-200 text-slate-700',
            headerTitle: 'text-slate-900',
            headerSubtitle: 'text-slate-500',
          }
        }}
      >
      <App />
    </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>
);
