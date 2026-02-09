
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/providers/auth-provider'

export function LandingRedirect({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) return null

    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    return <>{children}</>
}
