import { Sidebar } from './sidebar'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

import { useAppearance } from '@/hooks/useAppearance'

export const Shell: React.FC = () => {
  const location = useLocation()
  useAppearance() // Just calling it to apply theme/dark mode effects

  return (
    <div className="flex h-screen bg-background overflow-hidden flex-col md:flex-row relative">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto w-full relative z-10">
        <div className="container max-w-7xl mx-auto px-4 py-6 md:px-8 lg:px-12 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
