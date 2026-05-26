'use client'

import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Package, Truck, CheckCircle2, Clock, 
  MapPin, Phone, Mail, Copy, ExternalLink, AlertCircle,
  PackageCheck, Building2, Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { useOrdersStore, useOrderTrackingStore, useAuthStore, Order } from '@/lib/store'
import { formatPrice, formatDate } from '@/lib/data'

const statusSteps = [
  { status: 'pending', label: 'Pedido Recebido', icon: Package, description: 'Aguardando confirmação do pagamento' },
  { status: 'processing', label: 'Em Processamento', icon: PackageCheck, description: 'Separando seu pedido' },
  { status: 'shipped', label: 'Enviado', icon: Truck, description: 'Em transporte para o destino' },
  { status: 'completed', label: 'Entregue', icon: CheckCircle2, description: 'Pedido entregue com sucesso' },
]

export default function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchId, setSearchId] = useState('')
  const [searchError, setSearchError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const { getOrderById, getAllOrders } = useOrdersStore()
  const { getOrderEvents } = useOrderTrackingStore()
  const { user, isAuthenticated } = useAuthStore()
  
  const order = mounted && id !== 'search' ? getOrderById(id) : null
  const trackingEvents = order ? getOrderEvents(order.id) : []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchError('')
    
    if (!searchId.trim()) {
      setSearchError('Digite o número do pedido')
      return
    }
    
    const foundOrder = getOrderById(searchId.trim())
    if (foundOrder) {
      window.location.href = `/tracking/${foundOrder.id}`
    } else {
      setSearchError('Pedido não encontrado')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusIndex = (status: Order['status']) => {
    if (status === 'cancelled') return -1
    return statusSteps.findIndex(s => s.status === status)
  }

  const currentStatusIndex = order ? getStatusIndex(order.status) : -1

  // Search mode (also covers !mounted to avoid SSR/client hydration mismatch)
  if (!mounted || id === 'search' || !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onCartOpen={() => setIsCartOpen(true)} onSearch={() => {}} />
        
        <main className="flex-1 pt-20">
          <div className="max-w-2xl mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Rastrear Pedido</h1>
              <p className="text-muted-foreground mb-8">
                Digite o número do seu pedido para acompanhar a entrega
              </p>

              <form onSubmit={handleSearch} className="max-w-md mx-auto">
                <div className="flex gap-2">
                  <Input
                    value={searchId}
                    onChange={(e) => {
                      setSearchId(e.target.value)
                      setSearchError('')
                    }}
                    placeholder="Ex: SH12345678"
                    className="h-12"
                  />
                  <Button type="submit" className="h-12 px-8">
                    Rastrear
                  </Button>
                </div>
                {searchError && (
                  <p className="text-destructive text-sm mt-2">{searchError}</p>
                )}
              </form>

              {/* User's recent orders */}
              {isAuthenticated && user && (
                <div className="mt-12">
                  <h2 className="text-lg font-semibold mb-4">Seus Pedidos Recentes</h2>
                  <div className="space-y-3">
                    {getAllOrders()
                      .filter(o => o.userId === user.id)
                      .slice(0, 5)
                      .map((order) => (
                        <Link
                          key={order.id}
                          href={`/tracking/${order.id}`}
                          className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Package className="w-5 h-5 text-primary" />
                            <div className="text-left">
                              <p className="font-medium">#{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </main>

        <Footer />
        <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCartOpen={() => setIsCartOpen(true)} onSearch={() => {}} />
      
      <main className="flex-1 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/tracking/search">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Pedido #{order.id}</h1>
              <p className="text-muted-foreground text-sm">
                Realizado em {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {order.status === 'cancelled' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center mb-8"
            >
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-500 mb-2">Pedido Cancelado</h2>
              <p className="text-muted-foreground">
                Este pedido foi cancelado. Entre em contato conosco se precisar de ajuda.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Status Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border p-6 mb-8"
              >
                <h2 className="font-semibold mb-6">Status do Pedido</h2>
                
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  <div 
                    className="absolute left-6 top-0 w-0.5 bg-primary transition-all duration-500"
                    style={{ height: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                  />

                  <div className="space-y-8">
                    {statusSteps.map((step, index) => {
                      const isActive = index <= currentStatusIndex
                      const isCurrent = index === currentStatusIndex
                      const StepIcon = step.icon
                      
                      return (
                        <div key={step.status} className="relative flex items-start gap-4 pl-12">
                          <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-secondary text-muted-foreground'
                          } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <div className={`flex-1 pt-2 ${!isActive ? 'opacity-50' : ''}`}>
                            <h3 className="font-medium">{step.label}</h3>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                            {isCurrent && order.trackingCode && step.status === 'shipped' && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm">Código de rastreio:</span>
                                <code className="px-2 py-1 bg-secondary rounded text-sm font-mono">
                                  {order.trackingCode}
                                </code>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => copyToClipboard(order.trackingCode!)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Tracking Events */}
              {trackingEvents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-2xl border border-border p-6 mb-8"
                >
                  <h2 className="font-semibold mb-4">Histórico de Rastreamento</h2>
                  <div className="space-y-4">
                    {trackingEvents.map((event, index) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{event.description}</p>
                          {event.location && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDate(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Order Details */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-semibold mb-4">Itens do Pedido</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qtd: {item.quantity}
                      </p>
                      <p className="text-primary font-bold">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal || order.total)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm mb-2 text-green-500">
                    <span>Desconto</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </motion.div>

            {/* Delivery Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-semibold mb-4">Endereço de Entrega</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{order.address.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.address.street}, {order.address.number}
                      {order.address.complement && ` - ${order.address.complement}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.address.neighborhood}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.address.city} - {order.address.state}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CEP: {order.address.cep}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <h3 className="font-medium mb-3">Forma de Pagamento</h3>
                <p className="text-muted-foreground">
                  {order.paymentMethod === 'pix' ? 'PIX' : 
                   order.paymentMethod === 'boleto' ? 'Boleto Bancário' : 
                   'Cartão de Crédito'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <h3 className="font-medium mb-3">Precisa de ajuda?</h3>
                <div className="space-y-2">
                  <a href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Phone className="w-4 h-4" />
                    (11) 9999-9999
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Mail className="w-4 h-4" />
                    suporte@soleerhub.com
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
