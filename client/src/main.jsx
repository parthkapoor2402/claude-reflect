import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getTheme } from './theme/themeStore'
import './index.css'
import App from './App.jsx'

document.documentElement.setAttribute('data-theme', getTheme())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
