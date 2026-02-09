import { supabase } from '@/api/supabase'
import { toast } from 'sonner'

export interface ExportEntry {
    id: string
    content: string
    entry_type: string
    status: string
    category?: string
    created_at: string
    metadata?: any
}

export async function fetchAllEntries(): Promise<ExportEntry[]> {
    const { data, error } = await supabase
        .from('entries')
        .select(`
            id,
            content,
            entry_type,
            status,
            created_at,
            metadata,
            categories (name)
        `)
        .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((entry: any) => ({
        id: entry.id,
        content: entry.content,
        entry_type: entry.entry_type,
        status: entry.status,
        category: entry.categories?.name || 'Sem categoria',
        created_at: entry.created_at,
        metadata: entry.metadata,
    }))
}

export function exportToJSON(entries: ExportEntry[]) {
    const dataStr = JSON.stringify(entries, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    downloadBlob(blob, `mindsync-export-${getDateString()}.json`)
    toast.success(`${entries.length} itens exportados para JSON`)
}

export function exportToCSV(entries: ExportEntry[]) {
    const headers = ['ID', 'Conteúdo', 'Tipo', 'Status', 'Categoria', 'Criado em', 'Tags']
    const rows = entries.map((entry) => [
        entry.id,
        `"${entry.content.replace(/"/g, '""')}"`, // Escape quotes in CSV
        entry.entry_type,
        entry.status,
        entry.category || '',
        new Date(entry.created_at).toLocaleString('pt-BR'),
        entry.metadata?.tags?.join(', ') || '',
    ])

    const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }) // BOM for Excel
    downloadBlob(blob, `mindsync-export-${getDateString()}.csv`)
    toast.success(`${entries.length} itens exportados para CSV`)
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

function getDateString() {
    return new Date().toISOString().split('T')[0]
}
