'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Tag, Copy, Check, Clock, Percent, DollarSign, 
  AlertCircle, CheckCircle, ChevronRight, ShoppingCart,
  Ticket, Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { useCouponsStore, useCartStore, useAuthStore } from '@/lib/store'
import { formatPrice, formatDateShort, getTimeRemaining } from '@/lib/data'

export default function CouponsPage() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'percentage' | 'fixed'>('all')
  
  const { getAllCoupons, validateCoupon } = useCouponsStore()
  const { applyCoupon, getSubtotal, appliedCoupon } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const coupons = getAllCoupons()
  const cartSubtotal = getSubtotal()

  const filteredCoupons = useMemo(() => {
    return coupons.filter(coupon => {
      // Filter active coupons
      if (!coupon.active) return false
      
      // Filter by expiration
      const now = new Date().toISOString()
      if (coupon.validUntil < now) return false

      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!coupon.code.toLowerCase().includes(query) && 
            !coupon.description.toLowerCase().includes(query)) {
          return false
        }
      }

      // Filter by type
      if (filterType !== 'all' && coupon.type !== filterType) return false

      return true
    })
  }, [coupons, searchQuery, filterType])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleApplyCoupon = (coupon: typeof coupons[0]) => {
    if (cartSubtotal === 0) {
      alert('Adicione produtos ao carrinho para usar o cupom')
      return
    }
    
    const result = validateCoupon(coupon.code, cartSubtotal)
    if (result.valid && result.coupon) {
      applyCoupon(result.coupon)
      alert(result.message)
    } else {
      alert(result.message)
    }
  }

  const getCouponStatus = (coupon: typeof coupons[0]) => {
    const now = new Date().toISOString()
    
    if (coupon.validFrom > now) {
      return { status: 'upcoming', label: 'Em breve', color: 'text-blue-500' }
    }
    
    if (coupon.validUntil < now) {
      return { status: 'expired', label: 'Expirado', color: 'text-red-500' }
    }
    
    if (coupon.usedCount >= coupon.usageLimit) {
      return { status: 'depleted', label: 'Esgotado', color: 'text-gray-500' }
    }

    // Check remaining time
    const timeLeft = getTimeRemaining(coupon.validUntil)
    if (timeLeft.days < 1) {
      return { status: 'ending', label: 'Termina hoje', color: 'text-orange-500' }
    }
    
    return { status: 'active', label: 'Ativo', color: 'text-green-500' }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCartOpen={() => setIsCartOpen(true)} onSearch={() => {}} />
      
      <main className="flex-1 pt-20">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Ticket className="w-8 h-8 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold">Cupons de Desconto</h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Aproveite nossos cupons exclusivos e economize nas suas compras!
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar cupom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterType === 'percentage' ? 'default' : 'outline'}
                onClick={() => setFilterType('percentage')}
              >
                <Percent className="w-4 h-4 mr-2" />
                Porcentagem
              </Button>
              <Button
                variant={filterType === 'fixed' ? 'default' : 'outline'}
                onClick={() => setFilterType('fixed')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Valor Fixo
              </Button>
            </div>
          </div>

          {/* Applied Coupon Notice */}
          {appliedCoupon && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-4"
            >
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-green-700 dark:text-green-400">
                  Cupom {appliedCoupon.code} aplicado!
                </p>
                <p className="text-sm text-muted-foreground">
                  {appliedCoupon.type === 'percentage' 
                    ? `${appliedCoupon.value}% de desconto` 
                    : `${formatPrice(appliedCoupon.value)} de desconto`}
                </p>
              </div>
              <Link href="/checkout">
                <Button className="gradient-primary">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Finalizar Compra
                </Button>
              </Link>
            </motion.div>
          )}

          {filteredCoupons.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-bold mb-2">Nenhum cupom disponivel</h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? 'Nenhum cupom encontrado com esse termo' 
                  : 'Novos cupons serao adicionados em breve!'}
              </p>
              <Link href="/">
                <Button>Ver Produtos</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoupons.map((coupon, index) => {
                const { status, label, color } = getCouponStatus(coupon)
                const timeLeft = getTimeRemaining(coupon.validUntil)
                const isApplied = appliedCoupon?.code === coupon.code
                
                return (
                  <motion.div
                    key={coupon.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-card rounded-2xl border overflow-hidden ${
                      isApplied ? 'border-green-500' : 'border-border'
                    }`}
                  >
                    {/* Coupon Header */}
                    <div className={`p-6 ${
                      coupon.type === 'percentage' 
                        ? 'bg-gradient-to-r from-primary/20 to-primary/10'
                        : 'bg-gradient-to-r from-green-500/20 to-green-500/10'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color} bg-background`}>
                          {label}
                        </span>
                        {isApplied && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium text-green-500 bg-green-500/10">
                            Aplicado
                          </span>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {coupon.type === 'percentage' ? (
                            <span className="text-5xl font-bold text-primary">{coupon.value}%</span>
                          ) : (
                            <span className="text-5xl font-bold text-green-500">
                              {formatPrice(coupon.value)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {coupon.type === 'percentage' ? 'de desconto' : 'de desconto'}
                        </p>
                      </div>
                    </div>

                    {/* Coupon Body */}
                    <div className="p-6">
                      <h3 className="font-semibold mb-2">{coupon.description}</h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <p className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          Compra minima: {formatPrice(coupon.minPurchase)}
                        </p>
                        {coupon.maxDiscount && (
                          <p className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Desconto maximo: {formatPrice(coupon.maxDiscount)}
                          </p>
                        )}
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Valido ate: {formatDateShort(coupon.validUntil)}
                        </p>
                        {status === 'active' && timeLeft.days < 3 && (
                          <p className="text-orange-500 font-medium">
                            {timeLeft.days === 0 
                              ? `Expira em ${timeLeft.hours}h ${timeLeft.minutes}m`
                              : `Expira em ${timeLeft.days} dias`}
                          </p>
                        )}
                      </div>

                      {/* Coupon Code */}
                      <div className="flex items-center gap-2 p-3 bg-secondary rounded-xl mb-4">
                        <code className="flex-1 font-mono font-bold text-lg text-center">
                          {coupon.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyCode(coupon.code)}
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{coupon.usedCount} usados</span>
                          <span>{coupon.usageLimit - coupon.usedCount} restantes</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Action */}
                      <Button
                        className="w-full"
                        onClick={() => handleApplyCoupon(coupon)}
                        disabled={status !== 'active' || isApplied}
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Cupom Aplicado
                          </>
                        ) : status !== 'active' ? (
                          'Indisponivel'
                        ) : (
                          <>
                            <Tag className="w-4 h-4 mr-2" />
                            Usar Cupom
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Dashed border effect */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-background rounded-r-full" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-background rounded-l-full" />
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Tag className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Como usar</h3>
              <p className="text-sm text-muted-foreground">
                Copie o codigo do cupom e aplique no checkout para receber o desconto
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Validade</h3>
              <p className="text-sm text-muted-foreground">
                Fique atento a data de validade. Cupons expirados nao podem ser usados
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Restricoes</h3>
              <p className="text-sm text-muted-foreground">
                Alguns cupons possuem valor minimo de compra ou limite de desconto
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
