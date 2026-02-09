import { useEffect, useRef } from 'react'
import { supabase } from '@/api/supabase'
import { useQueryClient } from '@tanstack/react-query'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

interface Entry {
    id: string
    content: string
    metadata?: Record<string, any> | null
}

/**
 * Hook that automatically assigns emojis to entries that don't have one
 * by calling the Gemini Edge Function
 */
export function useAutoEmoji(entries: Entry[] | undefined) {
    const queryClient = useQueryClient()
    const processingRef = useRef<Set<string>>(new Set())

    useEffect(() => {
        if (!entries || entries.length === 0) return

        const assignEmojis = async () => {
            // Find entries without emojis
            const entriesWithoutEmoji = entries.filter(entry => {
                const emoji = (entry.metadata as any)?.emoji
                return !emoji && !processingRef.current.has(entry.id)
            })

            if (entriesWithoutEmoji.length === 0) return

            // Process in batches of 3 to not overwhelm the API
            const batch = entriesWithoutEmoji.slice(0, 3)

            for (const entry of batch) {
                processingRef.current.add(entry.id)

                try {
                    // Call the classify-entry Edge Function
                    const response = await fetch(`${SUPABASE_URL}/functions/v1/classify-entry`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        },
                        body: JSON.stringify({ content: entry.content }),
                    })

                    if (!response.ok) {
                        console.error('Error calling Edge Function:', response.statusText)
                        processingRef.current.delete(entry.id)
                        continue
                    }

                    const result = await response.json()
                    const emoji = result?.metadata?.emoji

                    if (emoji) {
                        // Update the entry with the new emoji
                        const currentMetadata = entry.metadata || {}
                        await supabase
                            .from('entries')
                            // @ts-ignore
                            .update({
                                metadata: { ...currentMetadata, emoji }
                            })
                            .eq('id', entry.id)

                        // Invalidate queries to refresh the UI
                        queryClient.invalidateQueries({ queryKey: ['entries'] })
                        queryClient.invalidateQueries({ queryKey: ['calendar-entries'] })
                    }
                } catch (error) {
                    console.error('Error assigning emoji:', error)
                } finally {
                    processingRef.current.delete(entry.id)
                }
            }
        }

        // Small delay to avoid running on every render
        const timeoutId = setTimeout(assignEmojis, 1000)
        return () => clearTimeout(timeoutId)
    }, [entries, queryClient])
}
