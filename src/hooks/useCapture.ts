import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/api/supabase'
import { toast } from 'sonner'
import { useAuth } from '@/providers/auth-provider'
import { startOfWeek, startOfMonth, format } from 'date-fns'

export interface ClassificationResult {
    category_slug: string
    entry_type: 'task' | 'note' | 'insight' | 'bookmark' | 'goal'
    metadata: any
}

export function useCapture() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return useMutation({
        mutationFn: async (text: string) => {
            if (!user) throw new Error('User not authenticated')

            // 1. Call Edge Function to classify
            const { data: classification, error: aiError } = await supabase.functions.invoke<ClassificationResult>('classify-entry', {
                body: { content: text }
            })

            if (aiError) throw aiError

            const targetSlug = classification?.category_slug || 'ideas'
            const entryType = (classification?.entry_type || 'note').toLowerCase()

            // HANDLE GOALS SEPARATELY
            if (entryType === 'goal') {
                const metadata = classification?.metadata || {}
                
                // DATA NORMALIZATION: Ensure period_type matches Postgres check constraint
                // Database only accepts ['weekly', 'monthly']
                let periodType = (metadata.period_type || 'weekly').toLowerCase()
                if (periodType !== 'weekly' && periodType !== 'monthly') {
                    periodType = 'weekly' // Fallback to weekly if AI says 'daily' or other
                }
                
                // Calculate period start
                const now = new Date()
                const periodStart = periodType === 'weekly' 
                    ? startOfWeek(now, { weekStartsOn: 1 }) 
                    : startOfMonth(now)

                const { data: goal, error: goalError } = await (supabase as any)
                    .from('goals')
                    .insert({
                        user_id: user.id,
                        title: metadata.summary || text,
                        emoji: metadata.emoji || '🎯',
                        target: metadata.target || 1,
                        unit: metadata.unit || 'unidade',
                        period_type: periodType,
                        period_start: format(periodStart, 'yyyy-MM-dd'),
                        current: 0,
                        category: targetSlug || 'ideas'
                    })
                    .select()
                    .single()

                if (goalError) {
                    console.error('Goal Creation Error:', goalError)
                    throw goalError
                }
                
                // Also create an entry for this goal if desired for history (Optional but recommended for consistency)
                await (supabase as any).from('entries').insert({
                    user_id: user.id,
                    content: text,
                    entry_type: 'task',
                    metadata: { ...metadata, is_goal_trigger: true },
                    status: 'pending'
                })

                return { entry: goal, type: 'goal', categoryName: periodType === 'weekly' ? 'Meta Semanal' : 'Meta Mensal' }
            }

            // HANDLE REGULAR ENTRIES
            
            // 2. Resolve Category ID from slug
            // Using 'any' cast to bypass temporary TS inference issues with the generated types
            // @ts-ignore
            const { data: categories, error: catError } = await (supabase as any)
                .from('categories')
                .select('id, name')
                .eq('slug', targetSlug)
                .single()

            // @ts-ignore
            const categoryId = categories?.id

            // Validate Entry Type (Postgres Check Constraint is case sensitive)
            const validTypes = ['task', 'note', 'insight', 'bookmark']
            let finalEntryType = entryType
            if (!validTypes.includes(finalEntryType)) {
                finalEntryType = 'note'
            }

            // 3. Save to Supabase
            // @ts-ignore
            const { data: entry, error: dbError } = await (supabase as any)
                .from('entries')
                .insert({
                    user_id: user.id,
                    content: text,
                    category_id: categoryId, // If undefined, Supabase treats as null (which is allowed)
                    entry_type: finalEntryType,
                    metadata: classification?.metadata || {},
                    status: 'pending'
                })
                .select()
                .single()

            if (dbError) throw dbError

            // @ts-ignore
            return { entry, type: 'entry', categoryName: categories?.name }
        },
        onSuccess: (data) => {
            if (data.type === 'goal') {
                queryClient.invalidateQueries({ queryKey: ['goals'] })
                toast.success('Meta criada! 🎯', {
                    description: `Adicionado em ${data.categoryName}`
                })
            } else {
                queryClient.invalidateQueries({ queryKey: ['entries'] })
                toast.success(`Salvo em ${data.categoryName || 'Inbox'}`, {
                    description: 'Classificado com sucesso pela IA',
                    icon: '✨'
                })
            }
        },
        onError: (error: any) => {
            console.error(error)
            toast.error('Erro ao salvar', {
                description: error.message || 'Tente novamente.'
            })
        }
    })
}
