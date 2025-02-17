import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import App from './App';

import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
