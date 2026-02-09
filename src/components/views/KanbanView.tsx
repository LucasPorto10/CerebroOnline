import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '@/api/supabase'
import { Database } from '@/types/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { LayoutGrid, Clock, GripVertical, Sparkles, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { EditEntryDialog } from '@/components/features/EditEntryDialog'
import { formatDistanceToNow, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DateFilter, DateRange } from '@/components/features/DateFilter'
import { useAutoEmoji } from '@/hooks/useAutoEmoji'

type Entry = Database['public']['Tables']['entries']['Row']

interface Column {
    id: string
    title: string
    color: string
    bgColor: string
    borderColor: string
}

const columns: Column[] = [
    { 
        id: 'pending', 
        title: 'Pendente', 
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200'
    },
    { 
        id: 'in_progress', 
        title: 'Em Progresso', 
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
    },
    { 
        id: 'done', 
        title: 'Concluído', 
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200'
    },
]

export function KanbanView() {
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
    const [draggedEntry, setDraggedEntry] = useState<Entry | null>(null)
    const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null })
    const queryClient = useQueryClient()

    const { data: entries, isLoading } = useQuery<Entry[]>({
        queryKey: ['entries', 'kanban'],
        queryFn: async () => {
            const { data } = await (supabase as any)
                .from('entries')
                .select('*')
                .eq('entry_type', 'task')
                .order('created_at', { ascending: false })

            return (data as Entry[]) || []
        }
    })

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: Entry['status'] }) => {
            const { error } = await (supabase as any)
                .from('entries')
                .update({ status })
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entries'] })
            queryClient.invalidateQueries({ queryKey: ['stats'] })
        },
        onError: () => {
            toast.error('Erro ao mover tarefa')
        }
    })

    const deleteEntry = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const { error } = await (supabase as any).from('entries').delete().eq('id', id)
        if (error) {
            toast.error('Erro ao excluir')
        } else {
            queryClient.invalidateQueries({ queryKey: ['entries'] })
            queryClient.invalidateQueries({ queryKey: ['stats'] })
            toast.success('Tarefa removida')
        }
    }

    const handleDragStart = (entry: Entry) => {
        setDraggedEntry(entry)
    }

    const handleDragEnd = () => {
        setDraggedEntry(null)
    }

    const handleDrop = (columnId: string) => {
        if (draggedEntry && draggedEntry.status !== columnId) {
            updateStatusMutation.mutate({ 
                id: draggedEntry.id, 
                status: columnId as Entry['status'] 
            })
            toast.success(`Movido para ${columns.find(c => c.id === columnId)?.title}`)
        }
        setDraggedEntry(null)
    }

    // Apply date filter
    const filteredEntries = entries?.filter(entry => {
        if (!dateRange.start) return true
        const entryDate = parseISO(entry.created_at)
        const start = startOfDay(dateRange.start)
        const end = dateRange.end ? endOfDay(dateRange.end) : endOfDay(dateRange.start)
        return isWithinInterval(entryDate, { start, end })
    })

    const getColumnEntries = (columnId: string) => {
        return filteredEntries?.filter(entry => entry.status === columnId) || []
    }

    // Auto assign emojis
    useAutoEmoji(entries as any)

    // Get dates for calendar
    const datesWithEntries = useMemo(() => entries?.map(e => e.created_at) || [], [entries])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-slate-400">Carregando Kanban...</div>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl text-indigo-600">
                            <LayoutGrid className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Kanban</h2>
                            <p className="text-sm text-slate-500">
                                Arraste as tarefas entre as colunas
                            </p>
                        </div>
                    </div>
                    <DateFilter value={dateRange} onChange={setDateRange} datesWithEntries={datesWithEntries} />
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {columns.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            entries={getColumnEntries(column.id)}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDrop={() => handleDrop(column.id)}
                            isDragOver={draggedEntry !== null && draggedEntry.status !== column.id}
                            onEdit={setEditingEntry}
                            onDelete={deleteEntry}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {(!filteredEntries || filteredEntries.length === 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
                    >
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <LayoutGrid className="h-7 w-7 text-slate-300" />
                        </div>
                        <p className="font-medium text-slate-500">Nenhuma tarefa ainda</p>
                        <p className="text-sm text-slate-400 mt-1">
                            Use o Magic Input para criar tarefas
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Edit Dialog */}
            {editingEntry && (
                <EditEntryDialog
                    entry={editingEntry}
                    onClose={() => setEditingEntry(null)}
                />
            )}
        </>
    )
}

interface KanbanColumnProps {
    column: Column
    entries: Entry[]
    onDragStart: (entry: Entry) => void
    onDragEnd: () => void
    onDrop: () => void
    isDragOver: boolean
    onEdit: (entry: Entry) => void
    onDelete: (id: string, e: React.MouseEvent) => void
}

function KanbanColumn({ 
    column, 
    entries, 
    onDragStart, 
    onDragEnd, 
    onDrop, 
    isDragOver,
    onEdit,
    onDelete 
}: KanbanColumnProps) {
    const [isOver, setIsOver] = useState(false)

    return (
        <div
            className={cn(
                "flex flex-col rounded-2xl border-2 transition-all min-h-[400px]",
                column.bgColor,
                column.borderColor,
                isOver && isDragOver && "ring-2 ring-indigo-400 border-indigo-300 scale-[1.02]"
            )}
            onDragOver={(e) => {
                e.preventDefault()
                setIsOver(true)
            }}
            onDragLeave={() => setIsOver(false)}
            onDrop={(e) => {
                e.preventDefault()
                setIsOver(false)
                onDrop()
            }}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between p-4 border-b border-black/5">
                <div className="flex items-center gap-2">
                    <span className={cn("font-semibold", column.color)}>
                        {column.title}
                    </span>
                    <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        column.color,
                        column.bgColor
                    )}>
                        {entries.length}
                    </span>
                </div>
            </div>

            {/* Cards */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                    {entries.map((entry, index) => (
                        <KanbanCard
                            key={entry.id}
                            entry={entry}
                            index={index}
                            onDragStart={() => onDragStart(entry)}
                            onDragEnd={onDragEnd}
                            onEdit={() => onEdit(entry)}
                            onDelete={onDelete}
                        />
                    ))}
                </AnimatePresence>

                {/* Drop Zone Indicator */}
                {isOver && isDragOver && entries.length === 0 && (
                    <div className="flex items-center justify-center h-24 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50/50">
                        <span className="text-sm text-indigo-500 font-medium">
                            Solte aqui
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

interface KanbanCardProps {
    entry: Entry
    index: number
    onDragStart: () => void
    onDragEnd: () => void
    onEdit: () => void
    onDelete: (id: string, e: React.MouseEvent) => void
}

function KanbanCard({ entry, index, onDragStart, onDragEnd, onEdit, onDelete }: KanbanCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.03 }}
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={onEdit}
            className="group bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
        >
            {/* Drag Handle */}
            <div className="flex items-start gap-2">
                <div className="opacity-0 group-hover:opacity-50 transition-opacity mt-0.5">
                    <GripVertical className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                    {/* Emoji + Content */}
                    <div className="flex items-start gap-2">
                        <div className={cn(
                            "flex-shrink-0 flex items-center justify-center transition-all",
                            !(entry.metadata as any)?.emoji && "animate-pulse"
                        )}>
                            {(entry.metadata as any)?.emoji || <Sparkles className="h-3 w-3 text-slate-300" />}
                        </div>
                        <p className="text-sm font-medium text-slate-800 line-clamp-3 flex-1">
                            {entry.content}
                        </p>
                    </div>
                    
                    {/* Tags */}
                    {(entry.metadata as any)?.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {(entry.metadata as any).tags.slice(0, 2).map((tag: string) => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"
                            >
                                <Pencil className="h-3 w-3" />
                            </button>
                            <button
                                onClick={(e) => onDelete(entry.id, e)}
                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
