import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/api/supabase'
import { Database } from '@/types/supabase'
import { ListTodo } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns'
import { EditEntryDialog } from '@/components/features/EditEntryDialog'
import { DateFilter, DateRange } from '@/components/features/DateFilter'
import { EntryCard } from '@/components/shared/EntryCard'
import { useAutoEmoji } from '@/hooks/useAutoEmoji'

type Entry = Database['public']['Tables']['entries']['Row']

interface TaskViewProps {
    categorySlug: string
}

export function TaskView({ categorySlug }: TaskViewProps) {
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
    const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all')
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

    const filteredEntries = entries?.filter(entry => {
        if (filter === 'pending' && entry.status === 'done') return false
        if (filter === 'done' && entry.status !== 'done') return false
        
        if (dateRange.start) {
            const entryDate = parseISO(entry.created_at)
            const start = startOfDay(dateRange.start)
            const end = dateRange.end ? endOfDay(dateRange.end) : endOfDay(dateRange.start)
            if (!isWithinInterval(entryDate, { start, end })) return false
        }
        
        return true
    })

    const stats = {
        total: entries?.length || 0,
        pending: entries?.filter(e => e.status === 'pending').length || 0,
        inProgress: entries?.filter(e => e.status === 'in_progress').length || 0,
        done: entries?.filter(e => e.status === 'done').length || 0,
    }

    // Auto assign emojis silently
    useAutoEmoji(entries as any)

    const datesWithEntries = useMemo(() => {
        return entries?.map(e => e.created_at) || []
    }, [entries])

    const getCategoryTitle = (slug: string) => {
        switch (slug) {
            case 'home': return 'Doméstico'
            case 'work': return 'Trabalho'
            case 'uni': return 'Faculdade'
            default: return slug
        }
    }

    const toggleStatus = async (entry: Entry) => {
        const newStatus = entry.status === 'done' ? 'pending' : 'done'
        
        const { error } = await (supabase as any)
            .from('entries')
            .update({ status: newStatus })
            .eq('id', entry.id)

        if (error) {
            toast.error('Erro ao atualizar')
        } else {
            toast.success(newStatus === 'done' ? '✓ Concluída!' : 'Reaberta')
            refetch()
            queryClient.invalidateQueries({ queryKey: ['stats'] })
        }
    }

    return (
        <>
            <div className="space-y-6 max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            {getCategoryTitle(categorySlug)}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {stats.pending} pendentes, {stats.done} concluídas
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-3">
                        <DateFilter value={dateRange} onChange={setDateRange} datesWithEntries={datesWithEntries} />
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                            {[
                                { key: 'all', label: 'Todas', count: stats.total },
                                { key: 'pending', label: 'Pendentes', count: stats.pending + stats.inProgress },
                                { key: 'done', label: 'Concluídas', count: stats.done },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key as any)}
                                    className={cn(
                                        "px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
                                        filter === tab.key 
                                            ? "bg-white text-slate-900 shadow-sm" 
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {stats.total > 0 && (
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(stats.done / stats.total) * 100}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                    </div>
                )}

                {/* Task List */}
                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {filteredEntries?.map((entry, index) => (
                            <EntryCard
                                key={entry.id}
                                entry={entry}
                                index={index}
                                onEdit={() => setEditingEntry(entry)}
                                onToggleStatus={() => toggleStatus(entry)}
                            />
                        ))}
                    </AnimatePresence>

                    {filteredEntries?.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-16 text-slate-400"
                        >
                            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <ListTodo className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="font-medium text-slate-500">
                                {filter === 'done' ? 'Nenhuma tarefa concluída' : 'Nenhuma tarefa pendente'}
                            </p>
                        </motion.div>
                    )}
                </div>
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
