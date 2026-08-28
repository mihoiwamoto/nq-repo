import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { BasicAuth } from './components/BasicAuth'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BasicAuth>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </BasicAuth>
  </StrictMode>,
)
