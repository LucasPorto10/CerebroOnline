import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/api/supabase'
import { Database } from '@/types/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Lightbulb, Trash2, Pencil, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { EditEntryDialog } from '@/components/features/EditEntryDialog'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Entry = Database['public']['Tables']['entries']['Row']

export function BoardView() {
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
    const queryClient = useQueryClient()

    const { data: entries, refetch } = useQuery<Entry[]>({
        queryKey: ['entries', 'ideas'],
        queryFn: async () => {
            const { data: category } = await (supabase as any)
                .from('categories')
                .select('id')
                .eq('slug', 'ideas')
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

    const deleteEntry = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const { error } = await (supabase as any).from('entries').delete().eq('id', id)
        if (error) toast.error('Erro ao excluir')
        else {
            refetch()
            queryClient.invalidateQueries({ queryKey: ['stats'] })
            toast.success('Ideia removida')
        }
    }

    // Cores modernas para post-its
    const colors = [
        { bg: 'bg-gradient-to-br from-amber-50 to-yellow-100', border: 'border-amber-200', text: 'text-amber-900', accent: 'bg-amber-400' },
        { bg: 'bg-gradient-to-br from-rose-50 to-pink-100', border: 'border-rose-200', text: 'text-rose-900', accent: 'bg-rose-400' },
        { bg: 'bg-gradient-to-br from-sky-50 to-blue-100', border: 'border-sky-200', text: 'text-sky-900', accent: 'bg-sky-400' },
        { bg: 'bg-gradient-to-br from-emerald-50 to-teal-100', border: 'border-emerald-200', text: 'text-emerald-900', accent: 'bg-emerald-400' },
        { bg: 'bg-gradient-to-br from-violet-50 to-purple-100', border: 'border-violet-200', text: 'text-violet-900', accent: 'bg-violet-400' },
        { bg: 'bg-gradient-to-br from-orange-50 to-amber-100', border: 'border-orange-200', text: 'text-orange-900', accent: 'bg-orange-400' },
    ]

    return (
        <>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="p-3 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-2xl text-amber-600 shadow-lg shadow-amber-200/50">
                                <Lightbulb className="h-7 w-7" />
                            </div>
                            <motion.div 
                                className="absolute -top-1 -right-1"
                                animate={{ rotate: [0, 15, -15, 0] }}
                                transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                            >
                                <Sparkles className="h-4 w-4 text-amber-400" />
                            </motion.div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Mural de Ideias</h2>
                            <p className="text-sm text-slate-500 mt-0.5">
                                {entries?.length || 0} {entries?.length === 1 ? 'ideia brilhante' : 'ideias brilhantes'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Board Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    <AnimatePresence mode="popLayout">
                        {entries?.map((entry, index) => {
                            const color = colors[index % colors.length]
                            const rotation = (index % 5 - 2) * 1.5 // -3 to 3 degrees

                            return (
                                <motion.div
                                    layout
                                    key={entry.id}
                                    initial={{ opacity: 0, scale: 0.8, rotate: rotation - 5 }}
                                    animate={{ opacity: 1, scale: 1, rotate: rotation }}
                                    exit={{ opacity: 0, scale: 0.5, rotate: rotation + 10 }}
                                    whileHover={{ 
                                        scale: 1.05, 
                                        rotate: 0, 
                                        zIndex: 10,
                                        transition: { duration: 0.2 } 
                                    }}
                                    onClick={() => setEditingEntry(entry)}
                                    className={cn(
                                        "group relative aspect-[4/5] p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col rounded-2xl border-2",
                                        color.bg,
                                        color.border,
                                        color.text
                                    )}
                                    style={{
                                        transformOrigin: 'center center',
                                    }}
                                >
                                    {/* Pin decoration */}
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-400 shadow-md border-2 border-slate-300" />
                                    
                                    {/* Accent bar */}
                                    <div className={cn("absolute top-0 left-4 right-4 h-1 rounded-full opacity-50", color.accent)} />

                                    {/* Content */}
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-base font-medium leading-relaxed line-clamp-6">
                                            {entry.content}
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-black/5">
                                        <span className="text-xs opacity-60 font-medium">
                                            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: ptBR })}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingEntry(entry); }}
                                                className="p-1.5 bg-white/60 hover:bg-white rounded-lg transition-colors"
                                            >
                                                <Pencil className="h-3.5 w-3.5 opacity-70" />
                                            </button>
                                            <button
                                                onClick={(e) => deleteEntry(entry.id, e)}
                                                className="p-1.5 bg-white/60 hover:bg-white rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 opacity-70" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>

                {/* Empty State */}
                {entries?.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-amber-200/30">
                            <Lightbulb className="h-10 w-10 text-amber-500" />
                        </div>
                        <p className="font-semibold text-lg text-slate-600">Nenhuma ideia ainda...</p>
                        <p className="text-sm text-slate-400 mt-2 max-w-xs text-center">
                            Use o Magic Input na Home e compartilhe suas ideias brilhantes!
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
