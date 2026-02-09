import { motion, AnimatePresence } from 'framer-motion'
import { X, Pencil, Trash2, Flame, Calendar, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GoalCompletionCalendar } from './GoalCompletionCalendar'
import type { Goal } from './GoalCard'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface GoalDetailViewProps {
    goal: Goal | null
    isOpen: boolean
    onClose: () => void
    onEdit: () => void
    onDelete: () => void
    completedDates: Date[]
    onToggleDate: (date: Date) => void
}

export function GoalDetailView({
    goal,
    isOpen,
    onClose,
    onEdit,
    onDelete,
    completedDates,
    onToggleDate
}: GoalDetailViewProps) {
    if (!goal) return null

    const isComplete = goal.current >= goal.target
    const percentage = Math.min((goal.current / goal.target) * 100, 100)

    // Calculate best streak from completedDates
    const calculateBestStreak = () => {
        if (completedDates.length === 0) return 0
        
        const sortedDates = [...completedDates].sort((a, b) => a.getTime() - b.getTime())
        let bestStreak = 1
        let currentStreak = 1
        
        for (let i = 1; i < sortedDates.length; i++) {
            const diffDays = Math.floor((sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (1000 * 60 * 60 * 24))
            if (diffDays === 1) {
                currentStreak++
                bestStreak = Math.max(bestStreak, currentStreak)
            } else {
                currentStreak = 1
            }
        }
        
        return bestStreak
    }

    const bestStreak = calculateBestStreak()

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[70] overflow-y-auto pointer-events-none">
                        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="w-full max-w-md pointer-events-auto"
                            >
                                <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border">
                                    {/* Header */}
                                    <div className={cn(
                                        "relative px-6 py-7",
                                        isComplete 
                                            ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                            : "bg-gradient-to-br from-slate-800 to-slate-900"
                                    )}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                                                    {goal.emoji}
                                                </div>
                                                <div className="text-white">
                                                    <h2 className="font-bold text-xl">{goal.title}</h2>
                                                    <p className="text-white/70 text-sm mt-0.5">
                                                        {goal.period_type === 'daily' ? 'Meta Diária' : (goal.period_type === 'weekly' ? 'Meta Semanal' : 'Meta Mensal')}
                                                    </p>
                                                    {isComplete && (
                                                        <motion.span 
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium"
                                                        >
                                                            🎉 Meta Alcançada!
                                                        </motion.span>
                                                    )}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={onClose}
                                                className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {/* Progress indicator */}
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between text-white/90 mb-2">
                                                <span className="text-sm font-medium">{goal.current} de {goal.target} {goal.unit}</span>
                                                <span className="text-sm font-bold">{Math.round(percentage)}%</span>
                                            </div>
                                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                                    className="h-full bg-white rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="px-6 py-5 space-y-6">
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-muted/50 rounded-xl p-3 text-center">
                                                <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                                                    <Flame className="h-4 w-4 text-amber-500" />
                                                </div>
                                                <p className="text-lg font-bold text-foreground">{completedDates.length}</p>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Dias feitos</p>
                                            </div>
                                            <div className="bg-muted/50 rounded-xl p-3 text-center">
                                                <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                                                    <TrendingUp className="h-4 w-4 text-orange-500" />
                                                </div>
                                                <p className="text-lg font-bold text-foreground">{bestStreak}</p>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Melhor Streak</p>
                                            </div>
                                            <div className="bg-muted/50 rounded-xl p-3 text-center">
                                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                </div>
                                                <p className="text-lg font-bold text-foreground">
                                                    {format(new Date(goal.period_start), 'dd/MM', { locale: ptBR })}
                                                </p>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Início</p>
                                            </div>
                                        </div>

                                        {/* Calendar */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Registro de Atividade
                                            </h3>
                                            <GoalCompletionCalendar
                                                completedDates={completedDates}
                                                onToggleDate={onToggleDate}
                                                periodType={goal.period_type}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="px-6 py-4 bg-muted/30 border-t border-border flex gap-3">
                                        <button
                                            onClick={onEdit}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Editar
                                        </button>
                                        <button
                                            onClick={onDelete}
                                            className="px-4 py-2.5 bg-destructive/10 text-destructive rounded-xl font-medium hover:bg-destructive/20 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
