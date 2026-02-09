import { Home, Briefcase, GraduationCap, Lightbulb, ChevronLeft, ChevronRight, LogOut, Menu, X, LayoutGrid, Calendar, Inbox, User, Target } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-provider'
import { AnimatePresence, motion } from 'framer-motion'

const navItems = [
  { icon: Home, label: 'Dashboard', slug: '/' },
  { icon: LayoutGrid, label: 'Kanban', slug: '/kanban' },
  { icon: Calendar, label: 'Calendário', slug: '/calendar' },
  { icon: Target, label: 'Metas', slug: '/goals' },
  { icon: Inbox, label: 'Doméstico', slug: '/home' },
  { icon: Briefcase, label: 'Trabalho', slug: '/work' },
  { icon: GraduationCap, label: 'Faculdade', slug: '/uni' },
  { icon: Lightbulb, label: 'Ideias', slug: '/ideas' },
]

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { user, signOut } = useAuth()

  const avatarUrl = user?.user_metadata?.avatar_url
  const userName = user?.user_metadata?.full_name || ''
  const userEmoji = user?.user_metadata?.emoji || '🧠'

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const Logo = ({ isMobile = false }) => (
    <div className={cn(
      "flex items-center gap-3 transition-all duration-300",
      collapsed && !isMobile ? "justify-center" : "justify-start px-2"
    )}>
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-xl shadow-lg shadow-primary/20 shrink-0">
        🧠
      </div>
      <div className="flex flex-col">
        <h1
          className={cn(
            'font-bold text-slate-900 dark:text-slate-100 tracking-tight transition-all duration-300 leading-tight',
            collapsed && !isMobile ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto text-xl'
          )}
        >
          CerebroOnline
        </h1>
        <p className={cn(
          "text-[10px] text-primary font-bold tracking-widest uppercase transition-all duration-300",
          collapsed && !isMobile ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
        )}>
          by PortoSol
        </p>
      </div>
    </div>
  )

  const UserProfile = ({ isMobile = false }) => (
    <Link 
      to="/settings" 
      onClick={() => setMobileOpen(false)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group",
        collapsed && !isMobile ? "justify-center" : ""
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-md">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold text-sm">
              {userName ? getInitials(userName) : <User className="w-5 h-5" />}
            </div>
          )}
        </div>
        {/* Online indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-800" />
      </div>

      {/* User Info */}
      <div className={cn(
        "flex-1 min-w-0 transition-all duration-300",
        collapsed && !isMobile ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
      )}>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
          {userName || 'Seu Nome'}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
          {user?.email?.split('@')[0]}
        </p>
      </div>

      {/* Emoji badge */}
      <div className={cn(
        "text-lg transition-all",
        collapsed && !isMobile ? "hidden" : "block"
      )}>
        {userEmoji}
      </div>
    </Link>
  )

  const SidebarContent = () => (
    <>
      <nav className="flex-1 px-3 space-y-1 mt-6">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.slug || (item.slug === '/' && location.pathname === '/dashboard')
          return (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link
                to={item.slug === '/' ? '/dashboard' : item.slug}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110', 
                    isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  )}
                />
                <span className={cn(
                  'truncate transition-all duration-300', 
                  collapsed && !mobileOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
                )}>
                  {item.label}
                </span>

                {isActive && (
                    <motion.div 
                        layoutId="active-pill"
                        className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                    />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="px-3 pt-4 border-t border-border mt-auto">
        <UserProfile />
      </div>

      {/* Bottom Actions */}
      <div className="p-3 flex flex-col gap-1.5 pb-6">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start gap-3 px-3 py-5 rounded-2xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10",
            collapsed && !mobileOpen ? "justify-center px-0" : ""
          )}
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className={cn('truncate transition-all duration-100', collapsed && !mobileOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto')}>
            Sair
          </span>
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5 z-40 flex items-center justify-between px-4">
        <Logo isMobile />
        <div className="flex items-center gap-2">
          {/* Mini avatar on mobile header */}
          <Link to="/settings" className="flex items-center">
            <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold text-xs">
                  {userName ? getInitials(userName) : <User className="w-4 h-4" />}
                </div>
              )}
            </div>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="rounded-xl">
            <Menu className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-card z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-border">
                <Logo isMobile />
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="rounded-xl">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex relative glass border-r-0 md:border-r border-slate-200/50 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none transition-all duration-300 ease-in-out flex-col z-30',
          collapsed ? 'w-24' : 'w-72'
        )}
      >
        <div className="p-6 flex flex-col pt-8">
          <div className="flex items-center justify-between relative">
            <Logo />
            
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                'absolute -right-10 top-2 glass rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 z-20 transition-all hover:scale-110',
                collapsed && "left-1/2 -translate-x-1/2 top-14 right-auto"
                )}
            >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <SidebarContent />
      </aside>

      {/* Mobile spacer for fixed header */}
      <div className="md:hidden h-16" />
    </>
  )
}
