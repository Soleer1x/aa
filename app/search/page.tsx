'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, SlidersHorizontal, X, ChevronDown, Star, 
  Grid, List, Package, Filter, ArrowUpDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { CartDrawer } from '@/components/cart-drawer'
import { 
  useProductsStore, useCategoriesStore, useAuthStore,
  useSearchHistoryStore, ProductFilter
} from '@/lib/store'
import { formatPrice, sortOptions } from '@/lib/data'

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeQuery, setActiveQuery] = useState(initialQuery)
  
  const { user } = useAuthStore()
  const { filterProducts, getBrands, getPriceRange, searchProducts } = useProductsStore()
  const { getAllCategories } = useCategoriesStore()
  const { addSearch, getUserHistory, getPopularSearches } = useSearchHistoryStore()

  const categories = getAllCategories()
  const brands = getBrands()
  const [minPrice, maxPrice] = getPriceRange()
  
  const searchHistory = user ? getUserHistory(user.id) : []
  const popularSearches = getPopularSearches()

  const [filter, setFilter] = useState<ProductFilter>({
    categories: [],
    brands: [],
    priceRange: [minPrice, maxPrice],
    rating: 0,
    inStock: false,
    onSale: false,
    sortBy: 'relevance',
  })

  // Update price range when products change
  useEffect(() => {
    setFilter(prev => ({
      ...prev,
      priceRange: [minPrice, maxPrice]
    }))
  }, [minPrice, maxPrice])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery)
      if (user) {
        addSearch(user.id, searchQuery)
      }
    }
  }

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query)
    setActiveQuery(query)
    if (user) {
      addSearch(user.id, query)
    }
  }

  const filteredProducts = useMemo(() => {
    let products = activeQuery ? searchProducts(activeQuery) : filterProducts(filter)
    
    // Apply additional filters to search results
    if (activeQuery) {
      if (filter.categories.length > 0) {
        products = products.filter(p => 
          filter.categories.some(cat => 
            p.category.toLowerCase().includes(cat.toLowerCase())
          )
        )
      }
      if (filter.brands.length > 0) {
        products = products.filter(p => 
          filter.brands.includes(p.brand)
        )
      }
      if (filter.rating > 0) {
        products = products.filter(p => p.rating >= filter.rating)
      }
      if (filter.inStock) {
        products = products.filter(p => p.stock > 0)
      }
      if (filter.onSale) {
        products = products.filter(p => p.discount || p.originalPrice || p.isFlashSale)
      }
      const [min, max] = filter.priceRange
      products = products.filter(p => {
        const price = p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price
        return price >= min && price <= max
      })

      // Sort
      switch (filter.sortBy) {
        case 'price_asc':
          products.sort((a, b) => {
            const priceA = a.isFlashSale && a.flashSalePrice ? a.flashSalePrice : a.price
            const priceB = b.isFlashSale && b.flashSalePrice ? b.flashSalePrice : b.price
            return priceA - priceB
          })
          break
        case 'price_desc':
          products.sort((a, b) => {
            const priceA = a.isFlashSale && a.flashSalePrice ? a.flashSalePrice : a.price
            const priceB = b.isFlashSale && b.flashSalePrice ? b.flashSalePrice : b.price
            return priceB - priceA
          })
          break
        case 'rating':
          products.sort((a, b) => b.rating - a.rating)
          break
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          break
        case 'bestseller':
          products.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
          break
      }
    }

    return products
  }, [activeQuery, filter, searchProducts, filterProducts])

  const toggleCategory = (categorySlug: string) => {
    setFilter(prev => ({
      ...prev,
      categories: prev.categories.includes(categorySlug)
        ? prev.categories.filter(c => c !== categorySlug)
        : [...prev.categories, categorySlug]
    }))
  }

  const toggleBrand = (brand: string) => {
    setFilter(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }))
  }

  const clearFilters = () => {
    setFilter({
      categories: [],
      brands: [],
      priceRange: [minPrice, maxPrice],
      rating: 0,
      inStock: false,
      onSale: false,
      sortBy: 'relevance',
    })
  }

  const hasActiveFilters = filter.categories.length > 0 || 
    filter.brands.length > 0 || 
    filter.rating > 0 || 
    filter.inStock || 
    filter.onSale ||
    filter.priceRange[0] !== minPrice ||
    filter.priceRange[1] !== maxPrice

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCartOpen={() => setIsCartOpen(true)} onSearch={handleQuickSearch} />
      
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar produtos, marcas, categorias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-24 h-14 text-lg bg-card border-border focus:border-primary rounded-xl"
              />
              <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 gradient-primary">
                Buscar
              </Button>
            </form>

            {/* Quick Searches */}
            {!activeQuery && (
              <div className="mt-6 max-w-2xl mx-auto">
                {searchHistory.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Buscas recentes</p>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleQuickSearch(item.query)}
                          className="px-3 py-1.5 bg-secondary rounded-full text-sm hover:bg-secondary/80 transition-colors"
                        >
                          {item.query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {popularSearches.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Buscas populares</p>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((query) => (
                        <button
                          key={query}
                          onClick={() => handleQuickSearch(query)}
                          className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Header */}
          {activeQuery && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">
                  Resultados para &quot;{activeQuery}&quot;
                </h1>
                <p className="text-muted-foreground">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtros
                  {hasActiveFilters && (
                    <span className="ml-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {filter.categories.length + filter.brands.length + (filter.inStock ? 1 : 0) + (filter.onSale ? 1 : 0)}
                    </span>
                  )}
                </Button>
                <select
                  value={filter.sortBy}
                  onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value as ProductFilter['sortBy'] }))}
                  className="h-10 px-3 rounded-lg border border-border bg-card text-sm"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <div className="hidden md:flex items-center gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-8">
            {/* Filters Sidebar - Desktop */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtros
                  </h2>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Limpar
                    </Button>
                  )}
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Categorias</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map(category => (
                      <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={filter.categories.includes(category.slug)}
                          onCheckedChange={() => toggleCategory(category.slug)}
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                {brands.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Marcas</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {brands.map(brand => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={filter.brands.includes(brand)}
                            onCheckedChange={() => toggleBrand(brand)}
                          />
                          <span className="text-sm">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Preco</h3>
                  <div className="px-2">
                    <Slider
                      min={minPrice}
                      max={maxPrice}
                      step={10}
                      value={filter.priceRange}
                      onValueChange={(value) => setFilter(prev => ({ ...prev, priceRange: value as [number, number] }))}
                      className="mb-3"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatPrice(filter.priceRange[0])}</span>
                      <span>{formatPrice(filter.priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Avaliacao minima</h3>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setFilter(prev => ({ ...prev, rating: prev.rating === star ? 0 : star }))}
                        className="p-1"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= filter.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Other Filters */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filter.inStock}
                      onCheckedChange={(checked) => setFilter(prev => ({ ...prev, inStock: !!checked }))}
                    />
                    <span className="text-sm">Apenas em estoque</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filter.onSale}
                      onCheckedChange={(checked) => setFilter(prev => ({ ...prev, onSale: !!checked }))}
                    />
                    <span className="text-sm">Apenas em promocao</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Mobile Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 md:hidden"
                >
                  <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    className="absolute left-0 top-0 bottom-0 w-80 bg-background p-6 overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-semibold text-lg">Filtros</h2>
                      <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    {/* Copy of desktop filters */}
                    <div className="mb-6">
                      <h3 className="font-medium mb-3">Categorias</h3>
                      <div className="space-y-2">
                        {categories.map(category => (
                          <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={filter.categories.includes(category.slug)}
                              onCheckedChange={() => toggleCategory(category.slug)}
                            />
                            <span className="text-sm">{category.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {brands.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-medium mb-3">Marcas</h3>
                        <div className="space-y-2">
                          {brands.map(brand => (
                            <label key={brand} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={filter.brands.includes(brand)}
                                onCheckedChange={() => toggleBrand(brand)}
                              />
                              <span className="text-sm">{brand}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="font-medium mb-3">Preco</h3>
                      <div className="px-2">
                        <Slider
                          min={minPrice}
                          max={maxPrice}
                          step={10}
                          value={filter.priceRange}
                          onValueChange={(value) => setFilter(prev => ({ ...prev, priceRange: value as [number, number] }))}
                          className="mb-3"
                        />
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{formatPrice(filter.priceRange[0])}</span>
                          <span>{formatPrice(filter.priceRange[1])}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={filter.inStock}
                          onCheckedChange={(checked) => setFilter(prev => ({ ...prev, inStock: !!checked }))}
                        />
                        <span className="text-sm">Apenas em estoque</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={filter.onSale}
                          onCheckedChange={(checked) => setFilter(prev => ({ ...prev, onSale: !!checked }))}
                        />
                        <span className="text-sm">Apenas em promocao</span>
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={clearFilters} className="flex-1">
                        Limpar
                      </Button>
                      <Button onClick={() => setShowFilters(false)} className="flex-1 gradient-primary">
                        Aplicar
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h2 className="text-2xl font-bold mb-2">Nenhum produto encontrado</h2>
                  <p className="text-muted-foreground mb-6">
                    {activeQuery 
                      ? `Nao encontramos resultados para "${activeQuery}"` 
                      : 'Tente ajustar os filtros ou buscar por outro termo'}
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={clearFilters} variant="outline">
                      Limpar filtros
                    </Button>
                  )}
                </motion.div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-all"
                    >
                      <Link href={`/product/${product.id}`} className="flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${product.id}`}>
                          <h3 className="font-semibold hover:text-primary transition-colors">{product.name}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">{product.brand} | {product.category}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= product.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({product.reviews})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price)}
                        </p>
                        {(product.originalPrice || product.isFlashSale) && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.isFlashSale ? product.price : product.originalPrice!)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
