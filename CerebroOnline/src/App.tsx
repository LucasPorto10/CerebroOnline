
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Shell } from '@/components/shared/shell'
import { Toaster } from 'sonner'
import AuthPage from '@/pages/Auth'
import Home from '@/pages/Home'
import { TaskView } from '@/components/views/TaskView'
import { CardView } from '@/components/views/CardView'
import { BoardView } from '@/components/views/BoardView'
import { KanbanView } from '@/components/views/KanbanView'
import { UniView } from '@/components/views/UniView'
import { CalendarView } from '@/components/views/CalendarView'
import { useAuth } from '@/providers/auth-provider'
import Settings from '@/pages/Settings'
import Goals from '@/pages/Goals'
import LandingPage from '@/pages/LandingPage'
import { LandingRedirect } from '@/components/shared/LandingRedirect'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth()

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Carregando...</div>

    if (!user) return <Navigate to="/auth" replace />

    return <>{children}</>
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingRedirect><LandingPage /></LandingRedirect>} />
                <Route path="/auth" element={<AuthPage />} />

                <Route element={
                    <ProtectedRoute>
                        <Shell />
                    </ProtectedRoute>
                }>
                    <Route path="dashboard" element={<Home />} />
                    <Route path="home" element={<TaskView categorySlug="home" />} />
                    <Route path="work" element={<CardView categorySlug="work" title="Trabalho" />} />
                    <Route path="uni" element={<UniView />} />
                    <Route path="ideas" element={<BoardView />} />
                    <Route path="kanban" element={<KanbanView />} />
                    <Route path="calendar" element={<CalendarView />} />
                    <Route path="goals" element={<Goals />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
            <Toaster />
        </Router>
    )
}

export default App
