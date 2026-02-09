import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/api/supabase'
import { Subject, Entry } from '@/types/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { GraduationCap, Pencil, Trash2, Clock, Tag, Filter, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { SubjectManager } from '@/components/features/SubjectManager'
import { EditEntryDialog } from '@/components/features/EditEntryDialog'

interface EntryWithSubject extends Entry {
    subjects?: Subject | null
}

export function UniView() {
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
    const [showFilters, setShowFilters] = useState(true)
    const queryClient = useQueryClient()

    const { data: entries, isLoading } = useQuery<EntryWithSubject[]>({
        queryKey: ['entries', 'uni', selectedSubjectId],
        queryFn: async () => {
            // Get uni category
            const { data: category } = await (supabase as any)
                .from('categories')
                .select('id')
                .eq('slug', 'uni')
                .single()

            if (!category) return []

            if (!category) return []

            let query = (supabase as any)
                .from('entries')
                .select(`
                    *,
                    subjects (*)
                `)
                .eq('category_id', category.id)
                .order('created_at', { ascending: false })

            if (selectedSubjectId) {
                query = query.eq('subject_id', selectedSubjectId)
            }

            const { data, error } = await query
            if (error) throw error
            return data as EntryWithSubject[]
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
            toast.success('Item removido')
        }
    }

    const handleSelectSubject = (subject: Subject | null) => {
        setSelectedSubjectId(subject?.id || null)
    }

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'done': return 'bg-emerald-100 text-emerald-700'
            case 'in_progress': return 'bg-blue-100 text-blue-700'
            default: return 'bg-amber-100 text-amber-700'
        }
    }

    const getTypeIcon = (type: string | null) => {
        switch (type) {
            case 'task': return '✅'
            case 'note': return '📝'
            case 'insight': return '💡'
            default: return '📌'
        }
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl text-violet-600">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Faculdade</h2>
                            <p className="text-sm text-slate-500">
                                {entries?.length || 0} itens
                                {selectedSubjectId && ' nesta matéria'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                            showFilters 
                                ? "bg-indigo-100 text-indigo-700" 
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                    >
                        <Filter className="h-4 w-4" />
                        Filtros
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar - Subject Manager */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full lg:w-[280px] lg:shrink-0 overflow-hidden"
                            >
                                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                                    <SubjectManager
                                        selectedSubjectId={selectedSubjectId}
                                        onSelectSubject={handleSelectSubject}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-pulse text-slate-400">Carregando...</div>
                            </div>
                        ) : entries && entries.length > 0 ? (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {entries.map((entry, index) => (
                                        <motion.div
                                            key={entry.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => setEditingEntry(entry)}
                                            className="group bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                                        >
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{getTypeIcon(entry.entry_type)}</span>
                                                    {entry.subjects && (
                                                        <span 
                                                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                            style={{ 
                                                                backgroundColor: `${entry.subjects.color}20`,
                                                                color: entry.subjects.color || '#6366f1'
                                                            }}
                                                        >
                                                            {entry.subjects.icon} {entry.subjects.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", getStatusColor(entry.status))}>
                                                    {entry.status === 'done' ? 'Concluído' : entry.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <p className="text-slate-800 font-medium text-sm line-clamp-2 mb-3">
                                                {entry.content}
                                            </p>

                                            {/* Tags */}
                                            {entry.tags && entry.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {entry.tags.slice(0, 4).map((tag) => (
                                                        <span 
                                                            key={tag} 
                                                            className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded"
                                                        >
                                                            <Tag className="h-2.5 w-2.5" />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: ptBR })}
                                                </span>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEditingEntry(entry); }}
                                                        className="p-1 text-slate-400 hover:text-indigo-500"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => deleteEntry(entry.id, e)}
                                                        className="p-1 text-slate-400 hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
                            >
                                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4">
                                    <BookOpen className="h-7 w-7 text-violet-400" />
                                </div>
                                <p className="font-medium text-slate-500">
                                    {selectedSubjectId ? 'Nenhum item nesta matéria' : 'Nenhum item de faculdade'}
                                </p>
                                <p className="text-sm text-slate-400 mt-1">
                                    Use o Magic Input na Home para adicionar
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
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
