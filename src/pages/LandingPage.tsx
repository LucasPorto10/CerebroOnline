import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Brain, Target, Zap, Shield, Sparkles, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NeuralParticles } from '@/components/landing/NeuralParticles'
import { MouseFollower } from '@/components/landing/MouseFollower'
import { RevealOnScroll } from '@/components/landing/RevealOnScroll'
import { cn } from '@/lib/utils'

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll()
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
            <NeuralParticles />
            <MouseFollower />

            {/* Floating Nav */}
            <motion.header 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6"
            >
                <nav className="flex items-center gap-4 sm:gap-8 px-6 sm:px-8 py-4 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-900/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
                            🧠
                        </div>
                        <span className="font-bold text-lg text-slate-900 dark:text-white hidden sm:block">CerebroOnline</span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                        <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Recursos</a>
                        <a href="#how" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Como Funciona</a>
                    </div>

                    <Link to="/auth">
                        <Button size="sm" className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-6 shadow-lg shadow-indigo-500/25">
                            Entrar
                        </Button>
                    </Link>
                </nav>
            </motion.header>


            {/* Hero Section */}
            <motion.section 
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-32"
            >
                {/* Gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/30 blur-[150px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full" />

                <div className="relative z-10 text-center max-w-5xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-10"
                    >
                        <Sparkles className="w-4 h-4" />
                        Powered by Gemini AI
                    </motion.div>

                    {/* Title with text reveal */}
                    <motion.h1 
                        className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.05]"
                    >
                        <TextReveal text="Seu Segundo" delay={0.3} />
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                            <TextReveal text="Cérebro" delay={0.6} />
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                    >
                        Capture pensamentos, defina metas e deixe a inteligência artificial 
                        organizar sua mente. Simples. Poderoso. Seu.
                    </motion.p>

                    {/* CTA Button with shimmer */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                    >
                        <Link to="/auth?signup=true">
                            <Button 
                                size="lg" 
                                className="group relative h-16 px-10 rounded-full text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-2xl shadow-indigo-500/30 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Criar Meu Segundo Cérebro
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </span>
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="flex flex-col items-center gap-2 text-slate-500"
                    >
                        <span className="text-xs uppercase tracking-widest">Explore</span>
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* Features Section */}
            <section id="features" className="relative py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <RevealOnScroll className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            O Poder da <span className="text-indigo-400">Organização Neural</span>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Ferramentas projetadas para quem busca clareza mental e execução perfeita.
                        </p>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RevealOnScroll delay={0.1}>
                            <FeatureCard
                                icon={Zap}
                                title="Captura Inteligente"
                                description="Dite ou escreva qualquer pensamento. A IA classifica automaticamente se é tarefa, nota ou meta."
                                gradient="from-amber-500 to-orange-600"
                            />
                        </RevealOnScroll>
                        <RevealOnScroll delay={0.2}>
                            <FeatureCard
                                icon={Target}
                                title="Metas Progressivas"
                                description="Defina objetivos semanais e mensais com acompanhamento visual em tempo real."
                                gradient="from-emerald-500 to-teal-600"
                            />
                        </RevealOnScroll>
                        <RevealOnScroll delay={0.3}>
                            <FeatureCard
                                icon={Brain}
                                title="IA Nativa (Gemini)"
                                description="Modelo mais avançado do Google para insights e organização supra-humana."
                                gradient="from-indigo-500 to-purple-600"
                            />
                        </RevealOnScroll>
                        <RevealOnScroll delay={0.4}>
                            <FeatureCard
                                icon={Shield}
                                title="Segurança Total"
                                description="Seus dados criptografados com autenticação de ponta a ponta via Supabase."
                                gradient="from-rose-500 to-pink-600"
                            />
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how" className="relative py-32 px-6 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent">
                <div className="max-w-5xl mx-auto">
                    <RevealOnScroll className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            Três Passos para a <span className="text-purple-400">Clareza</span>
                        </h2>
                    </RevealOnScroll>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-pink-500/50 hidden md:block" />

                        <div className="space-y-16">
                            <RevealOnScroll direction="left" delay={0.1}>
                                <TimelineStep
                                    number="01"
                                    title="Capture"
                                    description="Dite ou escreva qualquer pensamento que vier à mente. Não se preocupe com organização."
                                    align="left"
                                />
                            </RevealOnScroll>
                            <RevealOnScroll direction="right" delay={0.2}>
                                <TimelineStep
                                    number="02"
                                    title="IA Processa"
                                    description="O Gemini analisa, classifica e organiza automaticamente em categorias inteligentes."
                                    align="right"
                                />
                            </RevealOnScroll>
                            <RevealOnScroll direction="left" delay={0.3}>
                                <TimelineStep
                                    number="03"
                                    title="Visualize"
                                    description="Acesse seu dashboard personalizado e veja tudo estruturado, pronto para execução."
                                    align="left"
                                />
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative py-32 px-6">
                <RevealOnScroll>
                    <div className="max-w-4xl mx-auto">
                        <div className="relative p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-indigo-500/20 backdrop-blur-xl overflow-hidden">
                            {/* Animated border */}
                            <div className="absolute inset-0 rounded-[3rem] p-[2px] overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-spin-slow" style={{ animationDuration: '10s' }} />
                            </div>
                            
                            <div className="relative z-10 text-center">
                                <h2 className="text-4xl md:text-6xl font-bold mb-8">
                                    Pronto para transformar<br />sua mente?
                                </h2>
                                <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">
                                    Junte-se aos que já descobriram o poder de ter um segundo cérebro organizado por IA.
                                </p>
                                <Link to="/auth?signup=true">
                                    <Button 
                                        size="lg" 
                                        className="h-16 px-12 rounded-full text-xl font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-2xl"
                                    >
                                        Criar Meu Segundo Cérebro
                                    </Button>
                                </Link>
                                <p className="text-slate-500 text-sm mt-8">100% grátis para começar. Sem cartão de crédito.</p>
                            </div>
                        </div>
                    </div>
                </RevealOnScroll>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">
                            🧠
                        </div>
                        <span className="font-bold">CerebroOnline</span>
                        <span className="text-slate-600 text-sm">by PortoSol</span>
                    </div>
                    <p className="text-slate-500 text-sm">© 2026 CerebroOnline. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    )
}

// Text Reveal Animation Component
function TextReveal({ text, delay = 0 }: { text: string; delay?: number }) {
    return (
        <span className="inline-block overflow-hidden">
            <motion.span
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ delay, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="inline-block"
            >
                {text}
            </motion.span>
        </span>
    )
}

// Feature Card Component
function FeatureCard({ 
    icon: Icon, 
    title, 
    description, 
    gradient 
}: { 
    icon: any
    title: string
    description: string
    gradient: string
}) {
    return (
        <div className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden">
            {/* Hover glow */}
            <div className={cn(
                "absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500",
                gradient
            )} />
            
            <div className="relative z-10">
                <div className={cn(
                    "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-lg",
                    gradient
                )}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{title}</h3>
                <p className="text-slate-400 leading-relaxed">{description}</p>
            </div>
        </div>
    )
}

// Timeline Step Component
function TimelineStep({ 
    number, 
    title, 
    description, 
    align 
}: { 
    number: string
    title: string
    description: string
    align: 'left' | 'right'
}) {
    return (
        <div className={cn(
            "flex items-center gap-8",
            align === 'right' && "md:flex-row-reverse"
        )}>
            <div className={cn(
                "flex-1",
                align === 'right' && "md:text-right"
            )}>
                <span className="text-6xl font-black text-white/10">{number}</span>
                <h3 className="text-2xl font-bold mb-2 -mt-4">{title}</h3>
                <p className="text-slate-400">{description}</p>
            </div>
            <div className="hidden md:flex w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <span className="text-xl font-bold">{number}</span>
            </div>
            <div className="flex-1 hidden md:block" />
        </div>
    )
}
