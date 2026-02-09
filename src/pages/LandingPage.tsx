import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Brain, Target, Zap, Shield, Sparkles, ChevronDown, Rocket } from 'lucide-react'
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
                <nav className="flex items-center gap-4 sm:gap-8 px-6 sm:px-8 py-4 rounded-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-xl shadow-lg">
                            🧠
                        </div>
                        <span className="font-bold text-lg text-white hidden sm:block">CerebroOnline</span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
                        <a href="#features" className="hover:text-white transition-colors">Recursos</a>
                        <a href="#how" className="hover:text-white transition-colors">Como Funciona</a>
                    </div>

                    <Link to="/auth">
                        <Button size="sm" className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6">
                            Acessar Agora
                        </Button>
                    </Link>
                </nav>
            </motion.header>

            {/* Hero Section */}
            <motion.section 
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-32"
            >
                {/* Subtle glow - no crazy gradients */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[150px] rounded-full" />

                <div className="relative z-10 text-center max-w-5xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-10"
                    >
                        <Sparkles className="w-4 h-4" />
                        Powered by Gemini AI
                    </motion.div>

                    {/* Title - clean, no gradient text */}
                    <motion.h1 
                        className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.05]"
                    >
                        <TextReveal text="Seu Segundo" delay={0.3} />
                        <br />
                        <span className="text-emerald-400">
                            <TextReveal text="Cérebro" delay={0.6} />
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                    >
                        Pare de perder ideias. Capture pensamentos, cumpra metas e deixe a IA 
                        organizar sua vida. <strong className="text-white">Sua mente agradece.</strong>
                    </motion.p>

                    {/* CTA Button - solid, no gradient */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/auth?signup=true">
                            <Button 
                                size="lg" 
                                className="group relative h-16 px-10 rounded-full text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    <Rocket className="w-5 h-5" />
                                    Começar Grátis Agora
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </span>
                            </Button>
                        </Link>
                        <p className="text-sm text-slate-500">✓ Sem cartão • ✓ Cancele quando quiser</p>
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
                        <span className="text-xs uppercase tracking-widest">Descubra</span>
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* Features Section */}
            <section id="features" className="relative py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <RevealOnScroll className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            Por que o <span className="text-emerald-400">CerebroOnline</span>?
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Tudo que você precisa para dominar suas ideias e alcançar seus objetivos.
                        </p>
                    </RevealOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RevealOnScroll delay={0.1}>
                            <FeatureCard
                                icon={Zap}
                                title="Captura em Segundos"
                                description="Digite ou dite. A IA entende e classifica instantaneamente. Zero fricção."
                                color="text-amber-400"
                                bgColor="bg-amber-500/10"
                            />
                        </RevealOnScroll>
                        <RevealOnScroll delay={0.2}>
                            <FeatureCard
                                icon={Target}
                                title="Metas que Funcionam"
                                description="Defina, acompanhe e conquiste. Veja seu progresso em tempo real."
                                color="text-emerald-400"
                                bgColor="bg-emerald-500/10"
                            />
                        </RevealOnScroll>
                        <RevealOnScroll delay={0.3}>
                            <FeatureCard
                                icon={Brain}
                                title="IA que Entende Você"
                                description="Gemini AI organiza tudo automaticamente. Como um assistente 24/7."
                                color="text-cyan-400"
                                bgColor="bg-cyan-500/10"
                            />
                        </RevealOnScroll>
                        <RevealOnScroll delay={0.4}>
                            <FeatureCard
                                icon={Shield}
                                title="100% Seguro"
                                description="Seus pensamentos são privados. Criptografia de ponta a ponta."
                                color="text-rose-400"
                                bgColor="bg-rose-500/10"
                            />
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how" className="relative py-32 px-6 bg-slate-900/50">
                <div className="max-w-5xl mx-auto">
                    <RevealOnScroll className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            Simples como <span className="text-emerald-400">1, 2, 3</span>
                        </h2>
                    </RevealOnScroll>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700 hidden md:block" />

                        <div className="space-y-16">
                            <RevealOnScroll direction="left" delay={0.1}>
                                <TimelineStep
                                    number="01"
                                    title="Capture"
                                    description="Pensou em algo? Anote. Sem formatação, sem regras."
                                    align="left"
                                />
                            </RevealOnScroll>
                            <RevealOnScroll direction="right" delay={0.2}>
                                <TimelineStep
                                    number="02"
                                    title="IA Organiza"
                                    description="Em milissegundos, o Gemini classifica: tarefa, ideia, meta ou nota."
                                    align="right"
                                />
                            </RevealOnScroll>
                            <RevealOnScroll direction="left" delay={0.3}>
                                <TimelineStep
                                    number="03"
                                    title="Você Executa"
                                    description="Veja tudo organizado no seu dashboard. Foque no que importa."
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
                        <div className="relative p-12 md:p-20 rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden">
                            {/* Subtle glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/20 blur-[100px]" />
                            
                            <div className="relative z-10 text-center">
                                <h2 className="text-4xl md:text-5xl font-bold mb-8">
                                    Chega de caos mental.
                                </h2>
                                <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">
                                    Milhares já organizaram suas vidas. Você vai continuar perdendo ideias?
                                </p>
                                <Link to="/auth?signup=true">
                                    <Button 
                                        size="lg" 
                                        className="h-16 px-12 rounded-full text-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl"
                                    >
                                        🚀 Quero Organizar Minha Mente
                                    </Button>
                                </Link>
                                <p className="text-slate-500 text-sm mt-8">Comece em 30 segundos. É grátis.</p>
                            </div>
                        </div>
                    </div>
                </RevealOnScroll>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-slate-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-sm">
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

// Feature Card Component - clean, no gradients
function FeatureCard({ 
    icon: Icon, 
    title, 
    description, 
    color,
    bgColor
}: { 
    icon: any
    title: string
    description: string
    color: string
    bgColor: string
}) {
    return (
        <div className="group relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all duration-300">
            <div className="relative z-10">
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-6", bgColor)}>
                    <Icon className={cn("w-7 h-7", color)} />
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
                <span className="text-6xl font-black text-slate-800">{number}</span>
                <h3 className="text-2xl font-bold mb-2 -mt-4">{title}</h3>
                <p className="text-slate-400">{description}</p>
            </div>
            <div className="hidden md:flex w-16 h-16 rounded-full bg-emerald-500 items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-xl font-bold text-white">{number}</span>
            </div>
            <div className="flex-1 hidden md:block" />
        </div>
    )
}
