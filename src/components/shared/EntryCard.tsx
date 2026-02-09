import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, Circle, Clock, CircleDot, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Database } from '@/types/supabase'

type Entry = Database['public']['Tables']['entries']['Row']

interface EntryCardProps {
    entry: Entry
    index?: number
    onEdit?: () => void
    onToggleStatus?: () => void
    showCategory?: boolean
    categoryName?: string
    categoryColor?: string
    compact?: boolean
}

export const EntryCard = forwardRef<HTMLDivElement, EntryCardProps>(({ 
    entry, 
    index = 0, 
    onEdit, 
    onToggleStatus,
    showCategory = false,
    categoryName,
    categoryColor,
    compact = false
}, ref) => {
    const emoji = (entry.metadata as any)?.emoji

    const getStatusIcon = () => {
        if (entry.status === 'done') {
            return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        }
        if (entry.status === 'in_progress') {
            return <CircleDot className="h-5 w-5 text-blue-500" />
        }
        return <Circle className="h-5 w-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
    }

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
            transition={{ delay: index * 0.03, type: 'spring', stiffness: 400, damping: 30 }}
            onClick={onEdit}
            className={cn(
                "group flex items-center gap-3 bg-card glass rounded-xl border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer",
                compact ? "p-3" : "p-4",
                entry.status === 'done' && "bg-muted/30"
            )}
        >
            {/* Status Toggle */}
            {onToggleStatus && (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleStatus(); }}
                    className="flex-shrink-0 transition-transform hover:scale-110"
                >
                    {getStatusIcon()}
                </button>
            )}

            {/* Emoji - discreto */}
            {emoji && (
                <span className="text-lg flex-shrink-0">{emoji}</span>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={cn(
                    "text-foreground font-medium truncate",
                    compact ? "text-sm" : "",
                    entry.status === 'done' && "line-through text-muted-foreground"
                )}>
                    {entry.content}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                    {showCategory && categoryName && (
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium",
                            categoryColor || "bg-slate-100 text-slate-600"
                        )}>
                            {categoryName}
                        </span>
                    )}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                    {entry.status === 'in_progress' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
                            Em Progresso
                        </span>
                    )}
                </div>
            </div>

            {/* Edit Button */}
            {onEdit && (
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                >
                    <Pencil className="h-4 w-4" />
                </button>
            )}
        </motion.div>
    )
})

EntryCard.displayName = 'EntryCard'
