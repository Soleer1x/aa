'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/data'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()

  const total = getTotal()
  const shipping = total >= 299 ? 0 : 29.90
  const finalTotal = total + shipping

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-primary" />
                <h2 className="text-lg font-bold">Carrinho</h2>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {items.length} {items.length === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Seu carrinho está vazio</h3>
                  <p className="text-muted-foreground mb-6">
                    Adicione produtos para começar suas compras
                  </p>
                  <Button onClick={onClose} className="gradient-primary">
                    Continuar Comprando
                  </Button>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-4 p-3 bg-card rounded-xl border border-border"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.product.brand}
                        </p>
                        <p className="text-primary font-bold mt-2">
                          {formatPrice(item.product.price)}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 bg-secondary rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {items.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground"
                      onClick={clearCart}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpar carrinho
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-4 space-y-4">
                {/* Shipping progress */}
                {total < 299 && (
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-sm mb-2">
                      Falta <span className="font-bold text-primary">{formatPrice(299 - total)}</span> para frete grátis!
                    </p>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.min((total / 299) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span className={shipping === 0 ? 'text-green-500 font-medium' : ''}>
                      {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Checkout button */}
                <Link href="/checkout" onClick={onClose}>
                  <Button className="w-full h-12 gradient-primary text-lg font-semibold glow-primary-sm">
                    Finalizar Compra
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <p className="text-xs text-center text-muted-foreground">
                  Pagamento 100% seguro com criptografia SSL
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
