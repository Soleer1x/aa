'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, QrCode, 
  FileText, Truck, MapPin, Check, Lock, ShoppingBag, Trash2, 
  Minus, Plus, Loader2, Tag, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/logo'
import { useCartStore, useAuthStore, useAddressStore, useOrdersStore, useCouponsStore, useStoreSettingsStore, useOrderTrackingStore } from '@/lib/store'
import { formatPrice } from '@/lib/data'

type Step = 'cart' | 'address' | 'payment' | 'confirmation'

export default function CheckoutPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('cart')
  const [selectedPayment, setSelectedPayment] = useState<'pix' | 'boleto'>('pix')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [addressData, setAddressData] = useState({
    label: 'Entrega',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  })

  const { items, removeItem, updateQuantity, getTotal, getSubtotal, getDiscount, clearCart, applyCoupon, removeCoupon, appliedCoupon } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const { getDefaultAddress, addAddress } = useAddressStore()
  const { createOrder } = useOrdersStore()
  const { addEvent } = useOrderTrackingStore()
  const { validateCoupon, useCoupon } = useCouponsStore()
  const { settings } = useStoreSettingsStore()

  const defaultAddress = getDefaultAddress()

  const subtotal = getSubtotal()
  const couponDiscount = getDiscount()
  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.defaultShippingCost
  const pixDiscount = selectedPayment === 'pix' && settings.pixEnabled ? subtotal * (settings.pixDiscountPercent / 100) : 0
  const total = subtotal - couponDiscount + shipping - pixDiscount

  const steps: { id: Step; label: string }[] = [
    { id: 'cart', label: 'Carrinho' },
    { id: 'address', label: 'Endereco' },
    { id: 'payment', label: 'Pagamento' },
    { id: 'confirmation', label: 'Confirmacao' },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const handleNextStep = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id)
    }
  }

  const handlePrevStep = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id)
    }
  }

  const handleApplyCoupon = () => {
    setCouponError('')
    setCouponSuccess('')
    if (!couponInput.trim()) return

    const result = validateCoupon(couponInput.trim(), subtotal)
    if (result.valid && result.coupon) {
      const applied = applyCoupon(result.coupon)
      if (applied) {
        setCouponSuccess(result.message)
        setCouponInput('')
      } else {
        setCouponError('Nao foi possivel aplicar o cupom')
      }
    } else {
      setCouponError(result.message)
    }
  }

  const handleRemoveCoupon = () => {
    removeCoupon()
    setCouponSuccess('')
    setCouponError('')
  }

  const handleFinishOrder = async () => {
    if (!user || !isAuthenticated) {
      alert('Voce precisa estar logado para finalizar o pedido')
      return
    }

    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const address = defaultAddress || {
      ...addressData,
      id: `addr-${Date.now()}`,
      isDefault: true,
    }
    
    if (!defaultAddress && addressData.street) {
      addAddress(addressData)
    }

    // Mark coupon as used
    if (appliedCoupon) {
      useCoupon(appliedCoupon.code)
    }

    const newOrderId = createOrder({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      items: items,
      subtotal: subtotal,
      discount: couponDiscount + pixDiscount,
      total: total,
      status: 'pending',
      paymentMethod: selectedPayment,
      address: address,
      couponCode: appliedCoupon?.code,
    })

    // Auto-add initial tracking event
    addEvent(newOrderId, 'pending', 'Pedido realizado com sucesso! Aguardando confirmação do pagamento.')

    setOrderId(newOrderId)
    setIsProcessing(false)
    setCurrentStep('confirmation')
    clearCart()
  }

  if (items.length === 0 && currentStep !== 'confirmation') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Seu carrinho esta vazio</h1>
          <p className="text-muted-foreground mb-6">Adicione produtos para continuar</p>
          <Link href="/">
            <Button className="gradient-primary">Continuar Comprando</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Checkout Seguro</span>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2 md:gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    index <= currentStepIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`hidden md:block text-sm ${
                  index <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Cart Step */}
              {currentStep === 'cart' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">Seu Carrinho</h2>
                  
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 p-4 bg-card rounded-xl border border-border"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium line-clamp-2">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.product.brand}</p>
                        <p className="text-primary font-bold mt-2">{formatPrice(item.product.price)}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
                      </div>
                    </div>
                  ))}

                  {/* Coupon Section */}
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" />
                      Cupom de Desconto
                    </h3>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div>
                          <p className="text-sm font-bold text-green-600">{appliedCoupon.code}</p>
                          <p className="text-xs text-green-600">
                            {appliedCoupon.type === 'percentage'
                              ? `-${appliedCoupon.value}% de desconto`
                              : `-${formatPrice(appliedCoupon.value)} de desconto`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive w-8 h-8"
                          onClick={handleRemoveCoupon}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="CODIGO DO CUPOM"
                          className="h-11 uppercase"
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        />
                        <Button
                          variant="outline"
                          className="h-11 px-6"
                          onClick={handleApplyCoupon}
                        >
                          Aplicar
                        </Button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-sm text-destructive mt-2">{couponError}</p>
                    )}
                    {couponSuccess && (
                      <p className="text-sm text-green-600 mt-2">{couponSuccess}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Address Step */}
              {currentStep === 'address' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Endereco de Entrega</h2>
                  
                  {defaultAddress ? (
                    <div className="p-4 bg-card rounded-xl border border-primary">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{defaultAddress.label}</span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">Padrao</span>
                      </div>
                      <p className="text-muted-foreground">
                        {defaultAddress.street}, {defaultAddress.number}
                        {defaultAddress.complement && ` - ${defaultAddress.complement}`}
                      </p>
                      <p className="text-muted-foreground">
                        {defaultAddress.neighborhood} - {defaultAddress.city}/{defaultAddress.state}
                      </p>
                      <p className="text-muted-foreground">CEP: {defaultAddress.cep}</p>
                      <Link href="/profile">
                        <Button variant="link" className="px-0 mt-2">
                          Gerenciar enderecos
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium mb-2">CEP</label>
                        <div className="flex gap-2">
                          <Input
                            value={addressData.cep}
                            onChange={(e) => setAddressData({ ...addressData, cep: e.target.value })}
                            placeholder="00000-000"
                            className="h-12"
                          />
                          <Button variant="outline" className="h-12">
                            Buscar
                          </Button>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-2">Rua</label>
                        <Input
                          value={addressData.street}
                          onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                          placeholder="Nome da rua"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Numero</label>
                        <Input
                          value={addressData.number}
                          onChange={(e) => setAddressData({ ...addressData, number: e.target.value })}
                          placeholder="123"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Complemento</label>
                        <Input
                          value={addressData.complement}
                          onChange={(e) => setAddressData({ ...addressData, complement: e.target.value })}
                          placeholder="Apto, Bloco..."
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Bairro</label>
                        <Input
                          value={addressData.neighborhood}
                          onChange={(e) => setAddressData({ ...addressData, neighborhood: e.target.value })}
                          placeholder="Bairro"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Cidade</label>
                        <Input
                          value={addressData.city}
                          onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                          placeholder="Cidade"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Estado</label>
                        <Input
                          value={addressData.state}
                          onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                          placeholder="UF"
                          className="h-12"
                        />
                      </div>
                    </div>
                  )}

                  {/* Shipping Options */}
                  <div className="pt-6 border-t border-border">
                    <h3 className="font-semibold mb-4">Opcoes de Entrega</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-4 p-4 bg-card rounded-xl border border-primary cursor-pointer">
                        <input type="radio" name="shipping" defaultChecked className="w-5 h-5 accent-primary" />
                        <Truck className="w-6 h-6 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">Entrega Expressa</p>
                          <p className="text-sm text-muted-foreground">
                            Receba em ate 24h
                            {shipping === 0 && (
                              <span className="ml-2 text-green-500 font-medium">
                                (Frete gratis acima de {formatPrice(settings.freeShippingThreshold)})
                              </span>
                            )}
                          </p>
                        </div>
                        <p className="font-bold text-green-500">
                          {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
                        </p>
                      </label>
                      <label className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border cursor-pointer">
                        <input type="radio" name="shipping" className="w-5 h-5 accent-primary" />
                        <MapPin className="w-6 h-6 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">Retirar na Loja</p>
                          <p className="text-sm text-muted-foreground">Disponivel em 2h</p>
                        </div>
                        <p className="font-bold text-green-500">Gratis</p>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Forma de Pagamento</h2>

                  <div className="space-y-4">
                    {/* PIX */}
                    {settings.pixEnabled && (
                      <>
                        <label
                          className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                            selectedPayment === 'pix' ? 'border-primary bg-primary/5' : 'border-border bg-card'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={selectedPayment === 'pix'}
                            onChange={() => setSelectedPayment('pix')}
                            className="w-5 h-5 accent-primary"
                          />
                          <QrCode className="w-6 h-6 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium">PIX</p>
                            <p className="text-sm text-muted-foreground">
                              {settings.pixDiscountPercent}% de desconto -{' '}
                              {formatPrice(subtotal * (1 - settings.pixDiscountPercent / 100) + shipping - couponDiscount)}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded">
                            -{settings.pixDiscountPercent}%
                          </span>
                        </label>

                        {selectedPayment === 'pix' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-6 bg-secondary/30 rounded-xl text-center"
                          >
                            <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center mb-4">
                              <QrCode className="w-32 h-32 text-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Escaneie o QR Code ou copie o codigo PIX
                            </p>
                            <p className="font-mono text-xs bg-secondary p-2 rounded break-all">
                              00020126580014BR.GOV.BCB.PIX0136soleer-hub-pagamentos
                            </p>
                          </motion.div>
                        )}
                      </>
                    )}

                    {/* Boleto */}
                    {settings.boletoEnabled && (
                      <>
                        <label
                          className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                            selectedPayment === 'boleto' ? 'border-primary bg-primary/5' : 'border-border bg-card'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={selectedPayment === 'boleto'}
                            onChange={() => setSelectedPayment('boleto')}
                            className="w-5 h-5 accent-primary"
                          />
                          <FileText className="w-6 h-6 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium">Boleto Bancario</p>
                            <p className="text-sm text-muted-foreground">
                              Vencimento em {settings.boletoExpirationDays} dias uteis
                            </p>
                          </div>
                        </label>

                        {selectedPayment === 'boleto' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-6 bg-secondary/30 rounded-xl"
                          >
                            <p className="text-sm text-muted-foreground mb-4">
                              O boleto sera gerado apos a confirmacao do pedido. Voce podera baixar e pagar em qualquer banco ou loterica.
                            </p>
                            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg">
                              <span className="text-yellow-500 text-sm">
                                O pedido sera confirmado apos a compensacao do pagamento ({settings.boletoExpirationDays} dias uteis)
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Confirmation Step */}
              {currentStep === 'confirmation' && (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center"
                  >
                    <Check className="w-12 h-12 text-green-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Pedido Confirmado!</h2>
                  <p className="text-muted-foreground mb-6">
                    Seu pedido foi realizado com sucesso. Voce recebera um e-mail com os detalhes.
                  </p>
                  <p className="text-sm text-muted-foreground mb-8">
                    Numero do pedido: <span className="font-mono font-bold text-foreground">#{orderId}</span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                      <Button className="gradient-primary">Continuar Comprando</Button>
                    </Link>
                    <Link href={`/tracking/${orderId}`}>
                      <Button variant="outline">Rastrear Pedido</Button>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Navigation Buttons */}
            {currentStep !== 'confirmation' && (
              <div className="flex justify-between mt-8 pt-8 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={currentStep === 'cart' ? undefined : handlePrevStep}
                  disabled={currentStep === 'cart'}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>

                {currentStep === 'payment' ? (
                  <Button
                    onClick={handleFinishOrder}
                    disabled={isProcessing || !isAuthenticated}
                    className="gradient-primary glow-primary-sm"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Finalizar Pedido'
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleNextStep} className="gradient-primary">
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Order Summary */}
          {currentStep !== 'confirmation' && (
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                <h3 className="font-semibold mb-4">Resumo do Pedido</h3>

                <div className="space-y-3 mb-4">
                  {items.slice(0, 3).map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      + {items.length - 3} outros itens
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-500">Cupom ({appliedCoupon?.code})</span>
                      <span className="text-green-500">-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className={shipping === 0 ? 'text-green-500' : ''}>
                      {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
                    </span>
                  </div>
                  {selectedPayment === 'pix' && settings.pixEnabled && pixDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-500">Desconto PIX ({settings.pixDiscountPercent}%)</span>
                      <span className="text-green-500">-{formatPrice(pixDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(Math.max(0, total))}</span>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
                    <p className="text-sm text-yellow-600">
                      Voce precisa estar logado para finalizar o pedido
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
