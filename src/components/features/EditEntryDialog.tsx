import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/api/supabase'
import { Subject, Entry } from '@/types/supabase'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Loader2, BookOpen, Calendar, Tag, CheckCircle2, Clock, PlayCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TagInput, TagSuggestions } from '@/components/features/TagInput'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EditEntryDialogProps {
    entry: Entry
    onClose: () => void
    onUpdate?: () => void
}

const statusOptions = [
    { value: 'pending', label: 'Pendente', icon: Clock, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 'in_progress', label: 'Em Progresso', icon: PlayCircle, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'done', label: 'Concluído', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
]

const typeOptions = [
    { value: 'task', label: 'Tarefa', emoji: '📋' },
    { value: 'note', label: 'Nota', emoji: '📝' },
    { value: 'insight', label: 'Insight', emoji: '💡' },
    { value: 'bookmark', label: 'Bookmark', emoji: '🔖' },
]

const quickEmojis = ['📋', '📝', '💡', '🎯', '⭐', '🔥', '💪', '📚', '💼', '🏠', '🛒', '📧', '📅', '🎉', '🚀', '✨', '🏃', '🍎', '💊', '🧹', '🔧', '📞', '✈️', '🎬']

export function EditEntryDialog({ entry, onClose, onUpdate }: EditEntryDialogProps) {
    const [content, setContent] = useState(entry.content)
    const [entryType, setEntryType] = useState(entry.entry_type || 'note')
    const [status, setStatus] = useState(entry.status || 'pending')
    const [subjectId, setSubjectId] = useState<string | null>(entry.subject_id)
    const [tags, setTags] = useState<string[]>(entry.tags || [])
    const [emoji, setEmoji] = useState<string>((entry.metadata as any)?.emoji || '📌')
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [startDate, setStartDate] = useState<string>((entry as any).start_date || '')
    const [dueDate, setDueDate] = useState<string>((entry as any).due_date || '')
    const [priority, setPriority] = useState<string>((entry as any).priority || 'medium')
    const queryClient = useQueryClient()

    // Fetch subjects for dropdown
    const { data: subjects } = useQuery<Subject[]>({
        queryKey: ['subjects'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('subjects')
                .select('*')
                .order('name', { ascending: true })
            if (error) throw error
            return data
        }
    })

    const updateMutation = useMutation({
        mutationFn: async () => {
            const currentMetadata = (entry.metadata as any) || {}
            const { data, error } = await supabase
                .from('entries')
                // @ts-ignore
                .update({
                    content,
                    entry_type: entryType,
                    status,
                    subject_id: subjectId,
                    tags,
                    metadata: { ...currentMetadata, emoji },
                    start_date: startDate || null,
                    due_date: dueDate || null,
                    priority: priority
                })
                .eq('id', entry.id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entries'] })
            queryClient.invalidateQueries({ queryKey: ['stats'] })
            queryClient.invalidateQueries({ queryKey: ['stats'] })
            toast.success('Item atualizado!')
            onUpdate?.()
            onClose()
        },
        onError: (error: any) => {
            toast.error('Erro ao atualizar', { description: error.message })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from('entries').delete().eq('id', entry.id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entries'] })
            queryClient.invalidateQueries({ queryKey: ['stats'] })
            queryClient.invalidateQueries({ queryKey: ['stats'] })
            toast.success('Item excluído')
            onUpdate?.()
            onClose()
        },
        onError: (error: any) => {
            toast.error('Erro ao excluir', { description: error.message })
        },
    })

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header - Neutral */}
                    <div className="bg-slate-50 border-b border-slate-200 p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Emoji Picker */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="text-3xl bg-white hover:bg-slate-100 rounded-xl p-2 border border-slate-200 transition-all shadow-sm"
                                    >
                                        {emoji}
                                    </button>
                                    {showEmojiPicker && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-10 min-w-[240px]"
                                        >
                                            <p className="text-xs text-slate-500 mb-2">Escolha um emoji</p>
                                            <div className="grid grid-cols-8 gap-1">
                                                {quickEmojis.map((e) => (
                                                    <button
                                                        key={e}
                                                        onClick={() => { setEmoji(e); setShowEmojiPicker(false) }}
                                                        className="text-lg p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                                    >
                                                        {e}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Editar Item</h2>
                                    <p className="text-slate-500 text-xs flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(entry.created_at), "d 'de' MMMM, HH:mm", { locale: ptBR })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-200 transition-colors rounded-lg text-slate-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-160px)]">
                        {/* Status Pills */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Status</label>
                            <div className="flex gap-2">
                                {statusOptions.map((opt) => {
                                    const Icon = opt.icon
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => setStatus(opt.value as any)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-medium text-sm transition-all ${
                                                status === opt.value
                                                    ? `${opt.color} border-current`
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {opt.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Priority Selector */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Prioridade</label>
                            <div className="flex gap-2">
                                {[
                                    { value: 'low', label: 'Baixa', color: 'bg-slate-100 text-slate-600 border-slate-200' },
                                    { value: 'medium', label: 'Média', color: 'bg-amber-50 text-amber-600 border-amber-200' },
                                    { value: 'high', label: 'Alta', color: 'bg-orange-50 text-orange-600 border-orange-200' },
                                    { value: 'urgent', label: 'Urgente', color: 'bg-rose-50 text-rose-600 border-rose-200' }
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setPriority(opt.value as any)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-medium text-xs transition-all ${
                                            priority === opt.value
                                                ? `${opt.color} border-current ring-1 ring-current`
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${opt.color.replace('bg-', 'bg-').replace('text-', 'bg-').split(' ')[1].replace('text-', 'bg-')}`} />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Textarea */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                                Conteúdo
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full min-h-[100px] p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all resize-none text-slate-800"
                                placeholder="Digite o conteúdo..."
                            />
                        </div>

                        {/* Type Selection */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Tipo</label>
                            <div className="grid grid-cols-4 gap-2">
                                {typeOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setEntryType(opt.value as any)}
                                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                                            entryType === opt.value
                                                ? 'bg-slate-100 border-slate-300 text-slate-900'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        <span className="text-lg">{opt.emoji}</span>
                                        <span className="text-xs font-medium">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject Selection */}
                        {subjects && subjects.length > 0 && (
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    Matéria
                                </label>
                                <select
                                    value={subjectId || ''}
                                    onChange={(e) => setSubjectId(e.target.value || null)}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all bg-white text-sm"
                                >
                                    <option value="">Nenhuma matéria</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.icon} {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Tags */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                Tags
                            </label>
                            <TagInput
                                tags={tags}
                                onChange={setTags}
                                placeholder="Adicionar tag..."
                            />
                            <TagSuggestions
                                currentTags={tags}
                                onAddTag={(tag) => setTags([...tags, tag])}
                            />
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Período
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Início</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Prazo</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                        </Button>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={() => updateMutation.mutate()}
                                disabled={updateMutation.isPending || !content.trim()}
                                className="bg-slate-900 hover:bg-slate-800"
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Salvar
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
