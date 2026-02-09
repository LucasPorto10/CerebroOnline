import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GoalProgress } from './GoalProgress'

export interface Goal {
    id: string
    user_id: string
    title: string
    emoji: string
    target: number
    current: number
    unit: string
    period_type: 'weekly' | 'monthly'
    category: string | null
    period_start: string
    is_active: boolean
    created_at: string
    updated_at: string
}

interface GoalCardProps {
    goal: Goal
    onIncrement: () => void
    onDecrement: () => void
    onEdit: () => void
    onDelete: () => void
    index?: number
}

export function GoalCard({ 
    goal, 
    onIncrement, 
    onDecrement, 
    onEdit, 
    onDelete,
    index = 0 
}: GoalCardProps) {
    const isComplete = goal.current >= goal.target
    const percentage = Math.min((goal.current / goal.target) * 100, 100)

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
                "group relative bg-white rounded-2xl border p-5 transition-all hover:shadow-md",
                isComplete 
                    ? "border-emerald-200" 
                    : "border-slate-200 hover:border-slate-300"
            )}
        >
            {/* Celebration effect when complete */}
            {isComplete && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg"
                >
                    🎉
                </motion.div>
            )}

            <div className="flex items-center gap-4">
                {/* Progress Circle */}
                <GoalProgress 
                    current={goal.current} 
                    target={goal.target} 
                    size="md"
                    color={isComplete ? 'emerald' : 'slate'}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{goal.emoji}</span>
                        <h3 className={cn(
                            "font-semibold truncate",
                            isComplete ? "text-emerald-700" : "text-slate-800"
                        )}>
                            {goal.title}
                        </h3>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {goal.current} de {goal.target} {goal.unit}
                    </p>
                    
                    {/* Progress bar linear */}
                    <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={cn(
                                "h-full rounded-full",
                                isComplete ? "bg-emerald-500" : "bg-slate-800"
                            )}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-1 items-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onIncrement}
                        disabled={isComplete}
                        className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            isComplete 
                                ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                                : "bg-slate-900 text-white hover:bg-slate-800"
                        )}
                    >
                        <Plus className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onDecrement}
                        disabled={goal.current === 0}
                        className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            goal.current === 0 
                                ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                    >
                        <Minus className="h-5 w-5" />
                    </motion.button>
                </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={onEdit}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                    <Pencil className="h-4 w-4" />
                </button>
                <button 
                    onClick={onDelete}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    )
}
