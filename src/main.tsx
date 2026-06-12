import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@/hooks/useAuth'
import { MobileAppShell } from '@/components/MobileAppShell'
import { initNativeApp } from '@/lib/initNativeApp'

void initNativeApp()

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MobileAppShell>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MobileAppShell>
  </StrictMode>,
)
