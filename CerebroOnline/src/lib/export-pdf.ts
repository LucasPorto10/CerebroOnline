import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ExportEntry } from './export'

export function exportToPDF(entries: ExportEntry[], stats: any) {
    const doc = new jsPDF()
    const today = new Date().toLocaleDateString('pt-BR')

    // Header
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.text('Relatório CerebroOnline', 14, 22)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Gerado em: ${today}`, 14, 30)

    // Stats Section
    doc.setDrawColor(200)
    doc.line(14, 35, 196, 35)
    
    doc.setFontSize(12)
    doc.setTextColor(60)
    doc.text('Resumo:', 14, 45)
    
    const statX = 14
    let currentX = statX
    const statGap = 40
    
    // Simple stats row
    doc.setFontSize(10)
    doc.text(`Total: ${stats.total}`, currentX, 52)
    currentX += statGap
    doc.text(`Concluídas: ${stats.done}`, currentX, 52)
    currentX += statGap
    doc.text(`Pendentes: ${stats.pending}`, currentX, 52)

    // Table
    const tableColumn = ["Data", "Conteúdo", "Categoria", "Status", "Tipo"]
    const tableRows: any[] = []

    entries.forEach(entry => {
        const entryDate = new Date(entry.created_at).toLocaleDateString('pt-BR')
        const statusMap: any = {
            'pending': 'Pendente',
            'in_progress': 'Em Andamento',
            'done': 'Concluído'
        }
        
        const entryData = [
            entryDate,
            entry.content,
            entry.category || '-',
            statusMap[entry.status] || entry.status,
            entry.entry_type === 'task' ? 'Tarefa' : 'Nota'
        ]
        tableRows.push(entryData)
    })

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 }, // Indigo-600
        alternateRowStyles: { fillColor: [245, 247, 255] }
    } as any)

    doc.save(`cerebro-online-relatorio-${today.replace(/\//g, '-')}.pdf`)
}
