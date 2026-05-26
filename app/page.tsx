'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthPage } from '@/components/auth-page'
import { Header } from '@/components/header'
import { HomePage } from '@/components/home-page'
import { CartDrawer } from '@/components/cart-drawer'
import { useAuthStore } from '@/lib/store'
import { LogoIcon } from '@/components/logo'

export default function Page() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleAuthSuccess = () => {
    // Auth success handled by store
  }

  const handleSearch = (query: string) => {
    console.log('[v0] Search query:', query)
  }

  // Loading Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-6"
          >
            <LogoIcon size={64} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-2xl font-bold mb-2">Soleer Hub</h1>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Auth Page (if not authenticated)
  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AuthPage onSuccess={handleAuthSuccess} />
        </motion.div>
      </AnimatePresence>
    )
  }

  // Main Store Page
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="store"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Header onCartOpen={() => setIsCartOpen(true)} onSearch={handleSearch} />
        <HomePage />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </motion.div>
    </AnimatePresence>
  )
}
