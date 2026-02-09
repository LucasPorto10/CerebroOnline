import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GoalProgressProps {
    current: number
    target: number
    size?: 'sm' | 'md' | 'lg'
    showLabel?: boolean
    color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate'
}

const sizeMap = {
    sm: { width: 48, stroke: 4, fontSize: 'text-xs' },
    md: { width: 72, stroke: 5, fontSize: 'text-sm' },
    lg: { width: 96, stroke: 6, fontSize: 'text-lg' },
}

const colorMap = {
    indigo: { track: 'stroke-indigo-100', bar: 'stroke-indigo-500', text: 'text-indigo-600' },
    emerald: { track: 'stroke-emerald-100', bar: 'stroke-emerald-500', text: 'text-emerald-600' },
    amber: { track: 'stroke-amber-100', bar: 'stroke-amber-500', text: 'text-amber-600' },
    rose: { track: 'stroke-rose-100', bar: 'stroke-rose-500', text: 'text-rose-600' },
    slate: { track: 'stroke-slate-100', bar: 'stroke-slate-800', text: 'text-slate-800' },
}

export function GoalProgress({ 
    current, 
    target, 
    size = 'md', 
    showLabel = true,
    color = 'slate'  
}: GoalProgressProps) {
    const percentage = Math.min((current / target) * 100, 100)
    const isComplete = current >= target
    
    const { width, stroke, fontSize } = sizeMap[size]
    const colors = colorMap[isComplete ? 'emerald' : color]
    
    const radius = (width - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div className="relative flex items-center justify-center">
            <svg width={width} height={width} className="transform -rotate-90">
                {/* Background track */}
                <circle
                    cx={width / 2}
                    cy={width / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    className={colors.track}
                />
                {/* Progress bar */}
                <motion.circle
                    cx={width / 2}
                    cy={width / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    className={colors.bar}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ strokeDasharray: circumference }}
                />
            </svg>
            
            {showLabel && (
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={cn("absolute flex flex-col items-center", fontSize)}
                >
                    {isComplete ? (
                        <span className="text-emerald-500">✓</span>
                    ) : (
                        <>
                            <span className={cn("font-bold", colors.text)}>{current}</span>
                            <span className="text-slate-400 text-[10px]">/{target}</span>
                        </>
                    )}
                </motion.div>
            )}
        </div>
    )
}
