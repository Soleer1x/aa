'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, X, Check, CheckCheck, Package, Tag, Star, 
  Heart, Zap, Ticket, Clock, Trash2, Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotificationsStore, useAuthStore } from '@/lib/store'
import { formatRelativeTime } from '@/lib/data'

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  order: Package,
  promo: Tag,
  system: Bell,
  review: Star,
  wishlist: Heart,
  flash_sale: Zap,
  coupon: Ticket,
}

const notificationColors: Record<string, string> = {
  order: 'text-blue-500 bg-blue-500/10',
  promo: 'text-green-500 bg-green-500/10',
  system: 'text-gray-500 bg-gray-500/10',
  review: 'text-yellow-500 bg-yellow-500/10',
  wishlist: 'text-pink-500 bg-pink-500/10',
  flash_sale: 'text-orange-500 bg-orange-500/10',
  coupon: 'text-purple-500 bg-purple-500/10',
}

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { user, isAuthenticated } = useAuthStore()
  const { 
    getUserNotifications, 
    getUnreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotificationsStore()

  const notifications = user ? getUserNotifications(user.id) : []
  const unreadCount = user ? getUnreadCount(user.id) : 0

  const handleMarkAllAsRead = () => {
    if (user) {
      markAllAsRead(user.id)
    }
  }

  const handleClearAll = () => {
    if (user && confirm('Deseja limpar todas as notificacoes?')) {
      clearAll(user.id)
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-96 max-h-[500px] glass rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Notificacoes</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                    <CheckCheck className="w-4 h-4 mr-1" />
                    Marcar todas
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[350px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Nenhuma notificacao</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.slice(0, 10).map((notification) => {
                    const Icon = notificationIcons[notification.type] || Bell
                    const colorClass = notificationColors[notification.type] || 'text-gray-500 bg-gray-500/10'
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 hover:bg-secondary/50 transition-colors ${
                          !notification.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatRelativeTime(notification.createdAt)}
                              </span>
                              <div className="flex items-center gap-1">
                                {notification.link && (
                                  <Link href={notification.link} onClick={onClose}>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 text-xs"
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      {notification.actionText || 'Ver'}
                                    </Button>
                                  </Link>
                                )}
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-7 h-7"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-7 h-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Limpar todas
                </Button>
                <Link href="/notifications" onClick={onClose}>
                  <Button variant="ghost" size="sm">
                    Ver todas
                    <Settings className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuthStore()
  const { getUnreadCount } = useNotificationsStore()
  
  const unreadCount = user ? getUnreadCount(user.id) : 0

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>
      
      <NotificationDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}
