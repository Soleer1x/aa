'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, SlidersHorizontal, Grid, List, 
  Star, ArrowUpDown, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useCategoriesStore, useProductsStore } from '@/lib/store'
import { brands, formatPrice } from '@/lib/data'

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest'

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const { getCategoryBySlug } = useCategoriesStore()
  const { getProductsByCategory, getAllProducts } = useProductsStore()
  
  const category = getCategoryBySlug(slug)
  const allProducts = getAllProducts()
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    brands: [] as string[],
    minRating: 0,
    inStock: false,
  })

  const categoryProducts = useMemo(() => {
    if (!category) return []
    return allProducts.filter(p => 
      p.category.toLowerCase() === category.name.toLowerCase()
    )
  }, [category, allProducts])

  const filteredProducts = useMemo(() => {
    let products = [...categoryProducts]
    
    // Apply filters
    if (filters.minPrice) {
      products = products.filter(p => p.price >= parseFloat(filters.minPrice))
    }
    if (filters.maxPrice) {
      products = products.filter(p => p.price <= parseFloat(filters.maxPrice))
    }
    if (filters.brands.length > 0) {
      products = products.filter(p => filters.brands.includes(p.brand))
    }
    if (filters.minRating > 0) {
      products = products.filter(p => p.rating >= filters.minRating)
    }
    if (filters.inStock) {
      products = products.filter(p => p.stock > 0)
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        products.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        products.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      default:
        // relevance - featured first, then by sales
        products.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return (b.soldCount || 0) - (a.soldCount || 0)
        })
    }

    return products
  }, [categoryProducts, filters, sortBy])

  const toggleBrand = (brand: string) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }))
  }

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      brands: [],
      minRating: 0,
      inStock: false,
    })
  }

  const hasActiveFilters = filters.minPrice || filters.maxPrice || 
    filters.brands.length > 0 || filters.minRating > 0 || filters.inStock

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Categoria nao encontrada</h1>
            <p className="text-muted-foreground mb-4">A categoria que voce procura nao existe</p>
            <Link href="/categories">
              <Button>Ver todas as categorias</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const availableBrands = [...new Set(categoryProducts.map(p => p.brand))]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Inicio
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/categories" className="text-muted-foreground hover:text-foreground">
              Categorias
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{category.name}</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <p className="text-muted-foreground mt-1">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-10 px-3 rounded-lg bg-secondary border border-border text-sm"
              >
                <option value="relevance">Relevancia</option>
                <option value="price-asc">Menor preco</option>
                <option value="price-desc">Maior preco</option>
                <option value="rating">Melhor avaliacao</option>
                <option value="newest">Mais recentes</option>
              </select>
              <div className="flex items-center gap-1">
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

          <div className="flex gap-6">
            {/* Filters Sidebar */}
            <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-black/50 md:relative md:bg-transparent' : 'hidden'} md:block md:w-64 flex-shrink-0`}>
              <div className={`${showFilters ? 'absolute right-0 top-0 bottom-0 w-80 bg-card p-6 overflow-y-auto' : ''} md:relative md:w-full md:p-0`}>
                <div className="flex items-center justify-between mb-6 md:hidden">
                  <h3 className="font-semibold">Filtros</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Price Range */}
                  <div className="bg-card rounded-xl border border-border p-4 md:bg-transparent md:border-0 md:p-0">
                    <h3 className="font-semibold mb-3">Faixa de Preco</h3>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        className="h-10"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Brands */}
                  {availableBrands.length > 0 && (
                    <div className="bg-card rounded-xl border border-border p-4 md:bg-transparent md:border-0 md:p-0">
                      <h3 className="font-semibold mb-3">Marcas</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {availableBrands.map((brand) => (
                          <label key={brand} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.brands.includes(brand)}
                              onChange={() => toggleBrand(brand)}
                              className="w-4 h-4 rounded accent-primary"
                            />
                            <span className="text-sm">{brand}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="bg-card rounded-xl border border-border p-4 md:bg-transparent md:border-0 md:p-0">
                    <h3 className="font-semibold mb-3">Avaliacao Minima</h3>
                    <div className="space-y-2">
                      {[4, 3, 2, 1].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setFilters({ ...filters, minRating: filters.minRating === rating ? 0 : rating })}
                          className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors ${
                            filters.minRating === rating ? 'bg-primary/10' : 'hover:bg-secondary'
                          }`}
                        >
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm">ou mais</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* In Stock */}
                  <div className="bg-card rounded-xl border border-border p-4 md:bg-transparent md:border-0 md:p-0">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                        className="w-4 h-4 rounded accent-primary"
                      />
                      <span className="text-sm font-medium">Apenas em estoque</span>
                    </label>
                  </div>

                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      Limpar filtros
                    </Button>
                  )}
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <p className="text-muted-foreground mb-4">Nenhum produto encontrado com esses filtros</p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Limpar filtros
                    </Button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Link href={`/product/${product.id}`}>
                        <div className="flex gap-4 bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-all">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{product.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                ({product.reviews} avaliacoes)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                              <span className="text-lg font-bold text-primary">
                                {formatPrice(product.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
