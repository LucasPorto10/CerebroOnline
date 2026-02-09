import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/api/supabase'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { EditEntryDialog } from './EditEntryDialog'
import { EntryCard } from '@/components/shared/EntryCard'
import { Database } from '@/types/supabase'
import { toast } from 'sonner'
import { useAutoEmoji } from '@/hooks/useAutoEmoji'
import { Clock } from 'lucide-react'

type DbEntry = Database['public']['Tables']['entries']['Row']
type Entry = DbEntry & {
    categories: {
        name: string
        color: string
        icon: string
    } | null
}

export function RecentEntries() {
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
    const queryClient = useQueryClient()

    const { data: entries, isLoading } = useQuery({
        queryKey: ['entries', 'recent'],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('entries')
                .select(`
                    *,
                    categories (name, color, icon)
                `)
                .order('created_at', { ascending: false })
                .limit(5)

            if (error) throw error
            return data as Entry[]
        }
    })

    // Auto assign emojis silently
    useAutoEmoji(entries as any)

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
            queryClient.invalidateQueries({ queryKey: ['entries'] })
        }
    }

    if (isLoading) {
        return (
            <div className="text-center text-slate-400 py-10">
                <Clock className="h-5 w-5 mx-auto mb-2 animate-pulse" />
                Carregando...
            </div>
        )
    }

    if (!entries?.length) {
        return (
            <div className="text-center text-muted-foreground py-10 bg-card/50 glass rounded-2xl border border-dashed border-border">
                <p className="font-medium text-foreground">Nada aqui ainda.</p>
                <p className="text-sm mt-1">Use o campo acima para criar sua primeira nota!</p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Recentes
                </h2>

                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {entries.map((entry, index) => (
                            <EntryCard
                                key={entry.id}
                                entry={entry}
                                index={index}
                                onEdit={() => setEditingEntry(entry)}
                                onToggleStatus={() => toggleStatus(entry)}
                                showCategory={!!entry.categories}
                                categoryName={entry.categories?.name}
                                compact
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Edit Dialog */}
            {editingEntry && (
                <EditEntryDialog
                    entry={editingEntry}
                    onClose={() => setEditingEntry(null)}
                    onUpdate={() => {
                        queryClient.invalidateQueries({ queryKey: ['entries'] })
                        queryClient.invalidateQueries({ queryKey: ['stats'] })
                    }}
                />
            )}
        </>
    )
}
