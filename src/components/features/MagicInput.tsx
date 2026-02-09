'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Sparkles, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

interface MagicInputProps {
    onSend: (text: string) => void
    disabled?: boolean
}

export function MagicInput({ onSend, disabled }: MagicInputProps) {
    const [text, setText] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
        }
    }, [text])

    const handleSubmit = async () => {
        if (!text.trim() || disabled) return

        try {
            await onSend(text)
            setText('')
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'
                textareaRef.current.focus()
            }
        } catch (error) {
            console.error("Failed to send", error)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-2xl mx-auto"
        >
            {/* Decorative glow */}
            <div className={cn(
                "absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-3xl blur-xl transition-opacity duration-500",
                isFocused ? "opacity-100" : "opacity-0"
            )} />
            
            {/* Main container */}
            <div
                className={cn(
                    "relative rounded-2xl border bg-white transition-all duration-300",
                    isFocused 
                        ? "border-indigo-300 shadow-xl shadow-indigo-100/50" 
                        : "border-slate-200 shadow-lg shadow-slate-100/50 hover:border-slate-300 hover:shadow-xl"
                )}
            >
                {/* Header badge */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <Wand2 className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Captura Inteligente</span>
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Sparkles className="h-3 w-3" />
                        <span>Gemini AI</span>
                    </div>
                </div>

                {/* Input area */}
                <div className="relative flex flex-col p-2">
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Tarefa, ideia, lembrete... digite qualquer coisa!"
                        className="w-full min-h-[80px] max-h-[200px] p-4 pr-16 text-base bg-transparent border-none resize-none focus:ring-0 placeholder:text-slate-400 text-slate-800 leading-relaxed outline-none"
                        disabled={disabled}
                        rows={1}
                    />

                    {/* Submit button */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        {disabled ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium"
                            >
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Processando...</span>
                            </motion.div>
                        ) : (
                            <AnimatePresence>
                                {text.trim() && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8, x: 10 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, x: 10 }}
                                        onClick={handleSubmit}
                                        className="p-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
                                    >
                                        <Send className="h-5 w-5" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Keyboard hint */}
                <div className={cn(
                    "flex items-center justify-center gap-2 py-2 border-t border-slate-50 text-xs text-slate-400 transition-opacity",
                    isFocused ? "opacity-100" : "opacity-50"
                )}>
                    <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Enter</kbd>
                    <span>para enviar</span>
                    <span className="text-slate-300">|</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Shift + Enter</kbd>
                    <span>nova linha</span>
                </div>
            </div>
        </motion.div>
    )
}
