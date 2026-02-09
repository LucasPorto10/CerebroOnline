import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '@/api/supabase'
import { Database } from '@/types/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { LayoutGrid, Clock, Sparkles, Pencil, Trash2 } from 'lucide-react'
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

// Configuration for Status Columns
const statusColumns: Column[] = [
    { 
        id: 'pending', 
        title: 'Pendente', 
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20'
    },
    { 
        id: 'in_progress', 
        title: 'Em Progresso', 
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20'
    },
    { 
        id: 'done', 
        title: 'Concluído', 
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20'
    },
]

// Configuration for Priority Columns
const priorityColumns: Column[] = [
    {
        id: 'urgent',
        title: 'Urgente',
        color: 'text-rose-500',
        bgColor: 'bg-rose-500/10',
        borderColor: 'border-rose-500/20'
    },
    {
        id: 'high',
        title: 'Alta',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20'
    },
    {
        id: 'medium',
        title: 'Média',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20'
    },
    {
        id: 'low',
        title: 'Baixa',
        color: 'text-slate-500',
        bgColor: 'bg-slate-500/10',
        borderColor: 'border-slate-500/20'
    }
]

type GroupBy = 'status' | 'priority'

export function KanbanView() {
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
    const [draggedEntry, setDraggedEntry] = useState<Entry | null>(null)
    const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null })
    const [groupBy, setGroupBy] = useState<GroupBy>('status')
    
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

    const updatePriorityMutation = useMutation({
        mutationFn: async ({ id, priority, entry }: { id: string; priority: string; entry: Entry }) => {
            // Optimistic update helper if needed, but we rely on invalidation for now
            const currentMetadata = entry.metadata as any || {}
            
            // SUPER IMPORTANT: Update BOTH the top-level 'priority' column AND the metadata field.
            // This ensures consistency across different views and filters.
            const { error } = await (supabase as any)
                .from('entries')
                // @ts-ignore
                .update({ 
                    priority: priority,
                    metadata: { ...currentMetadata, priority } 
                })
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['entries'] })
             toast.success('Prioridade atualizada')
        },
        onError: () => {
            toast.error('Erro ao atualizar prioridade')
        }
    })

    const updateChecklistMutation = useMutation({
        mutationFn: async ({ id, checklist }: { id: string; checklist: any[] }) => {
            const { error } = await (supabase as any)
                .from('entries')
                .update({ checklist })
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['entries'] })
        },
        onError: () => {
            toast.error('Erro ao atualizar checklist')
        }
    })

    const handleToggleChecklist = (entry: Entry, itemIndex: number) => {
        const currentChecklist = (entry as any).checklist || []
        const newChecklist = [...currentChecklist]
        
        // Handle both string and object formats
        const item = newChecklist[itemIndex]
        if (typeof item === 'string') {
            newChecklist[itemIndex] = { text: item, done: true }
        } else {
            newChecklist[itemIndex] = { ...item, done: !item.done }
        }

        updateChecklistMutation.mutate({ id: entry.id, checklist: newChecklist })
    }

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
        if (!draggedEntry) return

        if (groupBy === 'status') {
            if (draggedEntry.status !== columnId) {
                updateStatusMutation.mutate({ 
                    id: draggedEntry.id, 
                    status: columnId as Entry['status'] 
                })
                toast.success(`Movido para ${statusColumns.find(c => c.id === columnId)?.title}`)
            }
        } else {
            // Group by Priority
            const currentPriority = (draggedEntry.metadata as any)?.priority || 'medium'
            if (currentPriority !== columnId) {
                updatePriorityMutation.mutate({
                    id: draggedEntry.id,
                    priority: columnId,
                    entry: draggedEntry
                })
            }
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
        if (groupBy === 'status') {
             return filteredEntries?.filter(entry => entry.status === columnId) || []
        } else {
            return filteredEntries?.filter(entry => {
                const p = (entry.metadata as any)?.priority || 'medium'
                // Handle cases where priority might be null or missing
                if (columnId === 'medium' && !p) return true 
                return p === columnId
            }) || []
        }
    }

    // Auto assign emojis
    useAutoEmoji(entries as any)

    // Get dates for calendar
    const datesWithEntries = useMemo(() => entries?.map(e => e.created_at) || [], [entries])

    const activeColumns = groupBy === 'status' ? statusColumns : priorityColumns

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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            <LayoutGrid className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">Kanban</h2>
                            <p className="text-sm text-muted-foreground">
                                Gerencie suas tarefas por {groupBy === 'status' ? 'Status' : 'Prioridade'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex items-center p-1 bg-muted rounded-lg border border-border">
                            <button
                                onClick={() => setGroupBy('status')}
                                className={cn(
                                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                    groupBy === 'status' 
                                        ? "bg-background text-foreground shadow-sm" 
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Status
                            </button>
                            <button
                                onClick={() => setGroupBy('priority')}
                                className={cn(
                                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                    groupBy === 'priority' 
                                        ? "bg-background text-foreground shadow-sm" 
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Prioridade
                            </button>
                        </div>

                        <DateFilter value={dateRange} onChange={setDateRange} datesWithEntries={datesWithEntries} />
                    </div>
                </div>

                {/* Kanban Board */}
                <div className={cn(
                    "grid gap-6 transition-all duration-300",
                    groupBy === 'status' ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
                )}>
                    {activeColumns.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            entries={getColumnEntries(column.id)}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDrop={() => handleDrop(column.id)}
                            isDragOver={draggedEntry !== null && (
                                groupBy === 'status' 
                                    ? draggedEntry.status !== column.id
                                    : ((draggedEntry.metadata as any)?.priority || 'medium') !== column.id
                            )}
                            onEdit={setEditingEntry}
                            onDelete={deleteEntry}
                            onToggleChecklist={handleToggleChecklist}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {(!filteredEntries || filteredEntries.length === 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/30"
                    >
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <LayoutGrid className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-muted-foreground">Nenhuma tarefa ainda</p>
                        <p className="text-sm text-muted-foreground/80 mt-1">
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

// FIX: Add onToggleChecklist to props
interface KanbanColumnProps {
    column: Column
    entries: Entry[]
    onDragStart: (entry: Entry) => void
    onDragEnd: () => void
    onDrop: () => void
    isDragOver: boolean
    onEdit: (entry: Entry) => void
    onDelete: (id: string, e: React.MouseEvent) => void
    onToggleChecklist: (entry: Entry, itemIndex: number) => void
}

function KanbanColumn({ 
    column, 
    entries, 
    onDragStart, 
    onDragEnd, 
    onDrop, 
    isDragOver,
    onEdit,
    onDelete,
    onToggleChecklist 
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
            <div className={cn(
                "flex items-center justify-between p-4 border-b",
                column.borderColor
            )}>
                <div className="flex items-center gap-2">
                    <span className={cn("font-bold text-sm uppercase tracking-wider", column.color)}>
                        {column.title}
                    </span>
                    <span className={cn(
                        "text-xs px-2.5 py-0.5 rounded-full font-bold bg-background/80 backdrop-blur-sm",
                        column.color
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
                            onToggleChecklist={onToggleChecklist}
                        />
                    ))}
                </AnimatePresence>

                {/* Drop Zone Indicator */}
                {isOver && isDragOver && entries.length === 0 && (
                    <div className="flex items-center justify-center h-24 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5">
                        <span className="text-sm text-primary font-medium">
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
    onToggleChecklist: (entry: Entry, itemIndex: number) => void
}

function KanbanCard({ entry, index, onDragStart, onDragEnd, onEdit, onDelete, onToggleChecklist }: KanbanCardProps) {
    // FIX: Read priority from metadata to match column filtering logic and ensure sync with mutation
    const priority = (entry.metadata as any)?.priority || 'medium'
    
    // We can keep the card rendering mostly the same, 
    // maybe we want to emphasize priority less if we are IN the priority view?
    // For now, consistent card design is good.
    const priorityConfig = {
        urgent: { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Urgente' },
        high: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Alta' },
        medium: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Média' },
        low: { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: 'Baixa' }
    }[priority as string] || { color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border', label: 'Normal' }

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
            className={cn(
                "group bg-card rounded-xl p-4 shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-md transition-all relative overflow-hidden",
                priority === 'urgent' ? 'border-rose-200' : 'border-border'
            )}
        >
            {/* Priority Stripe for Urgent/High */}
            {(priority === 'urgent' || priority === 'high') && (
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    priority === 'urgent' ? 'bg-rose-500' : 'bg-orange-500'
                )} />
            )}

            {/* Drag Handle */}
            <div className="flex items-start gap-2 pl-2">
                <div className="flex-1 min-w-0">
                    {/* Header: Priority + Emoji */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex-shrink-0 flex items-center justify-center transition-all">
                            {(entry.metadata as any)?.emoji || <Sparkles className="h-3 w-3 text-slate-300" />}
                        </div>
                        {priority !== 'medium' && priority !== 'low' && (
                            <span className={cn(
                                "text-[10px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded",
                                priorityConfig.bg,
                                priorityConfig.color
                            )}>
                                {priorityConfig.label}
                            </span>
                        )}
                        {(priority === 'medium' || priority === 'low') && (
                            <span className={cn(
                                "text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded",
                                priorityConfig.bg,
                                priorityConfig.color
                            )}>
                                {priorityConfig.label}
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <p className="text-sm font-medium text-foreground line-clamp-3 mb-2">
                        {entry.content}
                    </p>
                    
                    {/* Checklist */}
                    {(entry as any).checklist && (entry as any).checklist.length > 0 && (
                        <div className="mb-3 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5">
                                <span className="bg-primary/10 text-primary p-0.5 rounded">
                                    ✓
                                </span>
                                Checklist
                            </div>
                            {(entry as any).checklist.slice(0, 3).map((item: any, idx: number) => {
                                const isObject = typeof item === 'object'
                                const text = isObject ? item.text : item
                                const isDone = isObject ? item.done : false
                                
                                return (
                                    <div 
                                        key={idx} 
                                        className="flex items-start gap-2 text-xs text-muted-foreground group cursor-pointer hover:text-foreground transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            // Call parent handler
                                            onToggleChecklist(entry, idx)
                                        }}
                                    >
                                        <div className={cn(
                                            "min-w-[12px] h-[12px] rounded-sm border mt-0.5 flex items-center justify-center transition-colors",
                                            isDone ? "bg-primary border-primary" : "border-border group-hover:border-primary"
                                        )}>
                                            {isDone && <div className="w-1.5 h-1.5 bg-primary-foreground rounded-[1px]" />}
                                        </div>
                                        <span className={cn("line-clamp-1 transition-opacity", isDone && "line-through opacity-50")}>{text}</span>
                                    </div>
                                )
                            })}
                            {(entry as any).checklist.length > 3 && (
                                <div className="text-[10px] text-muted-foreground pl-5">
                                    + {(entry as any).checklist.length - 3} itens
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tags */}
                    {(entry.metadata as any)?.tags && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {(entry.metadata as any).tags.slice(0, 2).map((tag: string) => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded border border-border">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: ptBR })}
                            </span>
                            {(entry as any).due_date && (
                                <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1",
                                    new Date((entry as any).due_date) < new Date() 
                                        ? "bg-rose-500/10 text-rose-500" 
                                        : "bg-primary/10 text-primary"
                                )}>
                                    📅 {new Date((entry as any).due_date).toLocaleDateString('pt-BR')}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                className="p-1 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Pencil className="h-3 w-3" />
                            </button>
                            <button
                                onClick={(e) => onDelete(entry.id, e)}
                                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
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
