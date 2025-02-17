import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import App from './app';

import { Toaster } from '@/components/ui/sonner';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider storageKey="vite-ui-theme">
      <App />
      <Toaster richColors closeButton position="top-center" />
    </ThemeProvider>
  </React.StrictMode>
);
