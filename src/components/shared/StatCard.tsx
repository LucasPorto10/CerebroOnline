import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    label: string
    count: number | string
    icon: LucideIcon
    color?: string
    variant?: 'amber' | 'blue' | 'emerald' | 'indigo' | 'slate'
    isLoading?: boolean
    index?: number
}

export function StatCard({ 
    label, 
    count, 
    icon: Icon, 
    variant = 'slate',
    isLoading = false,
    index = 0
}: StatCardProps) {
    const variants = {
        amber: {
            text: 'text-amber-600',
            bg: 'bg-amber-50/50',
            border: 'border-amber-100/50',
            icon: 'text-amber-500'
        },
        blue: {
            text: 'text-blue-600',
            bg: 'bg-blue-50/50',
            border: 'border-blue-100/50',
            icon: 'text-blue-500'
        },
        emerald: {
            text: 'text-emerald-600',
            bg: 'bg-emerald-50/50',
            border: 'border-emerald-100/50',
            icon: 'text-emerald-500'
        },
        indigo: {
            text: 'text-indigo-600',
            bg: 'bg-indigo-50/50',
            border: 'border-indigo-100/50',
            icon: 'text-indigo-500'
        },
        slate: {
            text: 'text-muted-foreground',
            bg: 'bg-muted/50',
            border: 'border-border/50',
            icon: 'text-muted-foreground'
        }
    }

    const style = variants[variant]

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className={cn(
                "group relative p-6 rounded-3xl border glass-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 overflow-hidden",
                style.border
            )}
        >
            {/* Subtle background glow */}
            <div className={cn("absolute -top-10 -right-10 w-24 h-24 blur-3xl opacity-20 rounded-full transition-opacity group-hover:opacity-40", style.bg)} />
            
            <div className="relative flex flex-col items-start gap-4">
                <div className={cn("p-2.5 rounded-2xl flex items-center justify-center transition-colors", style.bg)}>
                    <Icon className={cn("h-5 w-5", style.icon)} />
                </div>
                
                <div className="flex flex-col">
                    <span className={cn("text-3xl font-bold tracking-tight text-foreground")}>
                        {isLoading ? '...' : count}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground mt-0.5 uppercase tracking-widest">
                        {label}
                    </span>
                </div>
            </div>
        </motion.div>
    )
}
