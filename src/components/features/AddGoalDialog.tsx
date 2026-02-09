import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AddGoalDialogProps {
    isOpen: boolean
    onClose: () => void
    onSave: (goal: NewGoal) => void
    periodType: 'weekly' | 'monthly'
    editingGoal?: NewGoal & { id: string }
}

export interface NewGoal {
    title: string
    emoji: string
    target: number
    unit: string
    category: string | null
}

const emojiOptions = ['🏋️', '📚', '💧', '🧘', '🏃', '💤', '🥗', '✍️', '🎯', '💰', '🚀', '⏰']
const unitOptions = ['dias', 'vezes', 'horas', 'minutos', 'km', 'litros']

export function AddGoalDialog({ isOpen, onClose, onSave, periodType, editingGoal }: AddGoalDialogProps) {
    const [title, setTitle] = useState(editingGoal?.title || '')
    const [emoji, setEmoji] = useState(editingGoal?.emoji || '🎯')
    const [target, setTarget] = useState(editingGoal?.target || 4)
    const [unit, setUnit] = useState(editingGoal?.unit || 'dias')

    const handleSave = () => {
        if (!title.trim()) return
        onSave({ title, emoji, target, unit, category: null })
        setTitle('')
        setEmoji('🎯')
        setTarget(4)
        setUnit('dias')
        onClose()
    }

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

                    {/* Dialog Container to handle positioning and overflow */}
                    <div className="fixed inset-0 z-[70] overflow-y-auto pointer-events-none">
                        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="w-full max-w-md pointer-events-auto relative"
                            >
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="relative px-6 py-5 bg-slate-800">
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                            <Target className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="text-white">
                                            <h2 className="font-bold text-lg">
                                                {editingGoal ? 'Editar Meta' : 'Nova Meta'}
                                            </h2>
                                            <p className="text-white/60 text-sm">
                                                {periodType === 'weekly' ? 'Meta Semanal' : 'Meta Mensal'}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={onClose}
                                        className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-5">
                                {/* Emoji Selector */}
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                                        Escolha um ícone
                                    </label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {emojiOptions.map((e) => (
                                            <motion.button
                                                key={e}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setEmoji(e)}
                                                className={cn(
                                                    "w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all",
                                                    emoji === e
                                                        ? "bg-slate-100 ring-2 ring-slate-800 ring-offset-2"
                                                        : "bg-slate-50 hover:bg-slate-100"
                                                )}
                                            >
                                                {e}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                                        Nome da meta
                                    </label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ex: Treinar na academia"
                                        className="rounded-xl"
                                    />
                                </div>

                                {/* Target + Unit */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                                            Meta
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setTarget(Math.max(1, target - 1))}
                                                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                                            >
                                                -
                                            </motion.button>
                                            <span className="flex-1 text-center text-2xl font-bold text-slate-900">
                                                {target}
                                            </span>
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setTarget(target + 1)}
                                                className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800"
                                            >
                                                +
                                            </motion.button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                                            Unidade
                                        </label>
                                        <select
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                        >
                                            {unitOptions.map((u) => (
                                                <option key={u} value={u}>{u}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-slate-50 flex gap-3">
                                <Button 
                                    variant="ghost" 
                                    onClick={onClose}
                                    className="flex-1 rounded-xl"
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    onClick={handleSave}
                                    disabled={!title.trim()}
                                    className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800"
                                >
                                    {editingGoal ? 'Salvar' : 'Criar Meta'} 🎯
                                </Button>
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
