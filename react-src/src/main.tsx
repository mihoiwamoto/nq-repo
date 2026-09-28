import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { BasicAuth } from './components/BasicAuth'
import { FrameBridge, installFrameBridge } from './frameBridge'

/* 画面設計キットの iframe に映すとき（?frame=1）：Basic 認証を通し、#hash を開く画面に読み替える */
installFrameBridge()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BasicAuth>
      {/* 画面設計キット向けに /react/ の下で配るとき（npm run build:kit）は、ルートもその下になる */}
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <FrameBridge />
        <App />
      </BrowserRouter>
    </BasicAuth>
  </StrictMode>,
)
