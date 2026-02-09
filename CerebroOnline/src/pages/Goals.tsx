import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/api/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Plus, Calendar, TrendingUp, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GoalCard, Goal } from '@/components/features/GoalCard'
import { AddGoalDialog, NewGoal } from '@/components/features/AddGoalDialog'
import { startOfWeek, startOfMonth, format, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { useAuth } from '@/providers/auth-provider'

type PeriodType = 'weekly' | 'monthly'

export default function Goals() {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState<PeriodType>('weekly')
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
    const [currentMonthOffset, setCurrentMonthOffset] = useState(0)

    // Calculate period start dates
    const weekStart = useMemo(() => {
        const base = startOfWeek(new Date(), { weekStartsOn: 1 })
        return currentWeekOffset === 0 ? base : 
            currentWeekOffset > 0 ? addWeeks(base, currentWeekOffset) : subWeeks(base, Math.abs(currentWeekOffset))
    }, [currentWeekOffset])

    const monthStart = useMemo(() => {
        const base = startOfMonth(new Date())
        return currentMonthOffset === 0 ? base :
            currentMonthOffset > 0 ? addMonths(base, currentMonthOffset) : subMonths(base, Math.abs(currentMonthOffset))
    }, [currentMonthOffset])

    const currentPeriodStart = activeTab === 'weekly' ? weekStart : monthStart

    // Fetch goals
    const { data: goals = [], isLoading } = useQuery<Goal[]>({
        queryKey: ['goals', activeTab, currentPeriodStart.toISOString()],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('goals')
                .select('*')
                .eq('period_type', activeTab)
                .eq('period_start', format(currentPeriodStart, 'yyyy-MM-dd'))
                .order('created_at', { ascending: false })

            if (error) throw error
            return (data as Goal[]) || []
        }
    })

    // Create goal mutation
    const createGoal = useMutation({
        mutationFn: async (newGoal: NewGoal) => {
            if (!user?.id) throw new Error('Usuário não autenticado')

            console.log('Criando meta:', { ...newGoal, user_id: user.id })

            const { error, data } = await (supabase as any).from('goals').insert({
                ...newGoal,
                user_id: user.id,
                period_type: activeTab,
                period_start: format(currentPeriodStart, 'yyyy-MM-dd'),
                current: 0
            }).select()

            if (error) {
                console.error('Erro Supabase:', error)
                throw error
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goals'] })
            toast.success('Meta criada! 🎯')
        },
        onError: (error: any) => {
            console.error('Erro ao criar meta:', error)
            toast.error('Erro ao criar meta: ' + (error.message || 'Erro desconhecido'))
        }
    })

    // Update goal mutation
    const updateGoal = useMutation({
        mutationFn: async ({ id, current }: { id: string; current: number }) => {
            const { error } = await (supabase as any).from('goals').update({ current }).eq('id', id)
            if (error) throw error
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['goals'] })
            const goal = goals.find(g => g.id === variables.id)
            if (goal && variables.current >= goal.target) {
                toast.success('🎉 Meta alcançada! Parabéns!')
            }
        },
        onError: () => toast.error('Erro ao atualizar')
    })

    // Delete goal mutation
    const deleteGoal = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any).from('goals').delete().eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goals'] })
            toast.success('Meta removida')
        },
        onError: () => toast.error('Erro ao remover')
    })

    // Stats
    const completedGoals = goals.filter(g => g.current >= g.target).length
    const totalProgress = goals.length > 0 
        ? Math.round(goals.reduce((acc, g) => acc + Math.min(g.current / g.target, 1), 0) / goals.length * 100)
        : 0

    const getPeriodLabel = () => {
        if (activeTab === 'weekly') {
            const weekEnd = addWeeks(weekStart, 1)
            return `${format(weekStart, "d 'de' MMM", { locale: ptBR })} - ${format(weekEnd, "d 'de' MMM", { locale: ptBR })}`
        }
        return format(monthStart, "MMMM 'de' yyyy", { locale: ptBR })
    }

    const navigatePeriod = (direction: 'prev' | 'next') => {
        if (activeTab === 'weekly') {
            setCurrentWeekOffset(prev => direction === 'next' ? prev + 1 : prev - 1)
        } else {
            setCurrentMonthOffset(prev => direction === 'next' ? prev + 1 : prev - 1)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Clean Header */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2.5 bg-slate-100 rounded-xl">
                                <Target className="h-6 w-6 text-slate-700" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Minhas Metas</h1>
                                <p className="text-slate-500 text-sm">Acompanhe seu progresso</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Pills */}
                    <div className="flex gap-3">
                        <div className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
                            <p className="text-slate-400 text-[10px] uppercase tracking-wider">Progresso</p>
                            <p className="text-xl font-bold text-slate-800">{totalProgress}%</p>
                        </div>
                        <div className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
                            <p className="text-slate-400 text-[10px] uppercase tracking-wider">Concluídas</p>
                            <p className="text-xl font-bold text-slate-800">{completedGoals}/{goals.length}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tabs + Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-3">
                {/* Period Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                    {(['weekly', 'monthly'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                activeTab === tab
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            {tab === 'weekly' ? <Calendar className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                            {tab === 'weekly' ? 'Semanais' : 'Mensais'}
                        </button>
                    ))}
                </div>

                {/* Period Navigation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigatePeriod('prev')}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium text-slate-700 capitalize min-w-[160px] text-center">
                        {getPeriodLabel()}
                    </span>
                    <button
                        onClick={() => navigatePeriod('next')}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Goals List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {goals.map((goal, index) => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            index={index}
                            onIncrement={() => updateGoal.mutate({ id: goal.id, current: goal.current + 1 })}
                            onDecrement={() => updateGoal.mutate({ id: goal.id, current: Math.max(0, goal.current - 1) })}
                            onEdit={() => setEditingGoal(goal)}
                            onDelete={() => deleteGoal.mutate(goal.id)}
                        />
                    ))}
                </AnimatePresence>

                {/* Empty State */}
                {!isLoading && goals.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
                    >
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                            <Sparkles className="h-7 w-7 text-slate-400" />
                        </div>
                        <p className="font-semibold text-slate-600 text-lg">Nenhuma meta ainda</p>
                        <p className="text-sm text-slate-400 mt-1 mb-6">
                            Crie sua primeira meta {activeTab === 'weekly' ? 'semanal' : 'mensal'}
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsAddDialogOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium shadow-sm hover:bg-slate-800 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            Criar Meta
                        </motion.button>
                    </motion.div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-pulse text-slate-400">Carregando metas...</div>
                    </div>
                )}
            </div>

            {/* Floating Add Button */}
            {goals.length > 0 && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddDialogOpen(true)}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-slate-800 transition-all z-40"
                >
                    <Plus className="h-6 w-6" />
                </motion.button>
            )}

            {/* Add/Edit Dialog */}
            <AddGoalDialog
                isOpen={isAddDialogOpen || !!editingGoal}
                onClose={() => {
                    setIsAddDialogOpen(false)
                    setEditingGoal(null)
                }}
                onSave={(goal) => createGoal.mutate(goal)}
                periodType={activeTab}
            />
        </div>
    )
}
