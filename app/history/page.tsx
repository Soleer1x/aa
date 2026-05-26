'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, Trash2, ArrowLeft, Clock, Eye, ShoppingCart, 
  Heart, Scale, Bell, BellOff, X, Package, ArrowRight, Truck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { ProductCard } from '@/components/product-card'
import { 
  useRecentlyViewedStore, 
  useCartStore, 
  useWishlistStore, 
  useComparisonStore,
  usePriceAlertStore,
  useAuthStore,
  useOrdersStore,
  Product 
} from '@/lib/store'
import { formatPrice, formatRelativeTime, formatDate } from '@/lib/data'


export default function HistoryPage() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'orders' | 'viewed' | 'alerts'>('orders')
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [targetPrice, setTargetPrice] = useState('')
  
  const { products, clearHistory } = useRecentlyViewedStore()
  const { getUserOrders } = useOrdersStore()
  const { addItem } = useCartStore()
  const wishlist = useWishlistStore()
  const comparison = useComparisonStore()
  const { alerts, addAlert, removeAlert, getUserAlerts } = usePriceAlertStore()
  const { user, isAuthenticated } = useAuthStore()

  const userAlerts = isAuthenticated && user ? getUserAlerts(user.id) : []

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

  const handleAddToComparison = (product: Product) => {
    if (comparison.isInComparison(product.id)) {
      comparison.removeProduct(product.id)
    } else {
      comparison.addProduct(product)
    }
  }

  const handleCreateAlert = () => {
    if (!selectedProduct || !user || !targetPrice) return
    
    const price = parseFloat(targetPrice)
    if (isNaN(price) || price <= 0) return
    
    addAlert(
      user.id, 
      selectedProduct.id, 
      selectedProduct.name, 
      price, 
      selectedProduct.flashSalePrice || selectedProduct.price
    )
    
    setShowAlertModal(false)
    setSelectedProduct(null)
    setTargetPrice('')
  }

  const openAlertModal = (product: Product) => {
    setSelectedProduct(product)
    setTargetPrice(((product.flashSalePrice || product.price) * 0.9).toFixed(2))
    setShowAlertModal(true)
  }

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
                  <History className="w-6 h-6 text-primary" />
                  <h1 className="text-2xl font-bold">Histórico</h1>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Produtos visualizados e alertas de preço
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-border overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'orders' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Meus Pedidos
            </button>
            <button
              onClick={() => setActiveTab('viewed')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'viewed' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Visualizados ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('alerts')} 
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'alerts' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bell className="w-4 h-4 inline mr-2" />
              Alertas de Preço ({userAlerts.filter(a => a.active).length})
            </button>
          </div>

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              {!isAuthenticated ? (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Faça login para ver seus pedidos</h3>
                  <Link href="/profile"><Button>Entrar</Button></Link>
                </div>
              ) : (() => {
                const orders = user ? getUserOrders(user.id) : []
                const sortedOrders = [...orders].reverse()
                return sortedOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Você ainda não fez nenhum pedido</h3>
                    <Link href="/"><Button>Explorar Produtos</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedOrders.map((order) => (
                      <div key={order.id} className="bg-card rounded-xl border border-border p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div>
                            <p className="font-bold text-lg">Pedido #{order.id}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                              order.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                              order.status === 'shipped' ? 'bg-blue-500/10 text-blue-500' :
                              order.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500' :
                              order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                              'bg-gray-500/10 text-gray-500'
                            }`}>
                              {order.status === 'completed' ? 'Entregue' :
                               order.status === 'shipped' ? 'Enviado' :
                               order.status === 'processing' ? 'Processando' :
                               order.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                            </span>
                            <Link href={`/tracking/${order.id}`}>
                              <Button size="sm" variant="outline">
                                <Truck className="w-4 h-4 mr-1" /> Rastrear
                              </Button>
                            </Link>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {order.items.slice(0, 3).map(item => (
                            <div key={item.product.id} className="flex items-center gap-2">
                              <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded-lg" />
                              <div>
                                <p className="text-sm font-medium line-clamp-1 max-w-[120px]">{item.product.name}</p>
                                <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="flex items-center text-sm text-muted-foreground">+{order.items.length - 3} mais</div>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-border flex justify-between">
                          <span className="text-muted-foreground text-sm">
                            {order.paymentMethod === 'pix' ? 'PIX' : order.paymentMethod === 'boleto' ? 'Boleto' : 'Cartão'}
                          </span>
                          <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}

          {/* Recently Viewed Tab */}
          {activeTab === 'viewed' && (
            <>
              {products.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                    <Eye className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Nenhum produto visualizado</h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Os produtos que você visualizar aparecerão aqui para fácil acesso.
                  </p>
                  <Link href="/">
                    <Button>
                      Explorar Produtos
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <>
                  <div className="flex justify-end mb-4">
                    <Button variant="outline" size="sm" onClick={clearHistory}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpar Histórico
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {products.map((product, index) => {
                      const isInWishlist = wishlist.isInWishlist(product.id)
                      const isInComparison = comparison.isInComparison(product.id)
                      const price = product.flashSalePrice || product.price
                      
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
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
                              <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {product.category} • {product.brand}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-lg font-bold text-primary">
                                {formatPrice(price)}
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openAlertModal(product)}
                              title="Criar alerta de preço"
                            >
                              <Bell className="w-5 h-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAddToComparison(product)}
                              className={isInComparison ? 'text-primary' : ''}
                              title="Adicionar à comparação"
                            >
                              <Scale className={`w-5 h-5 ${isInComparison ? 'fill-primary/20' : ''}`} />
                            </Button>
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
                              onClick={() => handleAddToCart(product)}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Comprar
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* Price Alerts Tab */}
          {activeTab === 'alerts' && (
            <>
              {!isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                    <Bell className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Faça login para usar alertas</h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Crie alertas de preço para ser notificado quando produtos atingirem o preço desejado.
                  </p>
                  <Link href="/">
                    <Button>
                      Fazer Login
                    </Button>
                  </Link>
                </motion.div>
              ) : userAlerts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                    <Bell className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Nenhum alerta de preço</h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Crie alertas para ser notificado quando os produtos atingirem o preço desejado.
                  </p>
                  <Link href="/">
                    <Button>
                      Explorar Produtos
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {userAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-card rounded-xl border p-4 ${
                        alert.active ? 'border-border' : 'border-green-500 bg-green-500/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            alert.active ? 'bg-primary/10' : 'bg-green-500/10'
                          }`}>
                            {alert.active ? (
                              <Bell className="w-6 h-6 text-primary" />
                            ) : (
                              <BellOff className="w-6 h-6 text-green-500" />
                            )}
                          </div>
                          <div>
                            <Link href={`/product/${alert.productId}`}>
                              <h3 className="font-semibold hover:text-primary transition-colors">
                                {alert.productName}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Preço atual: {formatPrice(alert.currentPrice)}</span>
                              <span>•</span>
                              <span className="text-primary font-medium">
                                Alerta: {formatPrice(alert.targetPrice)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Criado {formatRelativeTime(alert.createdAt)}
                              {alert.triggeredAt && ` • Disparado ${formatRelativeTime(alert.triggeredAt)}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {alert.active ? (
                            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                              Ativo
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-sm font-medium rounded-full">
                              Disparado!
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAlert(alert.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Create Alert Modal */}
      <AnimatePresence>
        {showAlertModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAlertModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Criar Alerta de Preço</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowAlertModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4 mb-6 p-4 bg-secondary/50 rounded-xl">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-medium line-clamp-2">{selectedProduct.name}</h3>
                  <p className="text-primary font-bold">
                    Preço atual: {formatPrice(selectedProduct.flashSalePrice || selectedProduct.price)}
                  </p>
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    Faça login para criar alertas de preço
                  </p>
                  <Link href="/">
                    <Button>Fazer Login</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Me avise quando o preço atingir:
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        R$
                      </span>
                      <Input
                        type="number"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        className="pl-10"
                        placeholder="0,00"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Você será notificado quando o preço for igual ou menor que este valor.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setShowAlertModal(false)}>
                      Cancelar
                    </Button>
                    <Button className="flex-1" onClick={handleCreateAlert}>
                      <Bell className="w-4 h-4 mr-2" />
                      Criar Alerta
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
