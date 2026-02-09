export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    updated_at: string | null
                    full_name: string | null
                    avatar_url: string | null
                }
                Insert: {
                    id: string
                    updated_at?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                }
                Update: {
                    id?: string
                    updated_at?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                }
            }
            categories: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    slug: string
                    icon: string | null
                    color: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    slug: string
                    icon?: string | null
                    color?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    slug?: string
                    icon?: string | null
                    color?: string | null
                    created_at?: string
                }
            }
            subjects: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    color: string | null
                    icon: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    color?: string | null
                    icon?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    color?: string | null
                    icon?: string | null
                    created_at?: string
                }
            }
            entries: {
                Row: {
                    id: string
                    user_id: string
                    category_id: string | null
                    subject_id: string | null
                    content: string
                    entry_type: 'task' | 'note' | 'insight' | 'bookmark' | null
                    status: 'pending' | 'in_progress' | 'done' | 'archived' | null
                    metadata: Json | null
                    tags: string[] | null
                    priority: 'low' | 'medium' | 'high' | 'urgent' | null
                    start_date: string | null
                    due_date: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    category_id?: string | null
                    subject_id?: string | null
                    content: string
                    entry_type?: 'task' | 'note' | 'insight' | 'bookmark' | null
                    status?: 'pending' | 'in_progress' | 'done' | 'archived' | null
                    metadata?: Json | null
                    tags?: string[] | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent' | null
                    start_date?: string | null
                    due_date?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    category_id?: string | null
                    subject_id?: string | null
                    content?: string
                    entry_type?: 'task' | 'note' | 'insight' | 'bookmark' | null
                    status?: 'pending' | 'in_progress' | 'done' | 'archived' | null
                    metadata?: Json | null
                    tags?: string[] | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent' | null
                    start_date?: string | null
                    due_date?: string | null
                    created_at?: string
                }
            }
        }
    }
}

// Helper types
export type Subject = Database['public']['Tables']['subjects']['Row']
export type Entry = Database['public']['Tables']['entries']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
