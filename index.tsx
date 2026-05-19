
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './lib/theme';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker for offline support and updates
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Uma nova atualização do sistema está disponível. Deseja recarregar a página para aplicar?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
