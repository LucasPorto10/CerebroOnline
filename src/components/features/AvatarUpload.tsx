import { useState, useRef } from 'react'
import { supabase } from '@/api/supabase'
import { Camera, Loader2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface AvatarUploadProps {
  currentUrl?: string | null
  userName?: string
  emoji?: string
  size?: 'sm' | 'md' | 'lg'
  onUploadComplete?: (url: string) => void
}

export function AvatarUpload({ 
  currentUrl, 
  userName = '', 
  emoji = '🧠',
  size = 'lg',
  onUploadComplete 
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-xl',
    lg: 'w-32 h-32 text-4xl'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB')
      return
    }

    setUploading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        // If bucket doesn't exist, try to create it or use public bucket
        if (uploadError.message.includes('Bucket not found')) {
          toast.error('Bucket de avatares não configurado. Configure no Supabase Dashboard.')
          throw uploadError
        }
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      if (updateError) throw updateError

      setPreviewUrl(publicUrl)
      onUploadComplete?.(publicUrl)
      toast.success('Foto atualizada com sucesso! ✨')

    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative group">
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className={cn(
          "relative rounded-3xl overflow-hidden ring-4 ring-white shadow-xl cursor-pointer",
          sizeClasses[size]
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Avatar" 
            className="w-full h-full object-cover"
            onError={() => setPreviewUrl(null)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold">
            {userName ? getInitials(userName) : <User className="w-1/2 h-1/2 opacity-80" />}
          </div>
        )}

        {/* Overlay on hover */}
        <div className={cn(
          "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
          uploading && "opacity-100"
        )}>
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Emoji Badge */}
        {size === 'lg' && emoji && (
          <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center text-xl border-2 border-slate-100">
            {emoji}
          </div>
        )}
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {size === 'lg' && (
        <p className="text-xs text-slate-400 text-center mt-3">
          Clique para {previewUrl ? 'trocar' : 'adicionar'} foto
        </p>
      )}
    </div>
  )
}
