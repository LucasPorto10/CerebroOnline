import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/api/supabase'
import { Subject } from '@/types/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, X, Check, BookOpen, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRESET_COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#6366f1', // indigo
]

const PRESET_ICONS = ['📚', '📖', '📝', '💻', '🧮', '🔬', '🎨', '📊', '🌍', '⚖️', '💼', '🏛️']

interface SubjectManagerProps {
    onSelectSubject?: (subject: Subject | null) => void
    selectedSubjectId?: string | null
    showAddButton?: boolean
}

export function SubjectManager({ onSelectSubject, selectedSubjectId, showAddButton = true }: SubjectManagerProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [newName, setNewName] = useState('')
    const [newColor, setNewColor] = useState('#6366f1')
    const [newIcon, setNewIcon] = useState('📚')
    const queryClient = useQueryClient()

    const { data: subjects, isLoading } = useQuery<Subject[]>({
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

    const createMutation = useMutation({
        mutationFn: async (subject: { name: string; color: string; icon: string }) => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Não autenticado')
            
            // @ts-ignore
            const { error } = await supabase.from('subjects').insert({
                user_id: user.id,
                name: subject.name,
                color: subject.color,
                icon: subject.icon
            })
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subjects'] })
            toast.success('Matéria criada!')
            resetForm()
        },
        onError: () => toast.error('Erro ao criar matéria')
    })

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...data }: { id: string; name: string; color: string; icon: string }) => {
            // @ts-ignore
            const { error } = await supabase.from('subjects').update(data).eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subjects'] })
            toast.success('Matéria atualizada!')
            setEditingId(null)
        },
        onError: () => toast.error('Erro ao atualizar')
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('subjects').delete().eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subjects'] })
            queryClient.invalidateQueries({ queryKey: ['entries'] })
            toast.success('Matéria removida')
        },
        onError: () => toast.error('Erro ao remover')
    })

    const resetForm = () => {
        setIsAdding(false)
        setNewName('')
        setNewColor('#6366f1')
        setNewIcon('📚')
    }

    const handleCreate = () => {
        if (!newName.trim()) {
            toast.error('Digite o nome da matéria')
            return
        }
        createMutation.mutate({ name: newName.trim(), color: newColor, icon: newIcon })
    }

    if (isLoading) {
        return <div className="animate-pulse h-20 bg-muted rounded-xl" />
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-500" />
                    Matérias
                </h3>
                {showAddButton && !isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Nova
                    </button>
                )}
            </div>

            {/* Add Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-muted rounded-xl p-4 space-y-3 border border-border"
                    >
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Nome da matéria..."
                            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            autoFocus
                        />
                        
                        {/* Color Picker */}
                        <div className="flex items-start gap-2">
                            <Palette className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setNewColor(color)}
                                        className={cn(
                                            "w-6 h-6 rounded-full transition-transform shrink-0",
                                            newColor === color && "ring-2 ring-offset-2 ring-primary scale-110"
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Icon Picker */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {PRESET_ICONS.map(icon => (
                                <button
                                    key={icon}
                                    onClick={() => setNewIcon(icon)}
                                    className={cn(
                                        "text-xl p-1 rounded transition-all",
                                        newIcon === icon && "bg-muted scale-110"
                                    )}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={resetForm}
                                className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={createMutation.isPending}
                                className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {createMutation.isPending ? 'Criando...' : 'Criar'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subject List */}
            <div className="space-y-2">
                {/* All (no filter) */}
                <button
                    onClick={() => onSelectSubject?.(null)}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                        !selectedSubjectId 
                            ? "bg-muted text-foreground" 
                            : "hover:bg-muted/50 text-muted-foreground"
                    )}
                >
                    <span className="text-lg">📋</span>
                    <span className="font-medium text-sm">Todas as matérias</span>
                </button>

                <AnimatePresence mode="popLayout">
                    {subjects?.map((subject) => (
                        <SubjectItem
                            key={subject.id}
                            subject={subject}
                            isSelected={selectedSubjectId === subject.id}
                            isEditing={editingId === subject.id}
                            onSelect={() => onSelectSubject?.(subject)}
                            onEdit={() => setEditingId(subject.id)}
                            onCancelEdit={() => setEditingId(null)}
                            onUpdate={(data) => updateMutation.mutate({ id: subject.id, ...data })}
                            onDelete={() => deleteMutation.mutate(subject.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {(!subjects || subjects.length === 0) && !isAdding && (
                <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma matéria cadastrada
                </p>
            )}
        </div>
    )
}

interface SubjectItemProps {
    subject: Subject
    isSelected: boolean
    isEditing: boolean
    onSelect: () => void
    onEdit: () => void
    onCancelEdit: () => void
    onUpdate: (data: { name: string; color: string; icon: string }) => void
    onDelete: () => void
}

function SubjectItem({ 
    subject, 
    isSelected, 
    isEditing, 
    onSelect, 
    onEdit, 
    onCancelEdit, 
    onUpdate, 
    onDelete 
}: SubjectItemProps) {
    const [editName, setEditName] = useState(subject.name)
    const [editColor, setEditColor] = useState(subject.color || '#6366f1')
    const [editIcon, setEditIcon] = useState(subject.icon || '📚')

    if (isEditing) {
        return (
            <motion.div
                layout
                className="bg-muted rounded-xl p-3 space-y-2 border border-border"
            >
                <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded border border-border bg-card text-foreground"
                    autoFocus
                />
                <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map(color => (
                        <button
                            key={color}
                            onClick={() => setEditColor(color)}
                            className={cn("w-5 h-5 rounded-full shrink-0", editColor === color && "ring-2 ring-offset-1 ring-primary")}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                    {PRESET_ICONS.map(icon => (
                        <button
                            key={icon}
                            onClick={() => setEditIcon(icon)}
                            className={cn("text-sm p-0.5 rounded", editIcon === icon && "bg-muted")}
                        >
                            {icon}
                        </button>
                    ))}
                </div>
                <div className="flex justify-end gap-1">
                    <button onClick={onCancelEdit} className="p-1.5 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => onUpdate({ name: editName, color: editColor, icon: editIcon })}
                        className="p-1.5 text-emerald-500 hover:text-emerald-600"
                    >
                        <Check className="h-4 w-4" />
                    </button>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer",
                isSelected 
                    ? "bg-muted text-foreground" 
                    : "hover:bg-muted/50 text-muted-foreground"
            )}
            onClick={onSelect}
        >
            <span 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: `${subject.color}20` }}
            >
                {subject.icon}
            </span>
            <span className="flex-1 font-medium text-sm truncate">{subject.name}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-1 text-muted-foreground hover:text-indigo-500"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1 text-muted-foreground hover:text-red-500"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </motion.div>
    )
}
