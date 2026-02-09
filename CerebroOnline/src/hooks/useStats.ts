import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/api/supabase'

export interface DashboardStats {
    pending: number
    inProgress: number
    completed: number
    notes: number
    ideas: number
    totalEntries: number
}

export function useStats() {
    return useQuery<DashboardStats>({
        queryKey: ['stats', 'dashboard'],
        queryFn: async () => {
            // Fetch all stats in parallel
            const [pendingResult, inProgressResult, completedResult, notesResult, ideasResult, totalResult] = await Promise.all([
                // Pending tasks
                supabase
                    .from('entries')
                    .select('id', { count: 'exact', head: true })
                    .eq('entry_type', 'task')
                    .eq('status', 'pending'),
                
                // In Progress tasks
                supabase
                    .from('entries')
                    .select('id', { count: 'exact', head: true })
                    .eq('entry_type', 'task')
                    .eq('status', 'in_progress'),

                // Completed tasks
                supabase
                    .from('entries')
                    .select('id', { count: 'exact', head: true })
                    .eq('entry_type', 'task')
                    .eq('status', 'done'),
                
                // Notes count
                supabase
                    .from('entries')
                    .select('id', { count: 'exact', head: true })
                    .eq('entry_type', 'note'),
                
                // Ideas category count
                supabase
                    .from('entries')
                    .select('id, categories!inner(slug)', { count: 'exact', head: true })
                    .eq('categories.slug', 'ideas'),
                
                // Total entries
                supabase
                    .from('entries')
                    .select('id', { count: 'exact', head: true })
            ])

            return {
                pending: pendingResult.count ?? 0,
                inProgress: inProgressResult.count ?? 0,
                completed: completedResult.count ?? 0,
                notes: notesResult.count ?? 0,
                ideas: ideasResult.count ?? 0,
                totalEntries: totalResult.count ?? 0,
            }
        },
        staleTime: 30000, // 30 seconds
    })
}
