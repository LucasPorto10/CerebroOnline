import { useEffect, useRef, useState, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface RevealOnScrollProps {
    children: ReactNode
    direction?: 'up' | 'down' | 'left' | 'right'
    delay?: number
    className?: string
}

export function RevealOnScroll({ 
    children, 
    direction = 'up', 
    delay = 0,
    className = ''
}: RevealOnScrollProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReducedMotion) {
            setIsVisible(true)
            return
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(entry.target)
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => observer.disconnect()
    }, [])

    const getInitialPosition = () => {
        switch (direction) {
            case 'up': return { y: 60, x: 0 }
            case 'down': return { y: -60, x: 0 }
            case 'left': return { x: 60, y: 0 }
            case 'right': return { x: -60, y: 0 }
        }
    }

    const initial = getInitialPosition()

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, ...initial }}
            animate={isVisible ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ 
                duration: 0.8, 
                delay, 
                ease: [0.25, 0.46, 0.45, 0.94] 
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
