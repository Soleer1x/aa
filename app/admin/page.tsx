'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, Users, ShoppingCart, Settings,
  TrendingUp, TrendingDown, DollarSign, Eye, Plus, Search,
  Edit, Trash2, ChevronLeft, ChevronRight,
  Menu, X, LogOut, Bell, BarChart3, ArrowUpRight, Save,
  MessageCircle, Image as ImageIcon, Lock, UserCog, Tag,
  Star, Zap, FolderOpen, Shield, Check, AlertCircle,
  Clock, Percent, Calendar, ChevronDown, Activity, ArrowUp,
  ArrowDown, Package2, Boxes, RefreshCw, Filter, Download,
  MoreVertical, ExternalLink, ChevronUp, Sparkles, Target,
  TrendingUp as Growth
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/logo'
import { formatPrice, categories, brands, formatDate, adminRoleLabels } from '@/lib/data'
import {
  useAuthStore, useProductsStore, useOrdersStore,
  useChatStore, useReviewsStore, useCouponsStore,
  useCategoriesStore, useNotificationsStore,
  Product, AdminUser, Review, Coupon, Category,
  ADMIN_PERMISSIONS,
  useStoreSettingsStore,
  useOrderTrackingStore,
  Order
} from '@/lib/store'

type Tab = 'dashboard' | 'products' | 'orders' | 'users' | 'admins' | 'reviews' | 'coupons' | 'categories' | 'flash-sales' | 'chat' | 'settings'

// ─── Helpers ────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:    { label: 'Pendente',     color: 'text-amber-400',   bg: 'bg-amber-400/10',   dot: 'bg-amber-400' },
  processing: { label: 'Processando',  color: 'text-blue-400',    bg: 'bg-blue-400/10',    dot: 'bg-blue-400' },
  shipped:    { label: 'Enviado',      color: 'text-violet-400',  bg: 'bg-violet-400/10',  dot: 'bg-violet-400' },
  completed:  { label: 'Concluído',   color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
  cancelled:  { label: 'Cancelado',   color: 'text-rose-400',    bg: 'bg-rose-400/10',    dot: 'bg-rose-400' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── Stat Card ──────────────────────────────────────────────
function StatCard({
  label, value, change, up, icon: Icon, gradient, sparkData
}: {
  label: string; value: string; change: string; up: boolean
  icon: React.ElementType; gradient: string; sparkData: number[]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-5 bg-card border border-white/5 group hover:border-white/10 transition-all duration-300"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
    >
      <div className={`absolute inset-0 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity ${gradient}`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gradient} opacity-90`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            up ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
          }`}>
            {up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {change}
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground mb-0.5">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {/* Mini sparkline */}
        <div className="mt-3 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData.map((v, i) => ({ v, i }))}>
              <defs>
                <linearGradient id={`sg-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={1.5}
                fill={`url(#sg-${label})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Export ────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  const { user, logout, isAuthenticated, loginAsAdmin, hasPermission } = useAuthStore()

  const handleAdminLogin = async () => {
    setIsLoggingIn(true)
    setLoginError('')
    const success = await loginAsAdmin(loginForm.email, loginForm.password)
    if (!success) setLoginError('Credenciais inválidas')
    setIsLoggingIn(false)
  }

  // ── Login Screen ──
  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(220,38,38,0.15) 0%, transparent 60%), #080808' }}>
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', boxShadow: '0 8px 24px rgba(220,38,38,0.35)' }}>
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-1">Painel Admin</h1>
              <p className="text-muted-foreground text-sm">Acesso restrito a administradores</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">E-mail</label>
                <Input type="email" value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="admin@soleerhub.com" className="h-12 bg-white/5 border-white/10 focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Senha</label>
                <Input type="password" value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••" className="h-12 bg-white/5 border-white/10 focus:border-primary/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()} />
              </div>

              {loginError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <p className="text-sm text-rose-400">{loginError}</p>
                </div>
              )}

              <Button className="w-full h-12 text-sm font-semibold rounded-xl" onClick={handleAdminLogin} disabled={isLoggingIn}
                style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', boxShadow: '0 4px 15px rgba(220,38,38,0.35)' }}>
                {isLoggingIn ? (
                  <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Entrando...</span>
                ) : 'Entrar como Admin'}
              </Button>

              <p className="text-xs text-center text-muted-foreground pt-1">
                Teste: <span className="text-foreground/60">admin@soleerhub.com</span> / <span className="text-foreground/60">admin123</span>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <Link href="/"><Button variant="ghost" size="sm" className="text-muted-foreground">← Voltar para a Loja</Button></Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const adminUser = user as AdminUser

  const menuItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard',       icon: LayoutDashboard, permission: null,          badge: null },
    { id: 'products'  as Tab, label: 'Produtos',        icon: Package,         permission: 'products',    badge: null },
    { id: 'orders'    as Tab, label: 'Pedidos',         icon: ShoppingCart,    permission: 'orders',      badge: null },
    { id: 'users'     as Tab, label: 'Clientes',        icon: Users,           permission: 'users',       badge: null },
    { id: 'admins'    as Tab, label: 'Administradores', icon: UserCog,         permission: 'all',         badge: null },
    { id: 'reviews'   as Tab, label: 'Avaliações',      icon: Star,            permission: 'reviews',     badge: null },
    { id: 'coupons'   as Tab, label: 'Cupons',          icon: Tag,             permission: 'coupons',     badge: null },
    { id: 'categories'as Tab, label: 'Categorias',      icon: FolderOpen,      permission: 'categories',  badge: null },
    { id: 'flash-sales'as Tab,label: 'Flash Sales',     icon: Zap,             permission: 'flash_sales', badge: 'HOT' },
    { id: 'chat'      as Tab, label: 'Chat',            icon: MessageCircle,   permission: 'chat',        badge: null },
    { id: 'settings'  as Tab, label: 'Configurações',   icon: Settings,        permission: null,          badge: null },
  ].filter(item => !item.permission || hasPermission(item.permission))

  const sectionLabels: Record<string, string> = {
    dashboard: 'Visão Geral',
    products: 'Produtos', orders: 'Pedidos', users: 'Clientes',
    admins: 'Administradores', reviews: 'Avaliações', coupons: 'Cupons',
    categories: 'Categorias', 'flash-sales': 'Flash Sales',
    chat: 'Chat', settings: 'Configurações'
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0a' }}>

      {/* ── Sidebar ── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`} style={{ background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Logo */}
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden w-7 h-7" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-3 pt-2 pb-1">Menu</p>
          {menuItems.map((item) => {
            const active = activeTab === item.id
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group relative ${
                  active
                    ? 'text-white font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
                style={active ? {
                  background: 'linear-gradient(135deg, rgba(220,38,38,0.2) 0%, rgba(153,27,27,0.15) 100%)',
                  boxShadow: 'inset 0 0 0 1px rgba(220,38,38,0.2)'
                } : undefined}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />}
                <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : ''}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">{item.badge}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || 'Admin'}</p>
              <p className="text-[11px] text-muted-foreground truncate">{adminRoleLabels[adminUser.adminRole]?.label || 'Admin'}</p>
            </div>
            <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0 text-muted-foreground hover:text-foreground" onClick={logout}>
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-14 flex items-center justify-between px-5 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(13,13,13,0.8)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden w-8 h-8" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-sm font-semibold">{sectionLabels[activeTab]}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-8 h-8 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                Ver Loja <ExternalLink className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
              {activeTab === 'dashboard'   && <DashboardContent />}
              {activeTab === 'products'    && <ProductsContent />}
              {activeTab === 'orders'      && <OrdersContent />}
              {activeTab === 'users'       && <UsersContent />}
              {activeTab === 'admins'      && <AdminsContent />}
              {activeTab === 'reviews'     && <ReviewsContent />}
              {activeTab === 'coupons'     && <CouponsContent />}
              {activeTab === 'categories'  && <CategoriesContent />}
              {activeTab === 'flash-sales' && <FlashSalesContent />}
              {activeTab === 'chat'        && <ChatContent />}
              {activeTab === 'settings'    && <SettingsContent />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

// ─── Dashboard ───────────────────────────────────────────────
function DashboardContent() {
  const { getAllProducts } = useProductsStore()
  const { getAllOrders } = useOrdersStore()
  const { users } = useAuthStore()
  const { getPendingReviews } = useReviewsStore()

  const products = getAllProducts()
  const orders = getAllOrders()
  const pendingReviews = getPendingReviews()
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0)

  // Mock monthly chart data
  const revenueData = [
    { month: 'Jan', receita: 18400, pedidos: 42 },
    { month: 'Fev', receita: 22100, pedidos: 58 },
    { month: 'Mar', receita: 19800, pedidos: 47 },
    { month: 'Abr', receita: 31200, pedidos: 74 },
    { month: 'Mai', receita: 27500, pedidos: 65 },
    { month: 'Jun', receita: 34800, pedidos: 89 },
    { month: 'Jul', receita: 41200, pedidos: 98 },
    { month: 'Ago', receita: totalSales > 0 ? totalSales : 38600, pedidos: orders.length > 0 ? orders.length : 91 },
  ]

  const statusData = [
    { name: 'Concluídos',   value: orders.filter(o => o.status === 'completed').length,  color: '#10b981' },
    { name: 'Enviados',     value: orders.filter(o => o.status === 'shipped').length,     color: '#8b5cf6' },
    { name: 'Processando',  value: orders.filter(o => o.status === 'processing').length,  color: '#3b82f6' },
    { name: 'Pendentes',    value: orders.filter(o => o.status === 'pending').length,     color: '#f59e0b' },
  ].filter(d => d.value > 0)

  const spark = [18, 24, 19, 31, 28, 35, 41, 38]

  const stats = [
    { label: 'Receita Total',     value: formatPrice(totalSales),     change: '+12%', up: true,  icon: DollarSign,  gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',  sparkData: spark },
    { label: 'Total de Pedidos',  value: orders.length.toString(),    change: '+8%',  up: true,  icon: ShoppingCart, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',   sparkData: [42,58,47,74,65,89,98,91] },
    { label: 'Produtos',          value: products.length.toString(),  change: '+5%',  up: true,  icon: Package,      gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',  sparkData: [10,14,16,17,20,22,24,25] },
    { label: 'Clientes',          value: users.length.toString(),     change: '+15%', up: true,  icon: Users,        gradient: 'bg-gradient-to-br from-rose-500 to-pink-600',      sparkData: [5,8,11,14,18,22,27,30] },
  ]

  const recentOrders = [...orders].reverse().slice(0, 6)
  const topProducts = products.slice(0, 5)

  return (
    <div className="space-y-5">
      {/* Alert */}
      {pendingReviews.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/8">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">{pendingReviews.length} avaliação(ões) aguardando moderação</p>
            <p className="text-xs text-amber-400/70">Acesse a aba Avaliações para revisar</p>
          </div>
          <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8">Ver →</Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid xl:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 rounded-2xl p-5 border border-white/5"
          style={{ background: '#111', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-sm">Receita Mensal</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Evolução dos últimos 8 meses</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-primary inline-block" />Receita</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-blue-400 inline-block" />Pedidos</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="pedidosGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} width={50}
                tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#fff', fontWeight: 600 }}
                formatter={(v: number, name: string) => [
                  name === 'receita' ? formatPrice(v) : v,
                  name === 'receita' ? 'Receita' : 'Pedidos'
                ]}
              />
              <Area type="monotone" dataKey="receita" stroke="#dc2626" strokeWidth={2} fill="url(#receitaGrad)" dot={false} />
              <Area type="monotone" dataKey="pedidos" stroke="#3b82f6" strokeWidth={2} fill="url(#pedidosGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="rounded-2xl p-5 border border-white/5" style={{ background: '#111', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
          <h3 className="font-semibold text-sm mb-1">Status dos Pedidos</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribuição atual</p>
          {statusData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Sem pedidos ainda</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                    paddingAngle={3} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </span>
                    <span className="font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid xl:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-white/5" style={{ background: '#111', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 className="font-semibold text-sm">Pedidos Recentes</h3>
            <span className="text-xs text-muted-foreground">{orders.length} total</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentOrders.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground text-sm">Nenhum pedido ainda</div>
            ) : recentOrders.map((order) => (
              <div key={order.id} className="p-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">#{order.id}</p>
                  <p className="text-xs text-muted-foreground truncate">{order.userName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl border border-white/5" style={{ background: '#111', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 className="font-semibold text-sm">Produtos Cadastrados</h3>
            <span className="text-xs text-muted-foreground">{products.length} total</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {topProducts.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground text-sm">Nenhum produto cadastrado</div>
            ) : topProducts.map((product, i) => (
              <div key={product.id} className="p-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                <span className="text-xs font-bold text-muted-foreground/40 w-5 text-center shrink-0">{i + 1}</span>
                <img src={product.image} alt={product.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <p className="text-sm font-bold text-primary shrink-0">{formatPrice(product.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Wrapper ────────────────────────────────────────────
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}>
          <motion.div initial={{ scale: 0.93, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10"
            style={{ background: '#131313', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="font-bold text-base">{title}</h2>
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onClose}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Form Field ───────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  )
}

const inputClass = "h-11 bg-white/[0.04] border-white/10 focus:border-primary/40 rounded-xl text-sm"
const selectClass = "w-full h-11 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-foreground focus:border-primary/40 focus:outline-none"

// ─── Products ─────────────────────────────────────────────────
function ProductsContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', originalPrice: '', image: '',
    category: '', brand: '', stock: '', featured: false, discount: '',
  })

  const { getAllProducts, addProduct, updateProduct, deleteProduct } = useProductsStore()
  const { getAllCategories } = useCategoriesStore()
  const products = getAllProducts()
  const allCategories = getAllCategories()
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', originalPrice: '', image: '', category: '', brand: '', stock: '', featured: false, discount: '' })
    setEditingProduct(null)
    setShowForm(false)
  }

  const handleEdit = (p: Product) => {
    setFormData({ name: p.name, description: p.description, price: p.price.toString(),
      originalPrice: p.originalPrice?.toString() || '', image: p.image, category: p.category,
      brand: p.brand, stock: p.stock.toString(), featured: p.featured || false, discount: p.discount?.toString() || '' })
    setEditingProduct(p)
    setShowForm(true)
  }

  const handleSubmit = () => {
    const data = { name: formData.name, description: formData.description, price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      image: formData.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
      category: formData.category, brand: formData.brand, stock: parseInt(formData.stock),
      featured: formData.featured, discount: formData.discount ? parseInt(formData.discount) : undefined }
    editingProduct ? updateProduct(editingProduct.id, data) : addProduct(data)
    resetForm()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar produtos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${inputClass}`} />
        </div>
        <Button onClick={() => setShowForm(true)} className="h-11 px-5 rounded-xl font-medium shrink-0"
          style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', boxShadow: '0 4px 12px rgba(220,38,38,0.3)' }}>
          <Plus className="w-4 h-4 mr-2" /> Novo Produto
        </Button>
      </div>

      <Modal open={showForm} onClose={resetForm} title={editingProduct ? 'Editar Produto' : 'Novo Produto'}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><Field label="Nome do Produto">
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: iPhone 15 Pro Max" className={inputClass} />
          </Field></div>
          <div className="md:col-span-2"><Field label="Descrição">
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição detalhada do produto..."
              className="w-full h-24 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 resize-none text-sm focus:outline-none focus:border-primary/40" />
          </Field></div>
          <Field label="Preço (R$)"><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="999.90" className={inputClass} /></Field>
          <Field label="Preço Original (R$)"><Input type="number" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} placeholder="1299.90" className={inputClass} /></Field>
          <Field label="Categoria"><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={selectClass}>
            <option value="">Selecione...</option>
            {allCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select></Field>
          <Field label="Marca"><select value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className={selectClass}>
            <option value="">Selecione...</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select></Field>
          <Field label="Estoque"><Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} placeholder="100" className={inputClass} /></Field>
          <Field label="Desconto (%)"><Input type="number" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="10" className={inputClass} /></Field>
          <div className="md:col-span-2"><Field label="URL da Imagem">
            <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." className={inputClass} />
          </Field></div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.featured ? 'bg-primary border-primary' : 'border-white/20 hover:border-white/40'}`}
                onClick={() => setFormData({ ...formData, featured: !formData.featured })}>
                {formData.featured && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm">Produto em Destaque</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <Button variant="outline" onClick={resetForm} className="flex-1 h-11 rounded-xl border-white/10">Cancelar</Button>
          <Button onClick={handleSubmit} className="flex-1 h-11 rounded-xl font-semibold"
            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
            <Save className="w-4 h-4 mr-2" />{editingProduct ? 'Salvar' : 'Criar Produto'}
          </Button>
        </div>
      </Modal>

      <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: '#111' }}>
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold mb-1">Nenhum produto encontrado</h3>
            <p className="text-sm text-muted-foreground mb-5">Adicione seu primeiro produto para começar a vender</p>
            <Button onClick={() => setShowForm(true)} className="h-10 px-5 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Produto
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Produto', 'Categoria', 'Preço', 'Estoque', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <p className="text-sm font-medium truncate max-w-[180px]">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.stock <= 10 ? 'text-amber-400' : 'text-foreground'}`}>
                        {product.stock} un.
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        product.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {product.stock > 0 ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-white/5" onClick={() => handleEdit(product)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400"
                          onClick={() => confirm('Excluir produto?') && deleteProduct(product.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Orders ───────────────────────────────────────────────────
const statusLabels: Record<Order['status'], string> = {
  pending: 'Pedido Recebido', processing: 'Em Processamento',
  shipped: 'Pedido Enviado', completed: 'Pedido Entregue', cancelled: 'Pedido Cancelado',
}
const statusDescriptions: Record<Order['status'], string> = {
  pending: 'Aguardando confirmação do pagamento',
  processing: 'Seu pedido está sendo separado e embalado',
  shipped: 'Pedido saiu para entrega', completed: 'Pedido entregue com sucesso!', cancelled: 'Pedido cancelado',
}

function OrdersContent() {
  const { getAllOrders, updateOrderStatus, setTrackingCode } = useOrdersStore()
  const { addEvent } = useOrderTrackingStore()
  const { addNotification } = useNotificationsStore()
  const orders = getAllOrders()
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [trackingInput, setTrackingInput] = useState('')
  const [trackingNoteOrder, setTrackingNoteOrder] = useState<string | null>(null)
  const [trackingNote, setTrackingNote] = useState('')
  const [trackingLocation, setTrackingLocation] = useState('')
  const [detailOrder, setDetailOrder] = useState<string | null>(null)

  const filteredOrders = filter === 'all' ? [...orders].reverse() : [...orders].filter(o => o.status === filter).reverse()

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    completed: orders.filter(o => o.status === 'completed').length,
  }

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    const order = orders.find(o => o.id === orderId)
    updateOrderStatus(orderId, newStatus)
    addEvent(orderId, newStatus, statusDescriptions[newStatus])
    if (order) {
      addNotification({
        userId: order.userId, type: 'order', title: 'Atualização do pedido',
        message: `Seu pedido #${orderId} foi atualizado para: ${statusLabels[newStatus]}`,
        link: `/tracking/${orderId}`, actionText: 'Ver pedido',
      })
    }
  }

  const handleSetTracking = (orderId: string) => {
    if (!trackingInput.trim()) return
    const order = orders.find(o => o.id === orderId)
    setTrackingCode(orderId, trackingInput.trim())
    addEvent(orderId, 'shipped', `Código de rastreio: ${trackingInput.trim()}`)
    if (order) addNotification({ userId: order.userId, type: 'order', title: '📦 Código de Rastreio!',
      message: `Pedido #${orderId} enviado! Rastreio: ${trackingInput.trim()}`, link: `/tracking/${orderId}`, actionText: 'Rastrear' })
    setTrackingInput(''); setSelectedOrder(null)
  }

  const handleAddTrackingNote = (orderId: string) => {
    if (!trackingNote.trim()) return
    addEvent(orderId, 'update', trackingNote.trim(), trackingLocation.trim() || undefined)
    setTrackingNote(''); setTrackingLocation(''); setTrackingNoteOrder(null)
  }

  const detailOrderData = detailOrder ? orders.find(o => o.id === detailOrder) : null

  const filters = [
    { key: 'all', label: 'Todos' }, { key: 'pending', label: 'Pendentes' },
    { key: 'processing', label: 'Processando' }, { key: 'shipped', label: 'Enviados' },
    { key: 'completed', label: 'Concluídos' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === f.key
                ? 'text-white'
                : 'text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/8'
            }`}
            style={filter === f.key ? {
              background: 'linear-gradient(135deg, rgba(220,38,38,0.25) 0%, rgba(153,27,27,0.2) 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(220,38,38,0.25)'
            } : undefined}>
            {f.label} <span className="opacity-60 ml-1">({counts[f.key as keyof typeof counts]})</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: '#111' }}>
        {filteredOrders.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold mb-1">Nenhum pedido encontrado</h3>
            <p className="text-sm text-muted-foreground">Os pedidos aparecem aqui quando realizados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Pedido', 'Cliente', 'Data', 'Total', 'Status', 'Rastreio', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td className="px-4 py-3 font-mono text-sm font-medium">#{order.id}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{order.userName}</p>
                        <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                          className="text-xs font-medium bg-transparent border-0 cursor-pointer outline-none">
                          <option value="pending">⏳ Pendente</option>
                          <option value="processing">🔄 Processando</option>
                          <option value="shipped">📦 Enviado</option>
                          <option value="completed">✅ Concluído</option>
                          <option value="cancelled">❌ Cancelado</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {order.trackingCode ? (
                          <code className="text-xs bg-white/5 px-2 py-1 rounded-lg font-mono">{order.trackingCode}</code>
                        ) : selectedOrder === order.id ? (
                          <div className="flex gap-1.5">
                            <Input value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)}
                              placeholder="Código..." className="h-8 w-28 text-xs rounded-lg bg-white/5 border-white/10" />
                            <Button size="sm" className="h-8 w-8 p-0 rounded-lg"
                              style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}
                              onClick={() => handleSetTracking(order.id)}>
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <button onClick={() => setSelectedOrder(order.id)}
                            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                            + Adicionar
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-white/5"
                            onClick={() => setTrackingNoteOrder(trackingNoteOrder === order.id ? null : order.id)}>
                            <MessageCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs px-2 hover:bg-white/5" onClick={() => setDetailOrder(order.id)}>
                            Detalhes
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {trackingNoteOrder === order.id && (
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td colSpan={7} className="px-4 py-3 bg-white/[0.015]">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Input value={trackingNote} onChange={(e) => setTrackingNote(e.target.value)}
                              placeholder="Mensagem de atualização..." className="flex-1 h-9 text-xs rounded-xl bg-white/5 border-white/10" />
                            <Input value={trackingLocation} onChange={(e) => setTrackingLocation(e.target.value)}
                              placeholder="Localização (opcional)" className="w-44 h-9 text-xs rounded-xl bg-white/5 border-white/10" />
                            <Button size="sm" className="h-9 px-3 rounded-xl shrink-0"
                              style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}
                              onClick={() => handleAddTrackingNote(order.id)}>
                              <Check className="w-3.5 h-3.5 mr-1" /> Salvar
                            </Button>
                            <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-xl" onClick={() => setTrackingNoteOrder(null)}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail */}
      {detailOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => setDetailOrder(null)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10"
            style={{ background: '#131313' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <h2 className="font-bold">Pedido #{detailOrderData.id}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(detailOrderData.createdAt).toLocaleString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={detailOrderData.status} />
                <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setDetailOrder(null)}><X className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cliente</p>
                <p className="text-sm font-medium">{detailOrderData.userName}</p>
                <p className="text-xs text-muted-foreground">{detailOrderData.userEmail}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Itens</p>
                <div className="space-y-2">
                  {detailOrderData.items.map(item => (
                    <div key={item.product.id} className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qtd: {item.quantity} × {formatPrice(item.product.price)}</p>
                      </div>
                      <p className="text-sm font-bold shrink-0">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">{formatPrice(detailOrderData.total)}</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Endereço de Entrega</p>
                <p className="text-sm text-muted-foreground">
                  {detailOrderData.address.street}, {detailOrderData.address.number} — {detailOrderData.address.neighborhood}<br/>
                  {detailOrderData.address.city}/{detailOrderData.address.state} — CEP: {detailOrderData.address.cep}
                </p>
              </div>
              {detailOrderData.trackingCode && (
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Código de Rastreio</p>
                  <code className="text-sm font-mono text-primary">{detailOrderData.trackingCode}</code>
                </div>
              )}
              <Link href={`/tracking/${detailOrderData.id}`} target="_blank">
                <Button variant="outline" className="w-full h-10 rounded-xl border-white/10 text-sm">
                  Ver Rastreamento Completo <ExternalLink className="w-3.5 h-3.5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Users ────────────────────────────────────────────────────
function UsersContent() {
  const { users } = useAuthStore()
  const { getUserOrders } = useOrdersStore()

  const summaryStats = [
    { label: 'Total de Clientes', value: users.length },
    { label: 'Clientes Ativos', value: users.filter(u => getUserOrders(u.id).length > 0).length },
    { label: 'Novos este mês', value: users.filter(u => {
      const d = new Date(u.createdAt); const n = new Date()
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
    }).length },
    { label: 'Ticket Médio', value: null },
  ]

  const avgTicket = users.length > 0
    ? formatPrice(users.reduce((sum, u) => sum + getUserOrders(u.id).reduce((s, o) => s + o.total, 0), 0) / Math.max(users.length, 1))
    : 'R$ 0'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total de Clientes', value: users.length.toString(), icon: Users, color: 'from-blue-500 to-indigo-600' },
          { label: 'Clientes Ativos', value: users.filter(u => getUserOrders(u.id).length > 0).length.toString(), icon: Activity, color: 'from-emerald-500 to-teal-600' },
          { label: 'Novos este mês', value: users.filter(u => { const d = new Date(u.createdAt); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() }).length.toString(), icon: TrendingUp, color: 'from-violet-500 to-purple-600' },
          { label: 'Ticket Médio', value: avgTicket, icon: DollarSign, color: 'from-rose-500 to-pink-600' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl border border-white/5" style={{ background: '#111' }}>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: '#111' }}>
        {users.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold mb-1">Nenhum cliente cadastrado</h3>
            <p className="text-sm text-muted-foreground">Os clientes aparecem aqui quando se cadastram</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Cliente', 'Cadastro', 'Pedidos', 'Total Gasto', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const userOrders = getUserOrders(u.id)
                  const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0)
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3 text-sm">{userOrders.length} pedidos</td>
                      <td className="px-4 py-3 text-sm font-semibold">{formatPrice(totalSpent)}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="h-7 text-xs hover:bg-white/5">Detalhes</Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Admins ───────────────────────────────────────────────────
function AdminsContent() {
  const { user, getAllAdmins, registerAdmin, updateAdminRole, deleteAdmin } = useAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin' as AdminUser['adminRole'] })
  const [error, setError] = useState(''); const [success, setSuccess] = useState('')
  const admins = getAllAdmins()
  const currentAdmin = user as AdminUser

  const handleSubmit = async () => {
    setError(''); setSuccess('')
    if (!formData.name || !formData.email || !formData.password) { setError('Preencha todos os campos'); return }
    const result = await registerAdmin(formData)
    if (result) {
      setSuccess('Admin criado com sucesso!')
      setFormData({ name: '', email: '', password: '', role: 'admin' })
      setTimeout(() => { setShowForm(false); setSuccess('') }, 1500)
    } else {
      setError('Erro ao criar. E-mail já existe ou sem permissão.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Administradores</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Apenas Super Admins gerenciam outros admins</p>
        </div>
        {currentAdmin.adminRole === 'super_admin' && (
          <Button onClick={() => setShowForm(true)} className="h-9 px-4 rounded-xl text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
            <Plus className="w-4 h-4 mr-1.5" /> Novo Admin
          </Button>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Criar Administrador">
        <div className="space-y-4">
          <Field label="Nome"><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome completo" className={inputClass} /></Field>
          <Field label="E-mail"><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@exemplo.com" className={inputClass} /></Field>
          <Field label="Senha"><Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" className={inputClass} /></Field>
          <Field label="Nível de Acesso"><select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminUser['adminRole'] })} className={selectClass}>
            <option value="admin">Administrador</option>
            <option value="moderator">Moderador</option>
          </select></Field>
          {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          {success && <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400"><Check className="w-4 h-4 shrink-0" />{success}</div>}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 h-11 rounded-xl border-white/10">Cancelar</Button>
            <Button onClick={handleSubmit} className="flex-1 h-11 rounded-xl" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
              <Save className="w-4 h-4 mr-2" /> Criar Admin
            </Button>
          </div>
        </div>
      </Modal>

      <div className="space-y-3">
        {admins.map((admin) => (
          <div key={admin.id} className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 hover:border-white/8 transition-all" style={{ background: '#111' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0"
              style={{ background: admin.adminRole === 'super_admin' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{admin.name}</p>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                  admin.adminRole === 'super_admin' ? 'bg-violet-500/15 text-violet-400' :
                  admin.adminRole === 'admin' ? 'bg-blue-500/15 text-blue-400' : 'bg-emerald-500/15 text-emerald-400'
                }`}>{adminRoleLabels[admin.adminRole]?.label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">Desde {new Date(admin.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
              {currentAdmin.adminRole === 'super_admin' && admin.adminRole !== 'super_admin' && (
                <div className="flex gap-2">
                  <select value={admin.adminRole} onChange={(e) => updateAdminRole(admin.id, e.target.value as AdminUser['adminRole'])}
                    className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-foreground">
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderador</option>
                  </select>
                  <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-rose-500/10 hover:text-rose-400"
                    onClick={() => confirm('Remover admin?') && deleteAdmin(admin.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Reviews ──────────────────────────────────────────────────
function ReviewsContent() {
  const { reviews, approveReview, deleteReview, getPendingReviews } = useReviewsStore()
  const { getProduct } = useProductsStore()
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const pending = getPendingReviews()
  const filtered = filter === 'pending' ? pending : filter === 'approved' ? reviews.filter(r => r.approved) : reviews

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[
          { key: 'all', label: `Todas (${reviews.length})` },
          { key: 'pending', label: `Pendentes (${pending.length})` },
          { key: 'approved', label: `Aprovadas (${reviews.filter(r => r.approved).length})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === f.key ? 'text-white' : 'text-muted-foreground bg-white/5 hover:text-foreground'
            }`}
            style={filter === f.key ? { background: 'linear-gradient(135deg, rgba(220,38,38,0.25), rgba(153,27,27,0.2))', boxShadow: 'inset 0 0 0 1px rgba(220,38,38,0.25)' } : undefined}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-white/5" style={{ background: '#111' }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <Star className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold mb-1">Nenhuma avaliação</h3>
          <p className="text-sm text-muted-foreground">As avaliações dos clientes aparecem aqui</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => {
            const product = getProduct(review.productId)
            return (
              <div key={review.id} className="p-4 rounded-2xl border border-white/5 hover:border-white/8 transition-all" style={{ background: '#111' }}>
                <div className="flex items-start gap-4">
                  {product && <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm">{product?.name || 'Produto removido'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">por {review.userName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${review.approved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {review.approved ? 'Aprovada' : 'Pendente'}
                          </span>
                        </div>
                        <p className="text-sm font-medium mt-2">{review.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{review.comment}</p>
                        <p className="text-xs text-muted-foreground/50 mt-1.5">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!review.approved && (
                          <Button size="sm" className="h-8 px-3 rounded-lg text-xs"
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                            onClick={() => approveReview(review.id)}>
                            <Check className="w-3 h-3 mr-1" /> Aprovar
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-400"
                          onClick={() => confirm('Excluir avaliação?') && deleteReview(review.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Coupons ──────────────────────────────────────────────────
function CouponsContent() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useCouponsStore()
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({
    code: '', description: '', type: 'percentage' as 'percentage' | 'fixed',
    value: '', minPurchase: '', maxDiscount: '', usageLimit: '',
    validFrom: '', validUntil: '', active: true,
  })

  const resetForm = () => {
    setFormData({ code: '', description: '', type: 'percentage', value: '', minPurchase: '', maxDiscount: '', usageLimit: '', validFrom: '', validUntil: '', active: true })
    setEditingCoupon(null); setShowForm(false)
  }

  const handleEdit = (coupon: Coupon) => {
    setFormData({ code: coupon.code, description: coupon.description, type: coupon.type,
      value: coupon.value.toString(), minPurchase: coupon.minPurchase.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || '', usageLimit: coupon.usageLimit.toString(),
      validFrom: coupon.validFrom.split('T')[0], validUntil: coupon.validUntil.split('T')[0], active: coupon.active })
    setEditingCoupon(coupon); setShowForm(true)
  }

  const handleSubmit = () => {
    const data = { code: formData.code.toUpperCase(), description: formData.description, type: formData.type,
      value: parseFloat(formData.value), minPurchase: parseFloat(formData.minPurchase) || 0,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
      usageLimit: parseInt(formData.usageLimit) || 100,
      validFrom: new Date(formData.validFrom).toISOString(), validUntil: new Date(formData.validUntil).toISOString(), active: formData.active }
    editingCoupon ? updateCoupon(editingCoupon.id, data) : addCoupon(data)
    resetForm()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Cupons de Desconto</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Crie e gerencie promoções</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="h-9 px-4 rounded-xl text-sm"
          style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
          <Plus className="w-4 h-4 mr-1.5" /> Novo Cupom
        </Button>
      </div>

      <Modal open={showForm} onClose={resetForm} title={editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Código"><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="PROMO10" className={`${inputClass} uppercase`} /></Field>
            <Field label="Tipo"><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className={selectClass}>
              <option value="percentage">Porcentagem (%)</option>
              <option value="fixed">Valor Fixo (R$)</option>
            </select></Field>
          </div>
          <Field label="Descrição"><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Desconto de 10% em toda a loja" className={inputClass} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={`Valor ${formData.type === 'percentage' ? '(%)' : '(R$)'}`}><Input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder="10" className={inputClass} /></Field>
            <Field label="Compra Mínima (R$)"><Input type="number" value={formData.minPurchase} onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })} placeholder="100" className={inputClass} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Desconto Máximo (R$)"><Input type="number" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })} placeholder="50" className={inputClass} /></Field>
            <Field label="Limite de Uso"><Input type="number" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })} placeholder="100" className={inputClass} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Válido de"><Input type="date" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} className={inputClass} /></Field>
            <Field label="Válido até"><Input type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} className={inputClass} /></Field>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.active ? 'bg-primary border-primary' : 'border-white/20'}`}
              onClick={() => setFormData({ ...formData, active: !formData.active })}>
              {formData.active && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm">Cupom Ativo</span>
          </label>
        </div>
        <div className="flex gap-3 mt-5">
          <Button variant="outline" onClick={resetForm} className="flex-1 h-11 rounded-xl border-white/10">Cancelar</Button>
          <Button onClick={handleSubmit} className="flex-1 h-11 rounded-xl" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
            <Save className="w-4 h-4 mr-2" />{editingCoupon ? 'Salvar' : 'Criar Cupom'}
          </Button>
        </div>
      </Modal>

      {coupons.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-white/5" style={{ background: '#111' }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <Tag className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold mb-1">Nenhum cupom cadastrado</h3>
          <p className="text-sm text-muted-foreground mb-5">Crie seu primeiro cupom de desconto</p>
          <Button onClick={() => setShowForm(true)} className="h-9 px-5 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
            <Plus className="w-4 h-4 mr-1.5" /> Criar Cupom
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 hover:border-white/8 transition-all" style={{ background: '#111' }}>
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-mono font-bold">{coupon.code}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${coupon.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-muted-foreground'}`}>
                    {coupon.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{coupon.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-primary">{coupon.type === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value)}</p>
                <p className="text-xs text-muted-foreground">Usado {coupon.usedCount}/{coupon.usageLimit}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/5" onClick={() => handleEdit(coupon)}>
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-400"
                  onClick={() => confirm('Excluir cupom?') && deleteCoupon(coupon.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Categories ───────────────────────────────────────────────
function CategoriesContent() {
  const { addCategory, updateCategory, deleteCategory, getAllCategories } = useCategoriesStore()
  const { getProductsByCategory } = useProductsStore()
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', slug: '', icon: 'package', description: '', featured: false })
  const allCategories = getAllCategories()

  const resetForm = () => { setFormData({ name: '', slug: '', icon: 'package', description: '', featured: false }); setEditingCategory(null); setShowForm(false) }

  const handleEdit = (cat: Category) => {
    setFormData({ name: cat.name, slug: cat.slug, icon: cat.icon, description: cat.description || '', featured: cat.featured || false })
    setEditingCategory(cat); setShowForm(true)
  }

  const handleSubmit = () => {
    const data = { name: formData.name, slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'), icon: formData.icon, description: formData.description, featured: formData.featured }
    editingCategory ? updateCategory(editingCategory.id, data) : addCategory(data)
    resetForm()
  }

  const iconOptions = ['smartphone', 'laptop', 'gamepad-2', 'cpu', 'mouse', 'monitor', 'headphones', 'cable', 'camera', 'tv', 'watch', 'printer']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="font-semibold">Categorias</h2><p className="text-xs text-muted-foreground mt-0.5">Organize seus produtos</p></div>
        <Button onClick={() => setShowForm(true)} className="h-9 px-4 rounded-xl text-sm"
          style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
          <Plus className="w-4 h-4 mr-1.5" /> Nova Categoria
        </Button>
      </div>

      <Modal open={showForm} onClose={resetForm} title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}>
        <div className="space-y-4">
          <Field label="Nome"><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Smartphones" className={inputClass} /></Field>
          <Field label="Slug (URL)"><Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="smartphones" className={inputClass} /></Field>
          <Field label="Ícone"><select value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className={selectClass}>
            {iconOptions.map(i => <option key={i} value={i}>{i}</option>)}
          </select></Field>
          <Field label="Descrição">
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição da categoria..."
              className="w-full h-20 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 resize-none text-sm focus:outline-none focus:border-primary/40" />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.featured ? 'bg-primary border-primary' : 'border-white/20'}`}
              onClick={() => setFormData({ ...formData, featured: !formData.featured })}>
              {formData.featured && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm">Categoria em Destaque</span>
          </label>
        </div>
        <div className="flex gap-3 mt-5">
          <Button variant="outline" onClick={resetForm} className="flex-1 h-11 rounded-xl border-white/10">Cancelar</Button>
          <Button onClick={handleSubmit} className="flex-1 h-11 rounded-xl" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
            <Save className="w-4 h-4 mr-2" />{editingCategory ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </Modal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allCategories.map((cat) => {
          const count = getProductsByCategory(cat.name).length
          return (
            <div key={cat.id} className="p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all" style={{ background: '#111' }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{count} produto{count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-white/5" onClick={() => handleEdit(cat)}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-rose-500/10 hover:text-rose-400"
                    onClick={() => confirm('Excluir categoria?') && deleteCategory(cat.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              {cat.featured && (
                <span className="inline-block mt-3 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">⭐ Destaque</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Flash Sales ──────────────────────────────────────────────
function FlashSalesContent() {
  const { getAllProducts, setFlashSale, removeFlashSale, getFlashSaleProducts } = useProductsStore()
  const [showForm, setShowForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [formData, setFormData] = useState({ price: '', stock: '', endsAt: '' })
  const products = getAllProducts()
  const flashSaleProducts = getFlashSaleProducts()
  const available = products.filter(p => !p.isFlashSale)

  const handleSubmit = () => {
    if (!selectedProduct || !formData.price || !formData.stock || !formData.endsAt) return
    setFlashSale(selectedProduct, { price: parseFloat(formData.price), stock: parseInt(formData.stock), endsAt: new Date(formData.endsAt).toISOString() })
    setShowForm(false); setSelectedProduct(''); setFormData({ price: '', stock: '', endsAt: '' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold flex items-center gap-2">Flash Sales <Zap className="w-4 h-4 text-amber-400" /></h2>
          <p className="text-xs text-muted-foreground mt-0.5">Ofertas relâmpago com tempo limitado</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="h-9 px-4 rounded-xl text-sm"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
          <Zap className="w-4 h-4 mr-1.5" /> Nova Flash Sale
        </Button>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Criar Flash Sale">
        <div className="space-y-4">
          <Field label="Produto"><select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className={selectClass}>
            <option value="">Selecione um produto...</option>
            {available.map(p => <option key={p.id} value={p.id}>{p.name} — {formatPrice(p.price)}</option>)}
          </select></Field>
          <Field label="Preço Promocional (R$)"><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="99.90" className={inputClass} /></Field>
          <Field label="Estoque Promocional"><Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} placeholder="50" className={inputClass} /></Field>
          <Field label="Termina em"><Input type="datetime-local" value={formData.endsAt} onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })} className={inputClass} /></Field>
        </div>
        <div className="flex gap-3 mt-5">
          <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 h-11 rounded-xl border-white/10">Cancelar</Button>
          <Button onClick={handleSubmit} className="flex-1 h-11 rounded-xl font-semibold"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <Zap className="w-4 h-4 mr-2" /> Criar Flash Sale
          </Button>
        </div>
      </Modal>

      {flashSaleProducts.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-white/5" style={{ background: '#111' }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Zap className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="font-semibold mb-1">Nenhuma Flash Sale ativa</h3>
          <p className="text-sm text-muted-foreground mb-5">Crie ofertas relâmpago para impulsionar vendas</p>
          <Button onClick={() => setShowForm(true)} className="h-9 px-5 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <Zap className="w-4 h-4 mr-1.5" /> Criar Flash Sale
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {flashSaleProducts.map((product) => {
            const sold = product.flashSaleSold || 0
            const total = product.flashSaleStock || 1
            const pct = Math.round((sold / total) * 100)
            return (
              <div key={product.id} className="p-4 rounded-2xl border border-amber-500/15 hover:border-amber-500/25 transition-all" style={{ background: '#111' }}>
                <div className="flex items-center gap-4">
                  <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{product.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
                      <span className="text-base font-bold text-emerald-400">{formatPrice(product.flashSalePrice || 0)}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{sold}/{total} vendidos</span>
                        <span className="text-amber-400 font-medium">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">Termina em</p>
                    <p className="text-xs font-medium text-amber-400 mt-0.5">{new Date(product.flashSaleEndsAt || '').toLocaleString('pt-BR')}</p>
                    <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg"
                      onClick={() => confirm('Encerrar Flash Sale?') && removeFlashSale(product.id)}>
                      <X className="w-3 h-3 mr-1" /> Encerrar
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Chat ─────────────────────────────────────────────────────
function ChatContent() {
  const { getAllConversations, getMessages, sendMessage, markAsRead } = useChatStore()
  const conversations = getAllConversations()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messages = selectedConversation ? getMessages(selectedConversation) : []
  const selectedConv = conversations.find(c => c.id === selectedConversation)

  const handleSend = () => {
    if (!newMessage.trim() || !selectedConversation) return
    sendMessage(selectedConversation, 'admin-1', 'Administrador', true, newMessage)
    setNewMessage('')
  }

  useEffect(() => { if (selectedConversation) markAsRead(selectedConversation, true) }, [selectedConversation, markAsRead])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: '#111', height: 'calc(100vh - 10rem)' }}>
      <div className="grid md:grid-cols-[280px_1fr] h-full">
        {/* Conversations List */}
        <div className="flex flex-col border-r border-white/5 overflow-hidden">
          <div className="p-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 className="font-semibold text-sm">Conversas</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{conversations.length} conversas</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma conversa</p>
              </div>
            ) : conversations.map((conv) => (
              <button key={conv.id} onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-3.5 text-left transition-colors hover:bg-white/[0.03] flex items-center gap-3 ${selectedConversation === conv.id ? 'bg-white/[0.05]' : ''}`}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-sm text-primary shrink-0">
                  {conv.participantName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{conv.participantName}</p>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold shrink-0">{conv.unreadCount}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage || 'Nova conversa'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex flex-col min-h-0">
          {selectedConversation ? (
            <>
              <div className="p-4 shrink-0 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-sm text-primary">
                  {selectedConv?.participantName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{selectedConv?.participantName}</p>
                  <p className="text-xs text-muted-foreground">{selectedConv?.participantEmail}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.isAdmin
                      ? 'text-white rounded-br-sm'
                      : 'bg-white/[0.06] text-foreground rounded-bl-sm'}`}
                      style={msg.isAdmin ? { background: 'linear-gradient(135deg, #dc2626, #b91c1c)' } : undefined}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-[11px] mt-1 ${msg.isAdmin ? 'text-white/60' : 'text-muted-foreground'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex gap-2">
                  <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Digite uma mensagem..."
                    className="h-10 rounded-xl bg-white/5 border-white/10 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
                  <Button className="h-10 px-4 rounded-xl shrink-0"
                    style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }} onClick={handleSend}>
                    Enviar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Selecione uma conversa</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────
function SettingsContent() {
  const { settings, updateSettings } = useStoreSettingsStore()
  const [storeForm, setStoreForm] = useState({ storeName: settings.storeName, contactEmail: settings.contactEmail, contactPhone: settings.contactPhone })
  const [shippingForm, setShippingForm] = useState({ freeShippingThreshold: settings.freeShippingThreshold, defaultShippingCost: settings.defaultShippingCost })
  const [paymentForm, setPaymentForm] = useState({ pixEnabled: settings.pixEnabled, pixDiscountPercent: settings.pixDiscountPercent, boletoEnabled: settings.boletoEnabled, boletoExpirationDays: settings.boletoExpirationDays })
  const [saved, setSaved] = useState<string | null>(null)

  const save = (key: string, data: object) => {
    updateSettings(data); setSaved(key); setTimeout(() => setSaved(null), 2000)
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-white/10'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
    </button>
  )

  return (
    <div className="max-w-2xl space-y-4">
      {/* Store Info */}
      <div className="p-5 rounded-2xl border border-white/5" style={{ background: '#111' }}>
        <h3 className="font-semibold text-sm mb-4">Informações da Loja</h3>
        <div className="space-y-4">
          <Field label="Nome da Loja"><Input value={storeForm.storeName} onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })} className={inputClass} /></Field>
          <Field label="E-mail de Contato"><Input type="email" value={storeForm.contactEmail} onChange={(e) => setStoreForm({ ...storeForm, contactEmail: e.target.value })} className={inputClass} /></Field>
          <Field label="Telefone"><Input value={storeForm.contactPhone} onChange={(e) => setStoreForm({ ...storeForm, contactPhone: e.target.value })} className={inputClass} /></Field>
          <Button onClick={() => save('store', storeForm)} className="h-10 px-5 rounded-xl text-sm"
            style={{ background: saved === 'store' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
            {saved === 'store' ? <><Check className="w-4 h-4 mr-2" /> Salvo!</> : <><Save className="w-4 h-4 mr-2" /> Salvar</>}
          </Button>
        </div>
      </div>

      {/* Shipping */}
      <div className="p-5 rounded-2xl border border-white/5" style={{ background: '#111' }}>
        <h3 className="font-semibold text-sm mb-4">Configurações de Envio</h3>
        <div className="space-y-4">
          <Field label="Frete Grátis a partir de (R$)"><Input type="number" value={shippingForm.freeShippingThreshold} onChange={(e) => setShippingForm({ ...shippingForm, freeShippingThreshold: parseFloat(e.target.value) || 0 })} placeholder="299" className={inputClass} /></Field>
          <Field label="Valor do Frete Padrão (R$)"><Input type="number" value={shippingForm.defaultShippingCost} onChange={(e) => setShippingForm({ ...shippingForm, defaultShippingCost: parseFloat(e.target.value) || 0 })} placeholder="29.90" className={inputClass} /></Field>
          <Button onClick={() => save('shipping', shippingForm)} className="h-10 px-5 rounded-xl text-sm"
            style={{ background: saved === 'shipping' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
            {saved === 'shipping' ? <><Check className="w-4 h-4 mr-2" /> Salvo!</> : <><Save className="w-4 h-4 mr-2" /> Salvar</>}
          </Button>
        </div>
      </div>

      {/* Payment */}
      <div className="p-5 rounded-2xl border border-white/5" style={{ background: '#111' }}>
        <h3 className="font-semibold text-sm mb-4">Métodos de Pagamento</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">PIX</p>
                <p className="text-xs text-muted-foreground">Pagamento instantâneo</p>
              </div>
              <Toggle value={paymentForm.pixEnabled} onChange={v => setPaymentForm({ ...paymentForm, pixEnabled: v })} />
            </div>
            {paymentForm.pixEnabled && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <Field label="Desconto PIX (%)">
                  <Input type="number" min={0} max={50} value={paymentForm.pixDiscountPercent}
                    onChange={(e) => setPaymentForm({ ...paymentForm, pixDiscountPercent: parseFloat(e.target.value) || 0 })}
                    className={`${inputClass} w-32`} />
                </Field>
              </div>
            )}
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Boleto Bancário</p>
                <p className="text-xs text-muted-foreground">Compensação em 1-3 dias úteis</p>
              </div>
              <Toggle value={paymentForm.boletoEnabled} onChange={v => setPaymentForm({ ...paymentForm, boletoEnabled: v })} />
            </div>
            {paymentForm.boletoEnabled && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <Field label="Vencimento (dias úteis)">
                  <Input type="number" min={1} max={30} value={paymentForm.boletoExpirationDays}
                    onChange={(e) => setPaymentForm({ ...paymentForm, boletoExpirationDays: parseInt(e.target.value) || 3 })}
                    className={`${inputClass} w-32`} />
                </Field>
              </div>
            )}
          </div>
          <Button onClick={() => save('payment', paymentForm)} className="h-10 px-5 rounded-xl text-sm"
            style={{ background: saved === 'payment' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
            {saved === 'payment' ? <><Check className="w-4 h-4 mr-2" /> Salvo!</> : <><Save className="w-4 h-4 mr-2" /> Salvar Configurações</>}
          </Button>
        </div>
      </div>
    </div>
  )
}
