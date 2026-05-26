'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, ShoppingCart, Heart, User, Menu, X, 
  ChevronDown, Smartphone, Laptop, Gamepad2, Cpu, 
  Mouse, Monitor, Headphones, Cable, LogOut, Shield, UserCircle, Zap, Tag,
  Scale, History, Bell, TrendingUp
} from 'lucide-react'
import { Logo } from './logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NotificationBell } from '@/components/notification-dropdown'
import { useCartStore, useAuthStore, useWishlistStore, useProductsStore, useComparisonStore, useRecentlyViewedStore } from '@/lib/store'
import { categories } from '@/lib/data'

interface HeaderProps {
  onCartOpen: () => void
  onSearch: (query: string) => void
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  smartphone: Smartphone,
  laptop: Laptop,
  'gamepad-2': Gamepad2,
  cpu: Cpu,
  mouse: Mouse,
  monitor: Monitor,
  headphones: Headphones,
  cable: Cable,
}

export function Header({ onCartOpen, onSearch }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchProducts>>([])
  const [showCategories, setShowCategories] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const { items } = useCartStore()
  const { user, logout, isAuthenticated } = useAuthStore()
  const wishlist = useWishlistStore()
  const { searchProducts } = useProductsStore()
  const comparison = useComparisonStore()
  const recentlyViewed = useRecentlyViewedStore()

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchProducts(searchQuery)
      setSearchResults(results.slice(0, 5))
    } else {
      setSearchResults([])
    }
  }, [searchQuery, searchProducts])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass shadow-lg' : 'bg-background/80 backdrop-blur-sm'
        }`}
      >
        {/* Promo banner */}
        <div className="hidden md:flex items-center justify-between border-b border-border/40 py-1.5 bg-primary/5">
          <div className="container mx-auto px-4 flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 text-primary font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>Frete GRÁTIS acima de R$ 299</span>
              <span className="text-border">|</span>
              <span className="text-muted-foreground">Entrega até 24h para capitais</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a>
              <Link href="/tracking/search" className="hover:text-primary transition-colors">Rastrear Pedido</Link>
              <Link href="/admin" className="hover:text-primary transition-colors flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Área Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Logo size="md" />
            </Link>

            {/* Search - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-6 relative">
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar produtos, marcas e categorias..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-28 h-11 bg-secondary border-border focus:border-primary rounded-xl text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 h-8 gradient-primary text-white text-sm font-semibold rounded-lg hover:brightness-110 transition"
                  >
                    Buscar
                  </button>
                </div>
              </form>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl overflow-hidden shadow-2xl border border-border/50 z-50"
                  >
                    <div className="px-4 py-2.5 border-b border-border/30 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground font-medium">{searchResults.length} resultado(s)</p>
                      <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => {
                          setSearchQuery('')
                          setSearchResults([])
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary/50 shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category} · {product.brand}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                          </p>
                          <div className="flex items-center justify-end gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-[10px] ${ i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-muted' }`}>★</span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                    <div className="px-4 py-2.5 border-t border-border/30">
                      <button
                        onClick={() => { handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent); setSearchResults([]) }}
                        className="text-xs text-primary hover:underline font-medium w-full text-center"
                      >
                        Ver todos os resultados para "{searchQuery}" →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile search toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Notifications */}
              {isAuthenticated && <NotificationBell />}

              {/* Comparison */}
              <Link href="/compare">
                <Button variant="ghost" size="icon" className="relative hidden md:flex">
                  <Scale className="w-5 h-5" />
                  {comparison.products.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {comparison.products.length}
                    </span>
                  )}
                </Button>
              </Link>

              {/* History */}
              <Link href="/history">
                <Button variant="ghost" size="icon" className="relative hidden md:flex">
                  <History className="w-5 h-5" />
                  {recentlyViewed.products.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </Button>
              </Link>

              {/* Wishlist */}
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="w-5 h-5" />
                  {wishlist.items.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {wishlist.items.length}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Cart */}
              <Button variant="ghost" size="icon" className="relative" onClick={onCartOpen}>
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>

              {/* User Menu */}
              {isAuthenticated && user ? (
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">{user.name.charAt(0)}</span>
                    </div>
                    <span className="font-medium text-sm">{user.name.split(' ')[0]}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 top-full mt-2 w-56 glass rounded-xl overflow-hidden shadow-2xl z-50"
                        >
                          <div className="p-4 border-b border-border">
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="p-2">
                            <Link
                              href="/profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
                            >
                              <UserCircle className="w-5 h-5" />
                              <span>Meu Perfil</span>
                            </Link>
                            <Link
                              href="/history"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
                            >
                              <History className="w-5 h-5" />
                              <span>Histórico</span>
                            </Link>
                            <Link
                              href="/compare"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
                            >
                              <Scale className="w-5 h-5" />
                              <span>Comparar</span>
                              {comparison.products.length > 0 && (
                                <span className="ml-auto px-2 py-0.5 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-full">
                                  {comparison.products.length}
                                </span>
                              )}
                            </Link>
                            {user.isAdmin && (
                              <Link
                                href="/admin"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-primary"
                              >
                                <Shield className="w-5 h-5" />
                                <span>Painel Admin</span>
                              </Link>
                            )}
                            <button
                              onClick={() => {
                                logout()
                                setShowUserMenu(false)
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-destructive"
                            >
                              <LogOut className="w-5 h-5" />
                              <span>Sair</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:block">
                  <Button variant="ghost" size="sm">
                    <User className="w-5 h-5 mr-2" />
                    Entrar
                  </Button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Categories Bar - Desktop */}
          <nav className="hidden lg:flex items-center gap-6 mt-3 pt-3 border-t border-border/50">
            <div 
              className="relative"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                <Menu className="w-4 h-4" />
                Categorias
                <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-64 glass rounded-xl shadow-2xl overflow-hidden"
                  >
                    {categories.map((category) => {
                      const Icon = categoryIcons[category.icon] || Cpu
                      return (
                        <Link
                          key={category.id}
                          href={`/category/${category.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                        >
                          <Icon className="w-5 h-5 text-primary" />
                          <span className="flex-1 text-sm">{category.name}</span>
                          <span className="text-xs text-muted-foreground">{category.count}</span>
                        </Link>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {['Ofertas', 'Lancamentos', 'Mais Vendidos', 'Marcas', 'Cupons'].map((item) => (
              <Link
                key={item}
                href={item === 'Cupons' ? '/coupons' : `/${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {item}
              </Link>
            ))}
            
            {/* Flash Sale Link */}
            <Link
              href="/flash-sale"
              className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Flash Sale
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg p-4"
          >
            <div className="flex items-center gap-4 mb-4">
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-12 pr-4 h-12 bg-secondary border-border focus:border-primary rounded-xl"
                  />
                </div>
              </form>
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-3 p-3 bg-secondary rounded-xl"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <p className="text-sm font-bold text-primary mt-1">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Logo size="md" />
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {categories.map((category) => {
                    const Icon = categoryIcons[category.icon] || Cpu
                    return (
                      <Link
                        key={category.id}
                        href={`/category/${category.id}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary transition-colors"
                      >
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="flex-1">{category.name}</span>
                        <span className="text-sm text-muted-foreground">{category.count}</span>
                      </Link>
                    )
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-border space-y-2">
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary transition-colors text-primary"
                  >
                    <Shield className="w-5 h-5" />
                    Area Admin
                  </Link>
                  {['Ofertas', 'Lancamentos', 'Mais Vendidos', 'Marcas', 'Cupons'].map((item) => (
                    <Link
                      key={item}
                      href={`/${item.toLowerCase().replace(' ', '-')}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl hover:bg-secondary transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-border">
                {isAuthenticated && user ? (
                  <div className="space-y-3">
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </Link>
                    <Button variant="outline" className="w-full" onClick={logout}>
                      <LogOut className="w-5 h-5 mr-2" />
                      Sair da Conta
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full gradient-primary">
                    <User className="w-5 h-5 mr-2" />
                    Entrar ou Cadastrar
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-[120px] lg:h-[140px]" />
    </>
  )
}
