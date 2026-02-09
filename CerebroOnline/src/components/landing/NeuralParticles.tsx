import { useEffect, useRef } from 'react'

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
}

export function NeuralParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number>()
    const particlesRef = useRef<Particle[]>([])
    const mouseRef = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReducedMotion) return

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        const createParticles = () => {
            const particleCount = Math.min(80, Math.floor(window.innerWidth / 20))
            particlesRef.current = []
            
            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 2 + 1
                })
            }
        }

        const drawParticle = (p: Particle) => {
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(16, 185, 129, 0.4)'
            ctx.fill()
        }

        const drawConnections = () => {
            const particles = particlesRef.current
            const connectionDistance = 150

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < connectionDistance) {
                        const opacity = (1 - distance / connectionDistance) * 0.3
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.6})`
                        ctx.lineWidth = 1
                        ctx.stroke()
                    }
                }

                // Connect to mouse
                const dx = particles[i].x - mouseRef.current.x
                const dy = particles[i].y - mouseRef.current.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < 200) {
                    const opacity = (1 - distance / 200) * 0.5
                    ctx.beginPath()
                    ctx.moveTo(particles[i].x, particles[i].y)
                    ctx.lineTo(mouseRef.current.x, mouseRef.current.y)
                    ctx.strokeStyle = `rgba(52, 211, 153, ${opacity * 0.7})`
                    ctx.lineWidth = 1.5
                    ctx.stroke()
                }
            }
        }

        const updateParticles = () => {
            const particles = particlesRef.current

            for (const p of particles) {
                p.x += p.vx
                p.y += p.vy

                // Bounce off edges
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1

                // Subtle attraction to mouse
                const dx = mouseRef.current.x - p.x
                const dy = mouseRef.current.y - p.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < 300 && distance > 50) {
                    p.vx += (dx / distance) * 0.02
                    p.vy += (dy / distance) * 0.02
                }

                // Limit velocity
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
                if (speed > 1.5) {
                    p.vx = (p.vx / speed) * 1.5
                    p.vy = (p.vy / speed) * 1.5
                }
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            
            drawConnections()
            particlesRef.current.forEach(drawParticle)
            updateParticles()

            animationRef.current = requestAnimationFrame(animate)
        }

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }

        resizeCanvas()
        createParticles()
        animate()

        window.addEventListener('resize', () => {
            resizeCanvas()
            createParticles()
        })
        window.addEventListener('mousemove', handleMouseMove)

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
            window.removeEventListener('resize', resizeCanvas)
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background: 'transparent' }}
        />
    )
}
