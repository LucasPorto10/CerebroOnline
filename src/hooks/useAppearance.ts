import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { supabase } from '@/api/supabase'

export type ThemeColor = 'indigo' | 'violet' | 'rose' | 'emerald' | 'amber' | 'slate'

export function useAppearance() {
    const { user } = useAuth()
    const [theme, setTheme] = useState<ThemeColor>((user?.user_metadata?.theme as ThemeColor) || 'indigo')
    const [isDarkMode, setIsDarkMode] = useState<boolean>(user?.user_metadata?.darkMode || false)

    useEffect(() => {
        if (user?.user_metadata?.theme) {
            setTheme(user.user_metadata.theme)
        }
        if (user?.user_metadata?.darkMode !== undefined) {
            setIsDarkMode(user.user_metadata.darkMode)
        }
    }, [user])

    useEffect(() => {
        // Apply theme color
        document.documentElement.setAttribute('data-theme', theme)
        
        // Apply dark mode
        if (isDarkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [theme, isDarkMode])

    const updateTheme = async (newTheme: ThemeColor) => {
        setTheme(newTheme)
        if (user) {
            await supabase.auth.updateUser({
                data: { ...user.user_metadata, theme: newTheme }
            })
        }
    }

    const toggleDarkMode = async () => {
        const next = !isDarkMode
        setIsDarkMode(next)
        if (user) {
            await supabase.auth.updateUser({
                data: { ...user.user_metadata, darkMode: next }
            })
        }
    }

    return { theme, isDarkMode, updateTheme, toggleDarkMode }
}
