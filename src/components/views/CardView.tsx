import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/api/supabase'
import { Database } from '@/types/supabase'
import { Pencil, Trash2, Tag, Clock, LayoutGrid } from 'lucide-react'
import { formatDistanceToNow, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { EditEntryDialog } from '@/components/features/EditEntryDialog'
import { DateFilter, DateRange } from '@/components/features/DateFilter'
import { useAutoEmoji } from '@/hooks/useAutoEmoji'

type Entry = Database['public']['Tables']['entries']['Row']

interface CardViewProps {
    categorySlug: string
    title: string
}

export function CardView({ categorySlug, title }: CardViewProps) {
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
    const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null })
    const queryClient = useQueryClient()

    const { data: entries, refetch } = useQuery<Entry[]>({
        queryKey: ['entries', categorySlug],
        queryFn: async () => {
            const { data: category } = await (supabase as any)
                .from('categories')
                .select('id')
                .eq('slug', categorySlug)
                .single()

            if (!category) return []

            const { data } = await (supabase as any)
                .from('entries')
                .select('*')
                .eq('category_id', category.id)
                .order('created_at', { ascending: false })

            return data as Entry[]
        }
    })

    // Date filter
    const filteredEntries = entries?.filter(entry => {
        if (!dateRange.start) return true
        const entryDate = parseISO(entry.created_at)
        const start = startOfDay(dateRange.start)
        const end = dateRange.end ? endOfDay(dateRange.end) : endOfDay(dateRange.start)
        return isWithinInterval(entryDate, { start, end })
    })

    // Auto emojis
    useAutoEmoji(entries as any)

    const datesWithEntries = useMemo(() => entries?.map(e => e.created_at) || [], [entries])

    const deleteEntry = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const { error } = await (supabase as any).from('entries').delete().eq('id', id)
        if (error) toast.error('Erro ao excluir')
        else {
            toast.success('Item removido')
            refetch()
            queryClient.invalidateQueries({ queryKey: ['stats'] })
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200'
            default: return 'bg-amber-50 text-amber-700 border-amber-200'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'done': return 'Concluído'
            case 'in_progress': return 'Em Progresso'
            default: return 'Pendente'
        }
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {filteredEntries?.length || 0} itens
                        </p>
                    </div>
                    <DateFilter value={dateRange} onChange={setDateRange} datesWithEntries={datesWithEntries} />
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredEntries?.map((entry, index) => {
                            const emoji = (entry.metadata as any)?.emoji
                            const tags = entry.tags || []
                            
                            return (
                                <motion.div
                                    key={entry.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.03, type: 'spring', stiffness: 400, damping: 30 }}
                                    whileHover={{ y: -4 }}
                                    onClick={() => setEditingEntry(entry)}
                                    className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md p-5 cursor-pointer transition-all"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            {emoji && <span className="text-xl">{emoji}</span>}
                                            <span className={cn(
                                                "text-xs px-2 py-0.5 rounded-full border font-medium",
                                                getStatusColor(entry.status || 'pending')
                                            )}>
                                                {getStatusLabel(entry.status || 'pending')}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => deleteEntry(entry.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <p className="text-slate-800 font-medium line-clamp-3 mb-4">
                                        {entry.content}
                                    </p>

                                    {/* Tags */}
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full flex items-center gap-1">
                                                    <Tag className="h-2.5 w-2.5" />
                                                    {tag}
                                                </span>
                                            ))}
                                            {tags.length > 3 && (
                                                <span className="text-[10px] text-slate-400">+{tags.length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: ptBR })}
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingEntry(entry); }}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>

                {/* Empty State */}
                {filteredEntries?.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-16 text-slate-400"
                    >
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <LayoutGrid className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="font-medium text-slate-500">Nenhum item encontrado</p>
                    </motion.div>
                )}
            </div>

            {/* Edit Dialog */}
            {editingEntry && (
                <EditEntryDialog
                    entry={editingEntry}
                    onClose={() => setEditingEntry(null)}
                    onUpdate={() => {
                        refetch()
                        queryClient.invalidateQueries({ queryKey: ['stats'] })
                    }}
                />
            )}
        </>
    )
}
