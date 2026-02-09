import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AppProviders } from '@/providers/app-providers'
import { AuthProvider } from '@/providers/auth-provider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppProviders>
            <AuthProvider>
                <App />
            </AuthProvider>
        </AppProviders>
    </React.StrictMode>,
)
