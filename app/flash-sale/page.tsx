'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, Clock, ShoppingCart, ChevronRight, Flame, Package,
  Bell, BellOff, ArrowRight, Heart, Filter, X, ChevronDown,
  TrendingUp, Timer, Sparkles, Gift, Crown, Star, Percent,
  SlidersHorizontal, LayoutGrid, LayoutList, Grid
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { ProductCard } from '@/components/product-card'
import { useProductsStore, useCartStore, useWishlistStore, useAuthStore, useNotificationsStore } from '@/lib/store'
import { formatPrice, getTimeRemaining } from '@/lib/data'

type ViewMode = 'grid' | 'list' | 'cards'
type SortOption = 'discount' | 'price_asc' | 'price_desc' | 'ending_soon' | 'popular'

export default function FlashSalePage() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { getFlashSaleProducts, getAllProducts } = useProductsStore()
  const { addItem } = useCartStore()
  const wishlist = useWishlistStore()
  const { user, isAuthenticated } = useAuthStore()
  const { notifyFlashSale } = useNotificationsStore()
  const [timeLeft, setTimeLeft] = useState<Record<string, ReturnType<typeof getTimeRemaining>>>({})
  const [notifyEnabled, setNotifyEnabled] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [sortBy, setSortBy] = useState<SortOption>('discount')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])
  const [minDiscount, setMinDiscount] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  
  const flashSaleProducts = useMemo(() => getFlashSaleProducts(), []) // eslint-disable-line
  const allProducts = useMemo(() => getAllProducts(), []) // eslint-disable-line

  // Ref to always have latest products without causing effect re-runs
  const flashSaleProductsRef = useRef(flashSaleProducts)
  flashSaleProductsRef.current = flashSaleProducts

  // Get products that could be on flash sale (for "coming soon" section)
  const potentialFlashSaleProducts = useMemo(() => {
    return allProducts
      .filter(p => !p.isFlashSale && p.stock > 0)
      .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
      .slice(0, 8)
  }, [allProducts])

  // Filter and sort flash sale products
  const filteredProducts = useMemo(() => {
    let filtered = [...flashSaleProducts]

    // Filter by price range
    filtered = filtered.filter(p => {
      const price = p.flashSalePrice || p.price
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Filter by minimum discount
    if (minDiscount > 0) {
      filtered = filtered.filter(p => {
        const discount = Math.round(((p.price - (p.flashSalePrice || 0)) / p.price) * 100)
        return discount >= minDiscount
      })
    }

    // Sort
    switch (sortBy) {
      case 'discount':
        filtered.sort((a, b) => {
          const discountA = Math.round(((a.price - (a.flashSalePrice || 0)) / a.price) * 100)
          const discountB = Math.round(((b.price - (b.flashSalePrice || 0)) / b.price) * 100)
          return discountB - discountA
        })
        break
      case 'price_asc':
        filtered.sort((a, b) => (a.flashSalePrice || 0) - (b.flashSalePrice || 0))
        break
      case 'price_desc':
        filtered.sort((a, b) => (b.flashSalePrice || 0) - (a.flashSalePrice || 0))
        break
      case 'ending_soon':
        filtered.sort((a, b) => {
          const timeA = a.flashSaleEndsAt ? new Date(a.flashSaleEndsAt).getTime() : Infinity
          const timeB = b.flashSaleEndsAt ? new Date(b.flashSaleEndsAt).getTime() : Infinity
          return timeA - timeB
        })
        break
      case 'popular':
        filtered.sort((a, b) => (b.flashSaleSold || 0) - (a.flashSaleSold || 0))
        break
    }

    return filtered
  }, [flashSaleProducts, sortBy, priceRange, minDiscount])

  // Stats
  const stats = useMemo(() => {
    const totalSavings = flashSaleProducts.reduce((sum, p) => {
      return sum + (p.price - (p.flashSalePrice || 0))
    }, 0)
    const avgDiscount = flashSaleProducts.length > 0
      ? Math.round(flashSaleProducts.reduce((sum, p) => {
          return sum + Math.round(((p.price - (p.flashSalePrice || 0)) / p.price) * 100)
        }, 0) / flashSaleProducts.length)
      : 0
    const totalSold = flashSaleProducts.reduce((sum, p) => sum + (p.flashSaleSold || 0), 0)
    
    return { totalSavings, avgDiscount, totalSold, totalProducts: flashSaleProducts.length }
  }, [flashSaleProducts])

  useEffect(() => {
    const updateTimers = () => {
      const newTimeLeft: Record<string, ReturnType<typeof getTimeRemaining>> = {}
      flashSaleProductsRef.current.forEach(product => {
        if (product.flashSaleEndsAt) {
          newTimeLeft[product.id] = getTimeRemaining(product.flashSaleEndsAt)
        }
      })
      setTimeLeft(prev => {
        // Only update if values changed to avoid unnecessary re-renders
        const changed = Object.keys(newTimeLeft).some(
          k => !prev[k] || prev[k].seconds !== newTimeLeft[k].seconds
        )
        return changed ? newTimeLeft : prev
      })
    }

    updateTimers()
    const interval = setInterval(updateTimers, 1000)
    return () => clearInterval(interval)
  }, []) // empty deps - timer runs independently

  const handleAddToCart = (product: typeof flashSaleProducts[0]) => {
    const cartProduct = {
      ...product,
      price: product.flashSalePrice || product.price
    }
    addItem(cartProduct)
    setIsCartOpen(true)
  }

  const handleNotifyMe = () => {
    if (isAuthenticated && user) {
      setNotifyEnabled(!notifyEnabled)
      if (!notifyEnabled) {
        alert('Você será notificado quando novas ofertas começarem!')
      }
    } else {
      alert('Faça login para receber notificações')
    }
  }

  const handleToggleWishlist = (product: typeof flashSaleProducts[0]) => {
    if (wishlist.isInWishlist(product.id)) {
      wishlist.removeItem(product.id)
    } else {
      wishlist.addItem(product)
    }
  }

  // Calculate global countdown (earliest ending sale)
  const globalEndTime = useMemo(() => {
    if (flashSaleProducts.length === 0) return null
    const times = flashSaleProducts
      .filter(p => p.flashSaleEndsAt)
      .map(p => new Date(p.flashSaleEndsAt!).getTime())
    return times.length > 0 ? Math.min(...times) : null
  }, [flashSaleProducts])

  const [globalTimeLeft, setGlobalTimeLeft] = useState<ReturnType<typeof getTimeRemaining> | null>(null)

  const globalEndTimeRef = useRef(globalEndTime)
  globalEndTimeRef.current = globalEndTime

  useEffect(() => {
    const updateGlobalTimer = () => {
      if (!globalEndTimeRef.current) return
      setGlobalTimeLeft(getTimeRemaining(new Date(globalEndTimeRef.current).toISOString()))
    }
    
    updateGlobalTimer()
    const interval = setInterval(updateGlobalTimer, 1000)
    return () => clearInterval(interval)
  }, []) // empty deps - runs once

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCartOpen={() => setIsCartOpen(true)} onSearch={() => {}} />
      
      <main className="flex-1 pt-20">
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                initial={{ 
                  x: Math.random() * 100 + '%', 
                  y: '100%',
                  opacity: 0.3 
                }}
                animate={{ 
                  y: '-100%',
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Zap className="w-10 h-10" />
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-bold">Flash Sale</h1>
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Zap className="w-10 h-10" />
                </motion.div>
              </div>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                Ofertas relâmpago com descontos incríveis! Corra, o estoque é limitado!
              </p>

              {/* Global Countdown */}
              {globalTimeLeft && globalTimeLeft.total > 0 && (
                <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 mb-8">
                  <Timer className="w-6 h-6" />
                  <span className="text-lg font-medium">Próxima oferta termina em:</span>
                  <div className="flex gap-2">
                    {globalTimeLeft.days > 0 && (
                      <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                        <p className="text-2xl font-bold">{globalTimeLeft.days}</p>
                        <p className="text-xs">dias</p>
                      </div>
                    )}
                    <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                      <p className="text-2xl font-bold">{String(globalTimeLeft.hours).padStart(2, '0')}</p>
                      <p className="text-xs">horas</p>
                    </div>
                    <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                      <p className="text-2xl font-bold">{String(globalTimeLeft.minutes).padStart(2, '0')}</p>
                      <p className="text-xs">min</p>
                    </div>
                    <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                      <motion.p 
                        className="text-2xl font-bold"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {String(globalTimeLeft.seconds).padStart(2, '0')}
                      </motion.p>
                      <p className="text-xs">seg</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              {stats.totalProducts > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <Package className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-3xl font-bold">{stats.totalProducts}</p>
                    <p className="text-sm text-white/80">Ofertas Ativas</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <Percent className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-3xl font-bold">{stats.avgDiscount}%</p>
                    <p className="text-sm text-white/80">Desconto Médio</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-3xl font-bold">{stats.totalSold}</p>
                    <p className="text-sm text-white/80">Vendidos</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <Gift className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-3xl font-bold">{formatPrice(stats.totalSavings)}</p>
                    <p className="text-sm text-white/80">Total Economia</p>
                  </div>
                </div>
              )}

              <Button 
                variant="secondary" 
                onClick={handleNotifyMe}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {notifyEnabled ? (
                  <>
                    <BellOff className="w-4 h-4 mr-2" />
                    Desativar Notificações
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    Notificar-me de novas ofertas
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {flashSaleProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Zap className="w-12 h-12 text-orange-500" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Nenhuma Flash Sale ativa no momento</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Volte em breve para conferir nossas próximas ofertas relâmpago! 
                Ative as notificações para ser avisado.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/">
                  <Button size="lg">Ver todos os produtos</Button>
                </Link>
                <Button size="lg" variant="outline" onClick={handleNotifyMe}>
                  <Bell className="w-4 h-4 mr-2" />
                  Ativar Notificações
                </Button>
              </div>

              {/* Potential Flash Sale Products */}
              {potentialFlashSaleProducts.length > 0 && (
                <div className="mt-16 text-left">
                  <div className="flex items-center gap-2 justify-center mb-6">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold">Produtos que podem entrar em promoção</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {potentialFlashSaleProducts.slice(0, 4).map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <>
              {/* Filters Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'oferta' : 'ofertas'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={showFilters ? 'bg-primary/10 border-primary/50' : ''}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="discount">Maior Desconto</option>
                      <option value="price_asc">Menor Preço</option>
                      <option value="price_desc">Maior Preço</option>
                      <option value="ending_soon">Terminando</option>
                      <option value="popular">Mais Vendidos</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex bg-secondary rounded-lg p-1">
                    <Button
                      variant={viewMode === 'cards' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                      className="px-3"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="px-3"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="px-3"
                    >
                      <LayoutList className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-card rounded-xl border border-border"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Filtros</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Price Range */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Faixa de Preço</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className="w-24"
                            placeholder="Min"
                          />
                          <span className="text-muted-foreground">até</span>
                          <Input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="w-24"
                            placeholder="Max"
                          />
                        </div>
                      </div>

                      {/* Min Discount */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Desconto Mínimo</label>
                        <div className="flex flex-wrap gap-2">
                          {[0, 10, 20, 30, 50].map((d) => (
                            <Button
                              key={d}
                              variant={minDiscount === d ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setMinDiscount(d)}
                            >
                              {d === 0 ? 'Todos' : `${d}%+`}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Quick Sort */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Ordenar Por</label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={sortBy === 'ending_soon' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy('ending_soon')}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Terminando
                          </Button>
                          <Button
                            variant={sortBy === 'discount' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy('discount')}
                          >
                            <Percent className="w-4 h-4 mr-1" />
                            % Desconto
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setPriceRange([0, 50000])
                          setMinDiscount(0)
                          setSortBy('discount')
                        }}
                      >
                        Limpar Filtros
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Products Display - Cards View */}
              {viewMode === 'cards' && (
                <div className="grid gap-6">
                  {filteredProducts.map((product, index) => {
                    const time = timeLeft[product.id] || { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
                    const soldPercentage = ((product.flashSaleSold || 0) / (product.flashSaleStock || 1)) * 100
                    const discount = Math.round(((product.price - (product.flashSalePrice || 0)) / product.price) * 100)
                    const isInWishlist = wishlist.isInWishlist(product.id)
                    const isEndingSoon = time.total > 0 && time.total < 3600000 // Less than 1 hour
                    const isAlmostGone = soldPercentage >= 80
                    
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-card rounded-2xl border overflow-hidden ${
                          isEndingSoon || isAlmostGone ? 'border-orange-500/50 shadow-lg shadow-orange-500/10' : 'border-border'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Product Image */}
                          <div className="relative md:w-80 h-64 md:h-auto flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                <Flame className="w-4 h-4" />
                                -{discount}%
                              </div>
                              {isEndingSoon && (
                                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                  Terminando!
                                </div>
                              )}
                              {isAlmostGone && (
                                <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                  Últimas unidades!
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleToggleWishlist(product)}
                              className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg transition-all hover:scale-110 ${
                                isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                              }`}
                            >
                              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                            </button>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 p-6">
                            <div className="flex flex-col h-full">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs text-muted-foreground">{product.category}</span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs font-medium text-primary">{product.brand}</span>
                                </div>
                                <Link href={`/product/${product.id}`}>
                                  <h2 className="text-xl md:text-2xl font-bold hover:text-primary transition-colors">
                                    {product.name}
                                  </h2>
                                </Link>
                                <p className="text-muted-foreground mt-2 line-clamp-2">
                                  {product.description}
                                </p>

                                {/* Rating */}
                                {product.rating > 0 && (
                                  <div className="flex items-center gap-2 mt-3">
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < Math.floor(product.rating)
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'fill-muted text-muted'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      ({product.reviews} avaliações)
                                    </span>
                                  </div>
                                )}

                                {/* Price */}
                                <div className="flex items-center gap-3 mt-4">
                                  <span className="text-3xl font-bold text-primary">
                                    {formatPrice(product.flashSalePrice || 0)}
                                  </span>
                                  <span className="text-lg text-muted-foreground line-through">
                                    {formatPrice(product.price)}
                                  </span>
                                  <span className="px-2 py-1 bg-green-500/10 text-green-500 text-sm font-medium rounded">
                                    Economize {formatPrice(product.price - (product.flashSalePrice || 0))}
                                  </span>
                                </div>

                                {/* Timer */}
                                <div className="mt-4">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Clock className={`w-4 h-4 ${isEndingSoon ? 'text-orange-500' : ''}`} />
                                    <span>Termina em:</span>
                                  </div>
                                  <div className="flex gap-2">
                                    {time.days > 0 && (
                                      <div className="bg-secondary rounded-lg px-3 py-2 text-center min-w-[60px]">
                                        <p className="text-xl font-bold">{time.days}</p>
                                        <p className="text-xs text-muted-foreground">dias</p>
                                      </div>
                                    )}
                                    <div className="bg-secondary rounded-lg px-3 py-2 text-center min-w-[60px]">
                                      <p className="text-xl font-bold">{String(time.hours).padStart(2, '0')}</p>
                                      <p className="text-xs text-muted-foreground">horas</p>
                                    </div>
                                    <div className="bg-secondary rounded-lg px-3 py-2 text-center min-w-[60px]">
                                      <p className="text-xl font-bold">{String(time.minutes).padStart(2, '0')}</p>
                                      <p className="text-xs text-muted-foreground">min</p>
                                    </div>
                                    <div className={`rounded-lg px-3 py-2 text-center min-w-[60px] ${
                                      isEndingSoon ? 'bg-orange-500/20' : 'bg-secondary'
                                    }`}>
                                      <motion.p 
                                        className={`text-xl font-bold ${isEndingSoon ? 'text-orange-500' : ''}`}
                                        animate={isEndingSoon ? { scale: [1, 1.1, 1] } : {}}
                                        transition={{ duration: 1, repeat: Infinity }}
                                      >
                                        {String(time.seconds).padStart(2, '0')}
                                      </motion.p>
                                      <p className="text-xs text-muted-foreground">seg</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Stock Progress */}
                                <div className="mt-4">
                                  <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">
                                      <span className="font-bold text-foreground">{product.flashSaleSold || 0}</span> vendidos
                                    </span>
                                    <span className={`${isAlmostGone ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                      Restam <span className="font-bold">
                                        {(product.flashSaleStock || 0) - (product.flashSaleSold || 0)}
                                      </span> unidades
                                    </span>
                                  </div>
                                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${soldPercentage}%` }}
                                      transition={{ duration: 1, delay: index * 0.1 }}
                                      className={`h-full rounded-full ${
                                        isAlmostGone 
                                          ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                          : 'bg-gradient-to-r from-orange-500 to-red-500'
                                      }`}
                                    />
                                  </div>
                                  {soldPercentage >= 70 && (
                                    <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                                      <Flame className="w-3 h-3" />
                                      {soldPercentage >= 90 ? 'Últimas unidades!' : 'Quase esgotando!'}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-3 mt-6">
                                <Button 
                                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-12"
                                  onClick={() => handleAddToCart(product)}
                                >
                                  <ShoppingCart className="w-5 h-5 mr-2" />
                                  Adicionar ao Carrinho
                                </Button>
                                <Link href={`/product/${product.id}`}>
                                  <Button variant="outline" className="h-12">
                                    Ver Detalhes
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Products Display - Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}

              {/* Products Display - List View */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {filteredProducts.map((product, index) => {
                    const time = timeLeft[product.id] || { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
                    const soldPercentage = ((product.flashSaleSold || 0) / (product.flashSaleStock || 1)) * 100
                    const discount = Math.round(((product.price - (product.flashSalePrice || 0)) / product.price) * 100)
                    const isInWishlist = wishlist.isInWishlist(product.id)
                    
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
                      >
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute -top-2 -left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                            -{discount}%
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${product.id}`}>
                            <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-muted-foreground">{product.category} • {product.brand}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(product.flashSalePrice || 0)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        </div>

                        <div className="hidden md:flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono">
                            {String(time.hours).padStart(2, '0')}:
                            {String(time.minutes).padStart(2, '0')}:
                            {String(time.seconds).padStart(2, '0')}
                          </span>
                        </div>

                        <div className="hidden md:block w-32">
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                              style={{ width: `${soldPercentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 text-center">
                            {product.flashSaleSold || 0}/{product.flashSaleStock}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleWishlist(product)}
                            className={isInWishlist ? 'text-red-500' : ''}
                          >
                            <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {filteredProducts.length === 0 && flashSaleProducts.length > 0 && (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma oferta encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Tente ajustar os filtros para ver mais resultados
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPriceRange([0, 50000])
                      setMinDiscount(0)
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-2">Descontos Exclusivos</h3>
              <p className="text-sm text-muted-foreground">
                Preços que você só encontra aqui, por tempo limitado
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-2">Tempo Limitado</h3>
              <p className="text-sm text-muted-foreground">
                As ofertas expiram rapidamente, não perca tempo
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-2">Estoque Limitado</h3>
              <p className="text-sm text-muted-foreground">
                Quantidades reduzidas, garanta o seu agora
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
