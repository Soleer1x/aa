'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Smartphone, Laptop, Gamepad2, Cpu, Mouse, Monitor, 
  Headphones, Cable, ArrowRight, Grid, List, Search,
  TrendingUp, Package, Filter, X, ChevronDown,
  Star, ShoppingCart, Heart, Eye, Sparkles, Crown,
  LayoutGrid, LayoutList, SlidersHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { ProductCard } from '@/components/product-card'
import { useCategoriesStore, useProductsStore, useCartStore, useWishlistStore } from '@/lib/store'
import { formatPrice } from '@/lib/data'

const iconMap: Record<string, any> = {
  'smartphone': Smartphone,
  'laptop': Laptop,
  'gamepad-2': Gamepad2,
  'cpu': Cpu,
  'mouse': Mouse,
  'monitor': Monitor,
  'headphones': Headphones,
  'cable': Cable,
}

const categoryImages: Record<string, string> = {
  'smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
  'notebooks': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
  'games': 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=600&fit=crop',
  'hardware': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&h=600&fit=crop',
  'perifericos': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=600&fit=crop',
  'monitores': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=600&fit=crop',
  'audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
  'acessorios': 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=800&h=600&fit=crop',
}

type SortOption = 'name' | 'products' | 'featured'

export default function CategoriesPage() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { getAllCategories, getFeaturedCategories } = useCategoriesStore()
  const { getProductsByCategory, getBestSellers, getAllProducts, getFlashSaleProducts } = useProductsStore()
  const { addItem } = useCartStore()
  const wishlist = useWishlistStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'cards'>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const categories = getAllCategories()
  const featuredCategories = getFeaturedCategories()
  const bestSellers = getBestSellers(8)
  const flashSaleProducts = getFlashSaleProducts()
  const allProducts = getAllProducts()

  const categoriesWithCount = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      productCount: getProductsByCategory(cat.name).length,
      image: categoryImages[cat.slug] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop'
    }))
  }, [categories, getProductsByCategory])

  const filteredCategories = useMemo(() => {
    let filtered = categoriesWithCount
    
    if (searchQuery) {
      filtered = filtered.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort categories
    switch (sortBy) {
      case 'name':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'products':
        filtered = [...filtered].sort((a, b) => b.productCount - a.productCount)
        break
      case 'featured':
        filtered = [...filtered].sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return b.productCount - a.productCount
        })
        break
    }

    return filtered
  }, [categoriesWithCount, searchQuery, sortBy])

  // Get products for selected category
  const selectedCategoryProducts = useMemo(() => {
    if (!selectedCategory) return []
    const cat = categories.find(c => c.slug === selectedCategory)
    if (!cat) return []
    return getProductsByCategory(cat.name)
  }, [selectedCategory, categories, getProductsByCategory])

  const stats = useMemo(() => ({
    totalCategories: categories.length,
    totalProducts: allProducts.length,
    flashSaleCount: flashSaleProducts.length,
    featuredCount: featuredCategories.length
  }), [categories, allProducts, flashSaleProducts, featuredCategories])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCartOpen={() => setIsCartOpen(true)} onSearch={() => {}} />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/20">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Explore por Categoria
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Encontre o Produto Perfeito
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Navegue por nossas {stats.totalCategories} categorias e descubra {stats.totalProducts} produtos incríveis
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border">
                  <Package className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                  <p className="text-xs text-muted-foreground">Produtos</p>
                </div>
                <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border">
                  <LayoutGrid className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.totalCategories}</p>
                  <p className="text-xs text-muted-foreground">Categorias</p>
                </div>
                <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border">
                  <TrendingUp className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.flashSaleCount}</p>
                  <p className="text-xs text-muted-foreground">Em Promoção</p>
                </div>
                <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border">
                  <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.featuredCount}</p>
                  <p className="text-xs text-muted-foreground">Em Destaque</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar categoria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-primary/10 border-primary/50' : ''}
              >
                <SlidersHorizontal className="w-4 h-4" />
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
                  <option value="featured">Em Destaque</option>
                  <option value="name">Nome A-Z</option>
                  <option value="products">Mais Produtos</option>
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
                  <List className="w-4 h-4" />
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
                  <h3 className="font-semibold">Filtros Rápidos</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={sortBy === 'featured' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('featured')}
                  >
                    <Crown className="w-4 h-4 mr-1" />
                    Em Destaque
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const catWithProducts = filteredCategories.find(c => c.productCount > 0)
                      if (catWithProducts) setSelectedCategory(catWithProducts.slug)
                    }}
                  >
                    <Package className="w-4 h-4 mr-1" />
                    Com Produtos
                  </Button>
                  {searchQuery && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                    >
                      Limpar busca
                      <X className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Featured Categories Banner */}
          {featuredCategories.length > 0 && !searchQuery && viewMode === 'cards' && (
            <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Categorias em Destaque</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {featuredCategories.map((category) => {
                  const IconComponent = iconMap[category.icon] || Cable
                  const count = getProductsByCategory(category.name).length
                  return (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="flex items-center gap-3 px-4 py-3 bg-background rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all min-w-max group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{count} produtos</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Categories Display */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category, index) => {
                const IconComponent = iconMap[category.icon] || Cable
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/category/${category.slug}`}>
                      <div className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                        {/* Category Image */}
                        <div className="relative h-40 overflow-hidden">
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-white text-lg">{category.name}</h3>
                                <p className="text-white/80 text-sm">
                                  {category.productCount} {category.productCount === 1 ? 'produto' : 'produtos'}
                                </p>
                              </div>
                            </div>
                          </div>
                          {category.featured && (
                            <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-yellow-950 text-xs font-bold rounded-full flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              Destaque
                            </div>
                          )}
                        </div>

                        {/* Category Info */}
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {category.description || `Explore nossa seleção completa de ${category.name.toLowerCase()} com os melhores preços`}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                              Ver produtos
                              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                            {category.productCount > 0 && (
                              <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded">
                                Em estoque
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCategories.map((category, index) => {
                const IconComponent = iconMap[category.icon] || Cable
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/category/${category.slug}`}>
                      <div className="group bg-card rounded-2xl border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-center">
                        <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                          <IconComponent className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {category.productCount} {category.productCount === 1 ? 'produto' : 'produtos'}
                        </p>
                        <div className="flex items-center justify-center text-primary text-sm font-medium">
                          Ver produtos
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-3">
              {filteredCategories.map((category, index) => {
                const IconComponent = iconMap[category.icon] || Cable
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/category/${category.slug}`}>
                      <div className="group flex items-center gap-4 bg-card rounded-xl border border-border p-4 hover:border-primary/50 hover:shadow-lg transition-all">
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold group-hover:text-primary transition-colors">{category.name}</h3>
                            {category.featured && (
                              <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded-full flex items-center gap-1">
                                <Crown className="w-3 h-3" />
                                Destaque
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {category.description || `Explore nossa seleção de ${category.name.toLowerCase()}`}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-primary text-lg">{category.productCount}</p>
                          <p className="text-xs text-muted-foreground">produtos</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}

          {filteredCategories.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma categoria encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `Não encontramos categorias para "${searchQuery}"`
                  : 'Nenhuma categoria disponível no momento'}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Limpar busca
                </Button>
              )}
            </div>
          )}

          {/* Best Sellers Section */}
          {bestSellers.length > 0 && !searchQuery && (
            <section className="mt-16 pt-8 border-t border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Mais Vendidos</h2>
                  <p className="text-sm text-muted-foreground">Os produtos mais populares do momento</p>
                </div>
                <Link href="/search?sort=bestseller">
                  <Button variant="outline">
                    Ver todos
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {bestSellers.slice(0, 4).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </section>
          )}

          {/* Quick Category Preview Modal */}
          <AnimatePresence>
            {selectedCategory && selectedCategoryProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedCategory(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-card rounded-2xl border border-border max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                >
                  <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                    <h3 className="text-xl font-bold">
                      {categories.find(c => c.slug === selectedCategory)?.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Link href={`/category/${selectedCategory}`}>
                        <Button size="sm">
                          Ver todos
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(null)}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedCategoryProducts.slice(0, 6).map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
