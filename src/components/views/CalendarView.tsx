import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/api/supabase'
import { Database } from '@/types/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Entry = Database['public']['Tables']['entries']['Row']

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function CalendarView() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const queryClient = useQueryClient()

    // Fetch all entries
    const { data: entries = [] } = useQuery<Entry[]>({
        queryKey: ['calendar-entries'],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('entries')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as Entry[]
        }
    })

    // Get days of current month with padding
    const calendarDays = useMemo(() => {
        const start = startOfMonth(currentMonth)
        const end = endOfMonth(currentMonth)
        const days = eachDayOfInterval({ start, end })
        
        // Add padding for days before month starts
        const startDayOfWeek = start.getDay()
        const paddingBefore = Array(startDayOfWeek).fill(null)
        
        // Add padding after
        const endDayOfWeek = end.getDay()
        const paddingAfter = Array(6 - endDayOfWeek).fill(null)
        
        return [...paddingBefore, ...days, ...paddingAfter]
    }, [currentMonth])

    // Get entries for a specific date
    const getEntriesForDate = (date: Date) => {
        return entries.filter(entry => {
            const entryDate = parseISO(entry.created_at)
            return isSameDay(entryDate, date)
        })
    }

    // Check if date has entries
    const hasEntries = (date: Date) => {
        return getEntriesForDate(date).length > 0
    }

    // Get entry stats for date
    const getDateStats = (date: Date) => {
        const dayEntries = getEntriesForDate(date)
        return {
            total: dayEntries.length,
            done: dayEntries.filter(e => e.status === 'done').length,
            pending: dayEntries.filter(e => e.status !== 'done').length
        }
    }

    // Toggle task status
    const toggleStatus = async (entry: Entry) => {
        const newStatus = entry.status === 'done' ? 'pending' : 'done'
        
        const { error } = await (supabase as any)
            .from('entries')
            .update({ status: newStatus })
            .eq('id', entry.id)

        if (error) {
            toast.error('Erro ao atualizar tarefa')
        } else {
            toast.success(newStatus === 'done' ? '✓ Tarefa concluída!' : 'Tarefa reaberta')
            queryClient.invalidateQueries({ queryKey: ['calendar-entries'] })
        }
    }

    const selectedDateEntries = selectedDate ? getEntriesForDate(selectedDate) : []

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header neutro e elegante */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-50 p-6 border border-slate-200/60">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-100 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-amber-500" />
                            Calendário
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Visualize suas tarefas ao longo do tempo
                        </p>
                    </div>
                    
                    {/* Stats pills */}
                    <div className="flex gap-2">
                        <div className="px-4 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm">
                            <p className="text-xs text-slate-500">Este mês</p>
                            <p className="text-lg font-bold text-slate-900">
                                {entries.filter(e => isSameMonth(parseISO(e.created_at), currentMonth)).length}
                            </p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm">
                            <p className="text-xs text-slate-500">Concluídas</p>
                            <p className="text-lg font-bold text-emerald-600">
                                {entries.filter(e => e.status === 'done' && isSameMonth(parseISO(e.created_at), currentMonth)).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar + Tasks Grid */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </motion.button>
                        
                        <motion.h2 
                            key={currentMonth.toISOString()}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-lg font-semibold text-slate-900 capitalize"
                        >
                            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                        </motion.h2>
                        
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </motion.button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 mb-2">
                        {WEEKDAYS.map(day => (
                            <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            if (!day) {
                                return <div key={`empty-${index}`} className="aspect-square" />
                            }

                            const dayHasEntries = hasEntries(day)
                            const stats = getDateStats(day)
                            const isSelected = selectedDate && isSameDay(day, selectedDate)
                            const isDayToday = isToday(day)

                            return (
                                <motion.button
                                    key={day.toISOString()}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedDate(day)}
                                    className={cn(
                                        "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all",
                                        isSelected 
                                            ? "bg-slate-900 text-white shadow-md" 
                                            : isDayToday
                                                ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200"
                                                : "hover:bg-slate-50 text-slate-700"
                                    )}
                                >
                                    <span className={cn(
                                        "text-sm font-medium",
                                        isSelected ? "text-white" : isDayToday ? "text-white" : ""
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                    
                                    {/* Indicator dots */}
                                    {dayHasEntries && !isSelected && (
                                        <div className="flex gap-0.5 mt-1">
                                            {stats.pending > 0 && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            )}
                                            {stats.done > 0 && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Selected indicator */}
                                    {isSelected && dayHasEntries && (
                                        <span className="text-[10px] font-bold text-white/90 mt-0.5">
                                            {stats.total}
                                        </span>
                                    )}
                                </motion.button>
                            )
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            Pendentes
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            Concluídas
                        </div>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
                    <AnimatePresence mode="wait">
                        {selectedDate ? (
                            <motion.div
                                key={selectedDate.toISOString()}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">
                                            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {selectedDateEntries.length} {selectedDateEntries.length === 1 ? 'tarefa' : 'tarefas'}
                                        </p>
                                    </div>
                                    {isToday(selectedDate) && (
                                        <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-medium">
                                            Hoje
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {selectedDateEntries.length > 0 ? (
                                        selectedDateEntries.map((entry, index) => (
                                            <motion.div
                                                key={entry.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={cn(
                                                    "group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                                                    entry.status === 'done'
                                                        ? "bg-slate-50/50 border-slate-100"
                                                        : "bg-white border-slate-200 hover:border-rose-200 hover:shadow-sm"
                                                )}
                                                onClick={() => toggleStatus(entry)}
                                            >
                                                {/* Emoji */}
                                                <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg bg-gradient-to-br from-rose-50 to-orange-50">
                                                    {(entry.metadata as any)?.emoji || '📌'}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        "text-sm font-medium line-clamp-2",
                                                        entry.status === 'done' 
                                                            ? "line-through text-slate-400" 
                                                            : "text-slate-900"
                                                    )}>
                                                        {entry.content}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {format(parseISO(entry.created_at), 'HH:mm')}
                                                        </span>
                                                        {entry.entry_type && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                                                {entry.entry_type}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Checkbox */}
                                                <motion.div 
                                                    whileHover={{ scale: 1.1 }}
                                                    className="flex-shrink-0"
                                                >
                                                    {entry.status === 'done' ? (
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                    ) : (
                                                        <Circle className="h-5 w-5 text-slate-300 group-hover:text-rose-400 transition-colors" />
                                                    )}
                                                </motion.div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                                <span className="text-2xl">📭</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-500">
                                                Nenhuma tarefa neste dia
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Crie uma nova entrada para começar
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-orange-100 rounded-2xl flex items-center justify-center mb-4">
                                    <span className="text-3xl">📅</span>
                                </div>
                                <p className="text-sm font-medium text-slate-500">
                                    Selecione um dia
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    para ver as tarefas
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
