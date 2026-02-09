import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AddGoalDialogProps {
    isOpen: boolean
    onClose: () => void
    onSave: (goal: NewGoal) => void
    periodType: 'daily' | 'weekly' | 'monthly'
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
    const [title, setTitle] = useState('')
    const [emoji, setEmoji] = useState('🎯')
    const [target, setTarget] = useState(4)
    const [unit, setUnit] = useState('dias')

    // Sync state when editingGoal changes
    useEffect(() => {
        if (editingGoal) {
            setTitle(editingGoal.title)
            setEmoji(editingGoal.emoji)
            setTarget(editingGoal.target)
            setUnit(editingGoal.unit)
        } else {
            setTitle('')
            setEmoji('🎯')
            setTarget(4)
            setUnit('dias')
        }
    }, [editingGoal])

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
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
                    />

                    {/* Dialog Container */}
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md pointer-events-auto"
                        >
                            <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
                                {/* Header */}
                                <div className="relative px-6 py-5 bg-muted/50 border-b border-border">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                                <Target className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-lg text-foreground">
                                                    {editingGoal ? 'Editar Meta' : 'Nova Meta'}
                                                </h2>
                                                <p className="text-muted-foreground text-sm">
                                                    {periodType === 'weekly' ? 'Meta Semanal' : 'Meta Mensal'}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={onClose}
                                            className="h-8 w-8 rounded-full"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-6">
                                    {/* Emoji Selector */}
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-3 block">
                                            Escolha um ícone
                                        </label>
                                        <div className="grid grid-cols-6 gap-2">
                                            {emojiOptions.map((e) => (
                                                <motion.button
                                                    key={e}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setEmoji(e)}
                                                    className={cn(
                                                        "w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all",
                                                        emoji === e
                                                            ? "bg-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-background"
                                                            : "bg-muted hover:bg-muted/80"
                                                    )}
                                                >
                                                    {e}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-2 block">
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
                                            <label className="text-sm font-medium text-foreground mb-2 block">
                                                Meta
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setTarget(Math.max(1, target - 1))}
                                                    className="w-10 h-10 rounded-xl"
                                                >
                                                    -
                                                </Button>
                                                <span className="flex-1 text-center text-xl font-bold text-foreground">
                                                    {target}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setTarget(target + 1)}
                                                    className="w-10 h-10 rounded-xl"
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-2 block">
                                                Unidade
                                            </label>
                                            <select
                                                value={unit}
                                                onChange={(e) => setUnit(e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            >
                                                {unitOptions.map((u) => (
                                                    <option key={u} value={u}>{u}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 bg-muted/30 border-t border-border flex gap-3">
                                    <Button 
                                        variant="outline" 
                                        onClick={onClose}
                                        className="flex-1 rounded-xl"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        onClick={handleSave}
                                        disabled={!title.trim()}
                                        className="flex-1 rounded-xl"
                                    >
                                        {editingGoal ? 'Salvar Alterações' : 'Criar Meta'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
