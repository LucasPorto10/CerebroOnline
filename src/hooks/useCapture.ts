import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/api/supabase'
import { toast } from 'sonner'
import { useAuth } from '@/providers/auth-provider'
import { startOfWeek, startOfMonth, format } from 'date-fns'

export interface ClassificationResult {
    category_slug: string
    entry_type: 'task' | 'note' | 'insight' | 'bookmark' | 'goal'
    status?: 'pending' | 'in_progress' | 'done'
    metadata: {
        summary?: string
        tags?: string[]
        emoji?: string
        target?: number
        unit?: string
        period_type?: 'daily' | 'weekly' | 'monthly'
        due_date?: string | null
        priority?: 'low' | 'medium' | 'high' | 'urgent' | null
        checklist?: string[] | { text: string; done: boolean }[]
    }
}

export function useCapture() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return useMutation({
        mutationFn: async (text: string) => {
            if (!user) throw new Error('User not authenticated')

            // 1. Call Edge Function to classify
            let classification: ClassificationResult | null = null
            
            try {
                const { data, error: aiError } = await supabase.functions.invoke<ClassificationResult>('classify-entry', {
                    body: { content: text }
                })
                
                if (aiError) {
                    console.warn('AI Classification SDK error, triggering fallback:', aiError)
                    throw aiError // Force jump to catch block to try raw fetch
                } else {
                    classification = data
                }
            } catch (err: any) {
                console.warn('SDK Invocation failed, trying raw fetch fallback:', err)
                
                // Fallback: Try raw fetch if SDK fails (sometimes SDK has issues with specific network configs)
                try {
                    const token = import.meta.env.VITE_SUPABASE_ANON_KEY // Use Anon Key for better reliability in fallback
                    
                    if (!token) throw new Error('No anon key for fallback')

                    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/classify-entry`
                    const response = await fetch(functionUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ content: text })
                    })

                    if (!response.ok) throw new Error(`Fallback HTTP error ${response.status}`)
                    
                    const data = await response.json()
                    classification = data
                } catch (fallbackErr: any) {
                    console.error('Fallback failed:', fallbackErr)
                    toast.error(`Erro ao chamar IA: ${err.message || 'Erro de rede'}`, { duration: 5000 })
                }
            }

            // Fallback defaults if AI failed or returned null
            const targetSlug = classification?.category_slug || 'ideas'
            const entryType = (classification?.entry_type || 'note').toLowerCase()
            const metadata = classification?.metadata || { summary: text, priority: 'medium' } 
            
            // HYBRID INTELLIGENCE: Allow manual override of priority in metadata if AI failed OR if keyword is present
            // This acts as a fail-safe for the AI model
            const lowerText = text.toLowerCase()
            if (lowerText.includes('urgente') || lowerText.includes('urgent') || lowerText.includes('pra ontem')) {
                metadata.priority = 'urgent'
            } else if (!classification && !metadata.priority) {
                 metadata.priority = 'medium'
            }

            // HANDLE GOALS SEPARATELY
            if (entryType === 'goal') {
                // Metadata is already defined above

                
                // DATA NORMALIZATION: Ensure period_type matches Postgres check constraint
                // Database accepts ['daily', 'weekly', 'monthly']
                let periodType = (metadata.period_type || 'weekly').toLowerCase()
                if (!['daily', 'weekly', 'monthly'].includes(periodType)) {
                    periodType = 'weekly' // Fallback
                }
                
                // Calculate period start
                const now = new Date()
                let periodStart = now
                
                if (periodType === 'weekly') {
                    periodStart = startOfWeek(now, { weekStartsOn: 1 })
                } else if (periodType === 'monthly') {
                    periodStart = startOfMonth(now)
                } else {
                    // Daily: period_start is today
                    periodStart = now 
                }

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
                    status: 'pending',
                    checklist: metadata.checklist || [] // FIXED: Added checklist here
                })

                return { entry: goal, type: 'goal', categoryName: periodType === 'weekly' ? 'Meta Semanal' : (periodType === 'monthly' ? 'Meta Mensal' : 'Meta Diária') }
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
            // 3. Save to Supabase
            // Sanitize Priority and Status to avoid Check Constraint errors
            const validPriorities = ['low', 'medium', 'high', 'urgent']
            const validStatuses = ['pending', 'in_progress', 'done']

            let finalPriority = metadata.priority?.toLowerCase() || null
            if (finalPriority && !validPriorities.includes(finalPriority)) {
                finalPriority = null // Default to null (or 'medium' if you prefer, but null usually means 'none')
            }

            let finalStatus = classification?.status?.toLowerCase() || 'pending'
            if (!validStatuses.includes(finalStatus)) {
                finalStatus = 'pending'
            }

            // Client-side detection for "estou fazendo" if AI missed it (Fail-safe)
            // Reuse lowerText from above
            if (lowerText.startsWith('estou ') || lowerText.includes('fazendo') || lowerText.includes('andamento')) {
                finalStatus = 'in_progress'
            }

            const insertPayload = {
                user_id: user.id,
                content: text,
                category_id: categoryId, // If undefined, Supabase treats as null (which is allowed)
                entry_type: finalEntryType,
                metadata: metadata,
                status: finalStatus,
                due_date: metadata.due_date || null,
                priority: finalPriority,
                tags: metadata.tags || [],
                checklist: metadata.checklist || [] 
            }

            console.log('Inserting Entry Payload:', insertPayload)

            // @ts-ignore
            const { data: entry, error: dbError } = await (supabase as any)
                .from('entries')
                .insert(insertPayload)
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
