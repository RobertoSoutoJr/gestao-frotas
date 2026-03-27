import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Setup offline GPS queue auto-sync
import { setupAutoSync } from './lib/offlineQueue';
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
setupAutoSync(apiBase + '/viagens');
