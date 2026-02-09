import { MagicInput } from '@/components/features/MagicInput'
import { RecentEntries } from '@/components/features/RecentEntries'
import { StatCard } from '@/components/shared/StatCard'
import { ExportButton } from '@/components/shared/ExportButton'
import { useCapture } from '@/hooks/useCapture'
import { useStats } from '@/hooks/useStats'
import { useAuth } from '@/providers/auth-provider'
import { motion } from 'framer-motion'
import { FileJson, FileSpreadsheet, FileText, Download, Sparkles, LayoutDashboard, Clock, PlayCircle, CheckCircle2, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { fetchAllEntries, exportToJSON, exportToCSV } from '@/lib/export'
import { exportToPDF } from '@/lib/export-pdf'
import { toast } from 'sonner'

export default function Home() {
    const { user } = useAuth()
    const captureMutation = useCapture()
    const { data: statsData, isLoading: statsLoading } = useStats()
    const [exporting, setExporting] = useState(false)

    const stats = [
        { label: 'Pendentes', count: statsData?.pending ?? 0, icon: Clock, variant: 'amber' as const },
        { label: 'Em Progresso', count: statsData?.inProgress ?? 0, icon: PlayCircle, variant: 'blue' as const },
        { label: 'Concluídas', count: statsData?.completed ?? 0, icon: CheckCircle2, variant: 'emerald' as const },
        { label: 'Notas', count: (statsData?.notes ?? 0) + (statsData?.ideas ?? 0), icon: BookOpen, variant: 'indigo' as const },
    ]

    const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
        setExporting(true)
        const toastId = toast.loading('Gerando relatório...')
        try {
            const entries = await fetchAllEntries()
            if (entries.length === 0) {
                toast.dismiss(toastId)
                toast.warning('Nenhum item para exportar')
                return
            }

            if (format === 'json') {
                exportToJSON(entries)
            } else if (format === 'csv') {
                exportToCSV(entries)
            } else if (format === 'pdf') {
                exportToPDF(entries, {
                    total: statsData?.totalEntries || 0,
                    done: statsData?.completed || 0,
                    pending: statsData?.pending || 0
                })
            }
            toast.dismiss(toastId)
            toast.success(`Exportação ${format.toUpperCase()} concluída!`)
        } catch (error: any) {
            toast.dismiss(toastId)
            toast.error('Erro ao exportar', { description: error.message })
        } finally {
            setExporting(false)
        }
    }

    return (
        <motion.div
            className="flex flex-col min-h-screen space-y-8 pb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            {/* Header Section */}
            <div className="relative -mx-4 -mt-4 px-4 pt-10 pb-14 bg-gradient-to-b from-primary/5 via-background to-background border-b border-border/50">
                <div className="max-w-4xl mx-auto space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
                                Olá, {user?.user_metadata.full_name?.split(' ')[0] || 'Viajante'}
                                <span className="text-2xl">👋</span>
                            </h1>
                            <p className="text-base text-muted-foreground mt-2 max-w-xl">
                                O que vamos realizar hoje? Deixe sua mente fluir e a IA organizar.
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 bg-card glass px-4 py-2 rounded-2xl shadow-sm border border-border">
                            <LayoutDashboard className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
                        </div>
                    </motion.div>

                    {/* Magic Input */}
                    <motion.div
                        className="w-full relative z-10"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 }}
                    >
                        <MagicInput
                            onSend={(text) => captureMutation.mutate(text)}
                            disabled={captureMutation.isPending}
                        />
                    </motion.div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto w-full px-4 space-y-10">
                {/* Stats Grid */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                        <h2 className="text-lg font-semibold text-foreground">Visão Geral</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, index) => (
                            <StatCard
                                key={stat.label}
                                label={stat.label}
                                count={stat.count}
                                icon={stat.icon}
                                variant={stat.variant}
                                isLoading={statsLoading}
                                index={index}
                            />
                        ))}
                    </div>
                </section>

                {/* Main Content Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Entries */}
                    <motion.section 
                        className="lg:col-span-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <RecentEntries />
                    </motion.section>

                    {/* Export Sidebar */}
                    <motion.aside 
                        className="space-y-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center gap-2">
                            <Download className="h-4 w-4 text-indigo-500" />
                            <h2 className="text-lg font-semibold text-foreground">Exportar</h2>
                        </div>
                        
                <div className="bg-card glass p-5 rounded-2xl border border-border shadow-sm space-y-4">
                    <p className="text-xs text-muted-foreground">
                        Baixe seus dados para backup ou análise.
                    </p>
                            
                            <ExportButton
                                label="Relatório PDF"
                                icon={FileText}
                                onClick={() => handleExport('pdf')}
                                disabled={exporting}
                                variant="primary"
                                className="w-full"
                            />
                            
                            <div className="grid grid-cols-2 gap-3">
                                <ExportButton
                                    label="CSV"
                                    icon={FileSpreadsheet}
                                    onClick={() => handleExport('csv')}
                                    disabled={exporting}
                                />
                                <ExportButton
                                    label="JSON"
                                    icon={FileJson}
                                    onClick={() => handleExport('json')}
                                    disabled={exporting}
                                />
                            </div>
                        </div>
                    </motion.aside>
                </div>
            </div>
        </motion.div>
    )
}
