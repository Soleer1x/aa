'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, Trash2, ShoppingCart, ArrowRight, Share2, 
  Package, Grid, List, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { useWishlistStore, useCartStore, useAuthStore } from '@/lib/store'
import { formatPrice } from '@/lib/data'

export default function WishlistPage() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const handleAddToCart = (item: typeof items[0]) => {
    const cartProduct = item.isFlashSale && item.flashSalePrice 
      ? { ...item, price: item.flashSalePrice }
      : item
    addItem(cartProduct)
    setIsCartOpen(true)
  }

  const handleAddAllToCart = () => {
    items.forEach(item => {
      const cartProduct = item.isFlashSale && item.flashSalePrice 
        ? { ...item, price: item.flashSalePrice }
        : item
      addItem(cartProduct)
    })
    setIsCartOpen(true)
  }

  const handleShareWishlist = () => {
    const shareText = `Minha lista de desejos:\n${items.map(i => `- ${i.name}`).join('\n')}`
    if (navigator.share) {
      navigator.share({
        title: 'Minha Lista de Desejos - Soleer Hub',
        text: shareText,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Lista copiada para a área de transferência!')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCartOpen={() => setIsCartOpen(true)} onSearch={() => {}} />
      
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Heart className="w-8 h-8 text-primary fill-primary" />
                Lista de Desejos
              </h1>
              <p className="text-muted-foreground mt-1">
                {items.length} {items.length === 1 ? 'item salvo' : 'itens salvos'}
              </p>
            </div>
            <div className="flex items-center gap-2">
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
              {items.length > 0 && (
                <>
                  <Button variant="outline" onClick={handleShareWishlist}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button variant="destructive" onClick={clearWishlist}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Lista
                  </Button>
                </>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sua lista de desejos esta vazia</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Adicione produtos que voce gosta clicando no icone de coracao em cada produto
              </p>
              <Link href="/">
                <Button className="gradient-primary">
                  Explorar Produtos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Action Bar */}
              <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-xl border border-border">
                <p className="text-sm text-muted-foreground">
                  Total estimado: <span className="font-bold text-foreground">
                    {formatPrice(items.reduce((sum, item) => {
                      const price = item.isFlashSale && item.flashSalePrice ? item.flashSalePrice : item.price
                      return sum + price
                    }, 0))}
                  </span>
                </p>
                <Button className="gradient-primary" onClick={handleAddAllToCart}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Adicionar Todos ao Carrinho
                </Button>
              </div>

              {/* Items Grid/List */}
              <AnimatePresence>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all"
                      >
                        <div className="relative aspect-square">
                          <Link href={`/product/${item.id}`}>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-destructive/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {item.isFlashSale && (
                            <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-lg">
                              Flash Sale
                            </div>
                          )}
                          {item.stock === 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="bg-destructive text-white px-3 py-1 rounded-full text-sm font-medium">
                                Indisponivel
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <Link href={`/product/${item.id}`}>
                            <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">{item.brand}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(item.isFlashSale && item.flashSalePrice ? item.flashSalePrice : item.price)}
                            </span>
                            {(item.originalPrice || item.isFlashSale) && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(item.isFlashSale ? item.price : item.originalPrice!)}
                              </span>
                            )}
                          </div>
                          <Button
                            className="w-full mt-3"
                            size="sm"
                            onClick={() => handleAddToCart(item)}
                            disabled={item.stock === 0}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-all"
                      >
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Link href={`/product/${item.id}`}>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </Link>
                          {item.stock === 0 && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-medium">Esgotado</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${item.id}`}>
                            <h3 className="font-semibold hover:text-primary transition-colors">{item.name}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">{item.brand} | {item.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(item.isFlashSale && item.flashSalePrice ? item.flashSalePrice : item.price)}
                            </span>
                            {(item.originalPrice || item.isFlashSale) && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(item.isFlashSale ? item.price : item.originalPrice!)}
                              </span>
                            )}
                            {item.isFlashSale && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full">
                                Flash Sale
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleAddToCart(item)}
                            disabled={item.stock === 0}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </main>

      <Footer />
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
