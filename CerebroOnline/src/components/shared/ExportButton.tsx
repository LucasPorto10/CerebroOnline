import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExportButtonProps {
    label: string
    icon: LucideIcon
    onClick: () => void
    disabled?: boolean
    variant?: 'primary' | 'secondary'
    className?: string
}

export function ExportButton({ 
    label, 
    icon: Icon, 
    onClick, 
    disabled = false,
    variant = 'secondary',
    className
}: ExportButtonProps) {
    const variants = {
        primary: 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-100',
        secondary: 'text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-100'
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all border disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    )
}
