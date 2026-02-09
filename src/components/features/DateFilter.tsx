import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isWithinInterval, subDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export type DateRange = {
    start: Date | null
    end: Date | null
}

interface DateFilterProps {
    value: DateRange
    onChange: (range: DateRange) => void
    className?: string
    /** Array of date strings (ISO format) that have entries */
    datesWithEntries?: string[]
}

const quickFilters = [
    { label: 'Hoje', getValue: () => ({ start: new Date(), end: new Date() }) },
    { label: '7 dias', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
    { label: '30 dias', getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
    { label: 'Este mês', getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
]

export function DateFilter({ value, onChange, className, datesWithEntries = [] }: DateFilterProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectingStart, setSelectingStart] = useState(true)

    const calendarDays = (() => {
        const start = startOfMonth(currentMonth)
        const end = endOfMonth(currentMonth)
        const days = eachDayOfInterval({ start, end })
        
        const startDayOfWeek = start.getDay()
        const paddingBefore = Array(startDayOfWeek).fill(null)
        
        const endDayOfWeek = end.getDay()
        const paddingAfter = Array(6 - endDayOfWeek).fill(null)
        
        return [...paddingBefore, ...days, ...paddingAfter]
    })()

    // Check if a day has entries
    const dayHasEntries = (day: Date) => {
        return datesWithEntries.some(dateStr => {
            try {
                return isSameDay(parseISO(dateStr), day)
            } catch {
                return false
            }
        })
    }

    const handleDayClick = (day: Date) => {
        if (selectingStart) {
            onChange({ start: day, end: null })
            setSelectingStart(false)
        } else {
            if (value.start && day < value.start) {
                onChange({ start: day, end: value.start })
            } else {
                onChange({ start: value.start, end: day })
            }
            setSelectingStart(true)
            setIsOpen(false)
        }
    }

    const handleQuickFilter = (filter: typeof quickFilters[0]) => {
        onChange(filter.getValue())
        setIsOpen(false)
    }

    const clearFilter = () => {
        onChange({ start: null, end: null })
        setIsOpen(false)
    }

    const isInRange = (day: Date) => {
        if (!value.start || !value.end) return false
        return isWithinInterval(day, { start: value.start, end: value.end })
    }

    const hasFilter = value.start !== null

    const getFilterLabel = () => {
        if (!value.start) return 'Filtrar por data'
        if (!value.end || isSameDay(value.start, value.end)) {
            return format(value.start, "d 'de' MMM", { locale: ptBR })
        }
        return `${format(value.start, "d MMM", { locale: ptBR })} - ${format(value.end, "d MMM", { locale: ptBR })}`
    }

    return (
        <div className={cn("relative", className)}>
            {/* Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border",
                    hasFilter 
                        ? "bg-slate-100 border-slate-300 text-slate-800"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                )}
            >
                <Calendar className="h-4 w-4" />
                <span>{getFilterLabel()}</span>
                {hasFilter && (
                    <button
                        onClick={(e) => { e.stopPropagation(); clearFilter() }}
                        className="ml-1 p-0.5 rounded-full hover:bg-slate-300/50"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                        />
                        
                        {/* Calendar Popup */}
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 w-[300px]"
                        >
                            {/* Quick Filters */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {quickFilters.map((filter) => (
                                    <button
                                        key={filter.label}
                                        onClick={() => handleQuickFilter(filter)}
                                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>

                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-sm font-medium text-slate-900 capitalize">
                                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                                </span>
                                <button
                                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Weekdays */}
                            <div className="grid grid-cols-7 mb-1">
                                {WEEKDAYS.map((day, i) => (
                                    <div key={i} className="text-center text-[10px] font-medium text-slate-400 py-1">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-0.5">
                                {calendarDays.map((day, index) => {
                                    if (!day) return <div key={`empty-${index}`} className="aspect-square" />

                                    const isSelected = (value.start && isSameDay(day, value.start)) || (value.end && isSameDay(day, value.end))
                                    const inRange = isInRange(day)
                                    const isDayToday = isToday(day)
                                    const hasEntries = dayHasEntries(day)

                                    return (
                                        <button
                                            key={day.toISOString()}
                                            onClick={() => handleDayClick(day)}
                                            className={cn(
                                                "aspect-square rounded-lg text-xs font-medium transition-all relative",
                                                isSelected 
                                                    ? "bg-slate-900 text-white" 
                                                    : inRange
                                                        ? "bg-slate-200 text-slate-700"
                                                        : isDayToday
                                                            ? "bg-slate-800 text-white"
                                                            : "hover:bg-slate-100 text-slate-700"
                                            )}
                                        >
                                            {format(day, 'd')}
                                            {/* Entry indicator dot */}
                                            {hasEntries && !isSelected && (
                                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Legend */}
                            <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-100">
                                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Com itens
                                </span>
                            </div>

                            {/* Selection hint */}
                            <p className="text-[10px] text-slate-400 text-center mt-2">
                                {selectingStart ? 'Selecione a data inicial' : 'Selecione a data final'}
                            </p>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
