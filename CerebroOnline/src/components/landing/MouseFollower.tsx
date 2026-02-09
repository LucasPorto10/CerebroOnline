import { useEffect, useState } from 'react'

export function MouseFollower() {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReducedMotion) return

        // Hide on mobile/touch devices
        const isTouchDevice = 'ontouchstart' in window
        if (isTouchDevice) return

        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY })
            if (!isVisible) setIsVisible(true)
        }

        const handleMouseLeave = () => {
            setIsVisible(false)
        }

        window.addEventListener('mousemove', handleMouseMove)
        document.documentElement.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [isVisible])

    if (!isVisible) return null

    return (
        <div
            className="fixed pointer-events-none z-50 transition-opacity duration-300"
            style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%)',
                opacity: isVisible ? 1 : 0
            }}
        >
            {/* Outer glow */}
            <div 
                className="absolute rounded-full bg-primary/20 blur-3xl"
                style={{
                    width: 300,
                    height: 300,
                    transform: 'translate(-50%, -50%)'
                }}
            />
            {/* Inner core */}
            <div 
                className="absolute rounded-full bg-primary/30 blur-xl"
                style={{
                    width: 100,
                    height: 100,
                    transform: 'translate(-50%, -50%)'
                }}
            />
        </div>
    )
}
