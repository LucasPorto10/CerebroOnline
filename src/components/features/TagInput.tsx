import { useState, KeyboardEvent } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagInputProps {
    tags: string[]
    onChange: (tags: string[]) => void
    placeholder?: string
    maxTags?: number
    className?: string
}

export function TagInput({ 
    tags, 
    onChange, 
    placeholder = 'Adicionar tag...', 
    maxTags = 10,
    className 
}: TagInputProps) {
    const [inputValue, setInputValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    const addTag = (tag: string) => {
        const trimmed = tag.trim().toLowerCase()
        if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
            onChange([...tags, trimmed])
            setInputValue('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(tag => tag !== tagToRemove))
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addTag(inputValue)
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1])
        }
    }

    return (
        <div className={cn("space-y-2", className)}>
            <label className="text-sm font-medium text-slate-700">
                Tags
            </label>
            
            <div 
                className={cn(
                    "min-h-[42px] p-2 rounded-lg border transition-all flex flex-wrap gap-1.5",
                    isFocused 
                        ? "border-indigo-500 ring-2 ring-indigo-100" 
                        : "border-slate-200 hover:border-slate-300"
                )}
            >
                {/* Existing Tags */}
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium"
                    >
                        #{tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-indigo-900 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}

                {/* Input */}
                {tags.length < maxTags && (
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                            setIsFocused(false)
                            if (inputValue.trim()) addTag(inputValue)
                        }}
                        placeholder={tags.length === 0 ? placeholder : ''}
                        className="flex-1 min-w-[100px] text-sm bg-transparent outline-none placeholder:text-slate-400"
                    />
                )}
            </div>

            <p className="text-xs text-slate-400">
                Pressione Enter ou vírgula para adicionar. {tags.length}/{maxTags} tags.
            </p>
        </div>
    )
}

// Preset tags in Portuguese for quick selection
export const PRESET_TAGS = [
    'prova',
    'trabalho',
    'leitura',
    'exercício',
    'apresentação',
    'revisão',
    'importante',
    'urgente',
    'grupo',
    'individual',
    'online',
    'presencial',
]

interface TagSuggestionsProps {
    currentTags: string[]
    onAddTag: (tag: string) => void
}

export function TagSuggestions({ currentTags, onAddTag }: TagSuggestionsProps) {
    const availableTags = PRESET_TAGS.filter(tag => !currentTags.includes(tag))

    if (availableTags.length === 0) return null

    return (
        <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">
                Sugestões
            </label>
            <div className="flex flex-wrap gap-1">
                {availableTags.slice(0, 6).map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => onAddTag(tag)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs font-medium transition-colors"
                    >
                        <Plus className="h-3 w-3" />
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    )
}
