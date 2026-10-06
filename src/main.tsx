import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { configureHttp } from '@/api/axios'
import { store } from '@/store'
import { credentialsReceived, loggedOut } from '@/store/slices/authSlice'
import App from './App'
import './index.css'

// Connect the HTTP client to the auth store (token in memory, refresh via httpOnly cookie).
configureHttp({
  getAccessToken: () => store.getState().auth.accessToken,
  onTokenRefreshed: (auth) => store.dispatch(credentialsReceived(auth)),
  onSessionExpired: () => store.dispatch(loggedOut()),
})

document.documentElement.dataset.theme = store.getState().preferences.theme

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
