import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SessionProvider } from './context/SessionContext'
import { getTheme } from './theme/themeStore'
import './index.css'
import App from './App.jsx'

document.documentElement.setAttribute('data-theme', getTheme())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionProvider>
      <App />
    </SessionProvider>
  </StrictMode>,
)
