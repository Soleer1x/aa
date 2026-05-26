'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Scale, X, Plus, ShoppingCart, Heart, Star, ArrowRight,
  Check, Minus, Package, Trash2, ArrowLeft, Share2, 
  ChevronDown, ChevronUp, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { 
  useComparisonStore, 
  useCartStore, 
  useWishlistStore, 
  useProductsStore,
  Product 
} from '@/lib/store'
import { formatPrice } from '@/lib/data'

export default function ComparePage() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [expandedSpecs, setExpandedSpecs] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  const { products, removeProduct, clearComparison, addProduct, canAddMore } = useComparisonStore()
  const { addItem } = useCartStore()
  const wishlist = useWishlistStore()
  const { getAllProducts } = useProductsStore()
  
  const allProducts = getAllProducts()
  
  // Get products not in comparison for adding
  const availableProducts = allProducts.filter(p => 
    !products.some(cp => cp.id === p.id) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get all unique spec keys from compared products
  const allSpecKeys = Array.from(new Set(
    products.flatMap(p => Object.keys(p.specs || {}))
  ))

  const handleAddToCart = (product: Product) => {
    addItem(product)
    setIsCartOpen(true)
  }

  const handleToggleWishlist = (product: Product) => {
    if (wishlist.isInWishlist(product.id)) {
      wishlist.removeItem(product.id)
    } else {
      wishlist.addItem(product)
    }
  }

  const handleShare = () => {
    const productNames = products.map(p => p.name).join(', ')
    navigator.clipboard.writeText(`Comparando: ${productNames} - Soleer Hub`)
    alert('Link copiado para a área de transferência!')
  }

  // Find best values for comparison
  const getBestValue = (key: string, type: 'highest' | 'lowest' = 'highest') => {
    if (products.length < 2) return null
    
    const values = products.map(p => {
      if (key === 'price') return p.flashSalePrice || p.price
      if (key === 'rating') return p.rating
      return null
    }).filter(v => v !== null) as number[]
    
    if (values.length === 0) return null
    return type === 'highest' ? Math.max(...values) : Math.min(...values)
  }

  const bestPrice = getBestValue('price', 'lowest')
  const bestRating = getBestValue('rating', 'highest')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCartOpen={() => setIsCartOpen(true)} onSearch={() => {}} />
      
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Scale className="w-6 h-6 text-primary" />
                  <h1 className="text-2xl font-bold">Comparar Produtos</h1>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  {products.length} de 4 produtos selecionados
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {products.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearComparison}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                </>
              )}
              {canAddMore() && (
                <Button onClick={() => setShowAddProduct(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto
                </Button>
              )}
            </div>
          </div>

          {products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <Scale className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Nenhum produto para comparar</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Adicione produtos à comparação para ver suas especificações lado a lado e escolher o melhor para você.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button onClick={() => setShowAddProduct(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produtos
                </Button>
                <Link href="/">
                  <Button variant="outline">
                    Ver Produtos
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                {/* Product Cards Row */}
                <thead>
                  <tr>
                    <th className="p-4 text-left w-48 align-top sticky left-0 bg-background z-10">
                      <span className="text-sm font-medium text-muted-foreground">Produto</span>
                    </th>
                    {products.map((product, index) => {
                      const isInWishlist = wishlist.isInWishlist(product.id)
                      const price = product.flashSalePrice || product.price
                      const isBestPrice = price === bestPrice
                      
                      return (
                        <th key={product.id} className="p-4 align-top min-w-[220px]">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative bg-card rounded-xl border p-4 ${
                              isBestPrice ? 'border-green-500 shadow-lg shadow-green-500/10' : 'border-border'
                            }`}
                          >
                            {isBestPrice && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                Melhor Preço
                              </div>
                            )}
                            
                            <button
                              onClick={() => removeProduct(product.id)}
                              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-secondary hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            <Link href={`/product/${product.id}`}>
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full aspect-square object-cover rounded-lg mb-4"
                              />
                            </Link>

                            <Link href={`/product/${product.id}`}>
                              <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors mb-2">
                                {product.name}
                              </h3>
                            </Link>

                            <p className="text-xs text-muted-foreground mb-2">
                              {product.brand}
                            </p>

                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-xl font-bold text-primary">
                                {formatPrice(price)}
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleAddToCart(product)}
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleWishlist(product)}
                                className={isInWishlist ? 'text-red-500' : ''}
                              >
                                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                              </Button>
                              <Link href={`/product/${product.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </motion.div>
                        </th>
                      )
                    })}
                    {/* Empty slots */}
                    {[...Array(4 - products.length)].map((_, i) => (
                      <th key={`empty-${i}`} className="p-4 align-top min-w-[220px]">
                        <button
                          onClick={() => setShowAddProduct(true)}
                          className="w-full aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors"
                        >
                          <Plus className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Adicionar</span>
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {/* Rating Row */}
                  <tr className="border-t border-border">
                    <td className="p-4 sticky left-0 bg-background">
                      <span className="font-medium">Avaliação</span>
                    </td>
                    {products.map((product) => {
                      const isBestRating = product.rating === bestRating
                      return (
                        <td key={product.id} className="p-4 text-center">
                          <div className={`inline-flex items-center gap-1 ${isBestRating ? 'text-yellow-500' : ''}`}>
                            <Star className={`w-5 h-5 ${isBestRating ? 'fill-yellow-400' : 'fill-muted'}`} />
                            <span className="font-bold">{product.rating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">
                              ({product.reviews})
                            </span>
                          </div>
                          {isBestRating && products.length > 1 && (
                            <p className="text-xs text-green-500 mt-1">Melhor avaliado</p>
                          )}
                        </td>
                      )
                    })}
                    {[...Array(4 - products.length)].map((_, i) => (
                      <td key={`empty-rating-${i}`} className="p-4 text-center text-muted-foreground">-</td>
                    ))}
                  </tr>

                  {/* Category Row */}
                  <tr className="border-t border-border bg-secondary/30">
                    <td className="p-4 sticky left-0 bg-secondary/30">
                      <span className="font-medium">Categoria</span>
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="p-4 text-center">
                        {product.category}
                      </td>
                    ))}
                    {[...Array(4 - products.length)].map((_, i) => (
                      <td key={`empty-cat-${i}`} className="p-4 text-center text-muted-foreground">-</td>
                    ))}
                  </tr>

                  {/* Stock Row */}
                  <tr className="border-t border-border">
                    <td className="p-4 sticky left-0 bg-background">
                      <span className="font-medium">Estoque</span>
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="p-4 text-center">
                        {product.stock > 10 ? (
                          <span className="text-green-500 flex items-center justify-center gap-1">
                            <Check className="w-4 h-4" />
                            Em estoque ({product.stock})
                          </span>
                        ) : product.stock > 0 ? (
                          <span className="text-yellow-500">
                            Últimas {product.stock} unidades
                          </span>
                        ) : (
                          <span className="text-red-500">Esgotado</span>
                        )}
                      </td>
                    ))}
                    {[...Array(4 - products.length)].map((_, i) => (
                      <td key={`empty-stock-${i}`} className="p-4 text-center text-muted-foreground">-</td>
                    ))}
                  </tr>

                  {/* Specs Section */}
                  {allSpecKeys.length > 0 && (
                    <>
                      <tr className="border-t border-border bg-secondary/50">
                        <td 
                          colSpan={5} 
                          className="p-4 cursor-pointer"
                          onClick={() => setExpandedSpecs(!expandedSpecs)}
                        >
                          <div className="flex items-center gap-2">
                            {expandedSpecs ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                            <span className="font-semibold">Especificações Técnicas</span>
                          </div>
                        </td>
                      </tr>
                      
                      <AnimatePresence>
                        {expandedSpecs && allSpecKeys.map((specKey, index) => (
                          <motion.tr
                            key={specKey}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={index % 2 === 0 ? 'bg-secondary/20' : ''}
                          >
                            <td className="p-4 sticky left-0 bg-background">
                              <span className="font-medium capitalize">
                                {specKey.replace(/_/g, ' ')}
                              </span>
                            </td>
                            {products.map((product) => (
                              <td key={product.id} className="p-4 text-center">
                                {product.specs?.[specKey] || (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            ))}
                            {[...Array(4 - products.length)].map((_, i) => (
                              <td key={`empty-spec-${specKey}-${i}`} className="p-4 text-center text-muted-foreground">-</td>
                            ))}
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddProduct(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Adicionar Produto</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowAddProduct(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full mt-4 px-4 py-2 bg-secondary rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {availableProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchQuery 
                        ? 'Nenhum produto encontrado'
                        : 'Todos os produtos já foram adicionados'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {availableProducts.slice(0, 12).map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          addProduct(product)
                          if (!canAddMore()) setShowAddProduct(false)
                        }}
                        className="bg-secondary/50 rounded-xl p-3 text-left hover:bg-secondary transition-colors"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full aspect-square object-cover rounded-lg mb-2"
                        />
                        <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                        <p className="text-primary font-bold text-sm mt-1">
                          {formatPrice(product.flashSalePrice || product.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
