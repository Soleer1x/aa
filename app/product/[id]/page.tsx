'use client'

import { useState, use, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Heart, Share2, ShoppingCart, Star, Check, 
  Truck, Shield, RotateCcw, Minus, Plus, ChevronRight,
  ThumbsUp, X, Send, Scale, Bell, BellOff, Zap, Package,
  CreditCard, MapPin, BadgeCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/header'
import { CartDrawer } from '@/components/cart-drawer'
import { ProductCard } from '@/components/product-card'
import { formatPrice, formatDateShort } from '@/lib/data'
import { useCartStore, useWishlistStore, useProductsStore, useReviewsStore, useAuthStore, useComparisonStore, useRecentlyViewedStore, usePriceAlertStore } from '@/lib/store'

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewTab, setReviewTab] = useState<'all' | 'photos'>('all')

  const { getProduct, getAllProducts } = useProductsStore()
  const product = getProduct(id)
  const allProducts = getAllProducts()
  
  const { addItem } = useCartStore()
  const wishlist = useWishlistStore()
  const { user, isAuthenticated } = useAuthStore()
  const { getProductReviews, addReview, incrementHelpful } = useReviewsStore()
  const comparison = useComparisonStore()
  const recentlyViewed = useRecentlyViewedStore()
  const priceAlert = usePriceAlertStore()
  
  const isInWishlist = product ? wishlist.isInWishlist(product.id) : false
  const isInComparison = product ? comparison.isInComparison(product.id) : false
  const hasAlert = product && user ? priceAlert.getUserAlerts(user.id).some(a => a.productId === product.id && a.active) : false
  const reviews = product ? getProductReviews(product.id) : []

  // Add to recently viewed when product is loaded
  useEffect(() => {
    if (product) {
      recentlyViewed.addProduct(product)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id])
  const reviewsWithPhotos = reviews.filter(r => r.images && r.images.length > 0)

  const relatedProducts = allProducts.filter(p => p.category === product?.category && p.id !== id).slice(0, 4)

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto nao encontrado</h1>
          <Link href="/">
            <Button className="gradient-primary">Voltar para Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images || [product.image, product.image, product.image]

  const handleAddToCart = () => {
    const cartProduct = product.isFlashSale && product.flashSalePrice 
      ? { ...product, price: product.flashSalePrice }
      : product
    addItem(cartProduct, quantity)
    setIsCartOpen(true)
  }

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      wishlist.removeItem(product.id)
    } else {
      wishlist.addItem(product)
    }
  }

  const handleToggleComparison = () => {
    if (isInComparison) {
      comparison.removeProduct(product.id)
    } else {
      comparison.addProduct(product)
    }
  }

  const handleToggleAlert = () => {
    if (!user) return
    if (hasAlert) {
      const alertToRemove = priceAlert.getUserAlerts(user.id).find(a => a.productId === product.id && a.active)
      if (alertToRemove) priceAlert.removeAlert(alertToRemove.id)
    } else {
      const targetPrice = displayPrice * 0.9 // 10% less than current price
      priceAlert.addAlert(user.id, product.id, product.name, targetPrice, displayPrice)
    }
  }

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100 
      : 0
  }))

  const displayPrice = product.isFlashSale && product.flashSalePrice 
    ? product.flashSalePrice 
    : product.price

  return (
    <>
      <Header onCartOpen={() => setIsCartOpen(true)} onSearch={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-primary transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground truncate max-w-[240px] text-xs">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3 lg:sticky lg:top-[150px] self-start"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/40 ring-1 ring-border">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              {product.isFlashSale && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-lg">
                  <Zap className="w-4 h-4" /> Flash Sale
                </div>
              )}
              {product.discount && !product.isFlashSale && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl shadow-lg">
                  -{product.discount}%
                </div>
              )}
              {/* Prev/Next arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === index
                      ? 'border-primary shadow-md shadow-primary/20 scale-105'
                      : 'border-border hover:border-primary/50 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            {/* Brand + Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg border border-primary/20">
                {product.brand}
              </span>
              <span className="px-2.5 py-1 bg-secondary text-muted-foreground text-xs rounded-lg">
                {product.category}
              </span>
              {product.soldCount && product.soldCount > 0 && (
                <span className="px-2.5 py-1 bg-secondary text-muted-foreground text-xs rounded-lg flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-green-500" />
                  {product.soldCount.toLocaleString('pt-BR')} vendidos
                </span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-bold leading-snug">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4.5 h-4.5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-yellow-400">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">{reviews.length} avaliações</span>
              {reviews.length > 0 && (
                <span className="ml-auto text-xs text-primary cursor-pointer hover:underline">Ver avaliações ↓</span>
              )}
            </div>

            {/* Price Block */}
            <div className="bg-secondary/30 rounded-2xl p-4 space-y-2 border border-border/50">
              {(product.originalPrice || product.isFlashSale) && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.isFlashSale ? product.price : product.originalPrice!)}
                </p>
              )}
              <div className="flex items-center gap-3">
                <p className="text-4xl font-extrabold text-primary tracking-tight">
                  {formatPrice(displayPrice)}
                </p>
                {product.isFlashSale && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-lg animate-pulse">
                    <Zap className="w-3 h-3" /> FLASH
                  </span>
                )}
                {product.discount && !product.isFlashSale && (
                  <span className="px-2.5 py-1 bg-primary/15 text-primary text-xs font-bold rounded-lg border border-primary/20">
                    -{product.discount}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-green-500" />
                <span className="text-green-500 font-semibold">{formatPrice(displayPrice * 0.9)}</span>
                <span className="text-muted-foreground">à vista no PIX (10% off)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                ou 12× de <span className="font-medium text-foreground">{formatPrice(displayPrice / 12)}</span> sem juros
              </p>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {product.description}
            </p>

            {product.specs && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-secondary/20 rounded-xl border border-border/50">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="space-y-0.5">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{key}</p>
                    <p className="text-sm font-medium">{String(value)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-3">
              {/* Stock badge */}
              <div className="flex items-center gap-2 text-sm">
                {product.stock > 0 ? (
                  <>
                    <span className="flex items-center gap-1.5 text-green-500 font-medium">
                      <Check className="w-4 h-4" /> Em estoque
                    </span>
                    {product.stock <= 10 && (
                      <span className="px-2 py-0.5 bg-yellow-500/15 text-yellow-500 text-xs font-semibold rounded-full border border-yellow-500/20">
                        Apenas {product.stock} unidades!
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-destructive font-medium">Produto indisponível</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-secondary rounded-xl border border-border">
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-l-xl" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-r-xl" onClick={() => setQuantity(quantity + 1)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{product.stock} disponíveis</p>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full h-13 gradient-primary text-base font-bold glow-primary-sm rounded-xl"
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
              </Button>

              <div className="flex gap-2.5">
                <Button
                  variant="outline"
                  className={`flex-1 h-11 rounded-xl gap-2 ${
                    isInWishlist ? 'border-primary text-primary bg-primary/5' : ''
                  }`}
                  onClick={handleToggleWishlist}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                  {isInWishlist ? 'Favoritado' : 'Favoritar'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-11 w-11 rounded-xl ${
                    isInComparison ? 'border-blue-500 text-blue-500 bg-blue-500/5' : ''
                  }`}
                  onClick={handleToggleComparison}
                  title="Comparar"
                >
                  <Scale className="w-4 h-4" />
                </Button>
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-11 w-11 rounded-xl ${
                      hasAlert ? 'border-orange-500 text-orange-500 bg-orange-500/5' : ''
                    }`}
                    onClick={handleToggleAlert}
                    title={hasAlert ? 'Remover alerta' : 'Alerta de preço'}
                  >
                    {hasAlert ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  </Button>
                )}
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" title="Compartilhar">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-border">
              {[
                { icon: Truck, title: 'Entrega Rápida', sub: 'até 24h' },
                { icon: Shield, title: 'Garantia', sub: '12 meses' },
                { icon: RotateCcw, title: 'Devolução', sub: '7 dias grátis' },
                { icon: Package, title: 'Embalagem', sub: 'Segura' },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex flex-col items-center text-center p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <Icon className="w-5 h-5 text-primary mb-1.5" />
                  <p className="text-xs font-semibold">{title}</p>
                  <p className="text-[11px] text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>

            {/* Delivery estimate */}
            <div className="flex items-start gap-3 p-4 bg-secondary/20 rounded-xl border border-border/50">
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Calcular prazo de entrega</p>
                <p className="text-xs text-muted-foreground">Digite seu CEP para ver o prazo exato</p>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="00000-000"
                    maxLength={9}
                    className="flex-1 px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                  <button className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg font-medium hover:brightness-110 transition">
                    OK
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <section className="mt-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold">Avaliacoes dos Clientes</h2>
            {isAuthenticated && (
              <Button onClick={() => setShowReviewForm(true)} className="gradient-primary">
                <Star className="w-4 h-4 mr-2" />
                Escrever Avaliacao
              </Button>
            )}
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Rating Summary */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="text-center mb-6">
                <p className="text-5xl font-bold text-primary">{product.rating.toFixed(1)}</p>
                <div className="flex justify-center my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-muted text-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{reviews.length} avaliacoes</p>
              </div>

              <div className="space-y-2">
                {ratingDistribution.map(({ stars, count, percentage }) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm w-8">{stars}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-3">
              <div className="flex gap-2 mb-6">
                <Button
                  variant={reviewTab === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReviewTab('all')}
                >
                  Todas ({reviews.length})
                </Button>
                <Button
                  variant={reviewTab === 'photos' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReviewTab('photos')}
                >
                  Com Fotos ({reviewsWithPhotos.length})
                </Button>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    Este produto ainda nao possui avaliacoes
                  </p>
                  {isAuthenticated ? (
                    <Button onClick={() => setShowReviewForm(true)}>
                      Seja o primeiro a avaliar
                    </Button>
                  ) : (
                    <Link href="/auth">
                      <Button>Faca login para avaliar</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {(reviewTab === 'photos' ? reviewsWithPhotos : reviews).map((review) => (
                    <div key={review.id} className="bg-card rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary font-bold">
                              {review.userName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{review.userName}</p>
                              {review.verified && (
                                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded-full">
                                  Compra verificada
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'fill-muted text-muted'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDateShort(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="font-medium">{review.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                      </div>

                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {review.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt=""
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                        <button
                          onClick={() => incrementHelpful(review.id)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Util ({review.helpful})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Review Form Modal */}
        <AnimatePresence>
          {showReviewForm && user && (
            <ReviewFormModal
              productId={product.id}
              userId={user.id}
              userName={user.name}
              onClose={() => setShowReviewForm(false)}
              onSubmit={(data) => {
                addReview({
                  productId: product.id,
                  userId: user.id,
                  userName: user.name,
                  rating: data.rating,
                  title: data.title,
                  comment: data.comment,
                  images: data.images,
                  verified: true,
                })
                setShowReviewForm(false)
              }}
            />
          )}
        </AnimatePresence>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </section>
        )}
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

function ReviewFormModal({
  productId,
  userId,
  userName,
  onClose,
  onSubmit,
}: {
  productId: string
  userId: string
  userName: string
  onClose: () => void
  onSubmit: (data: { rating: number; title: string; comment: string; images: string[] }) => void
}) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [hoverRating, setHoverRating] = useState(0)

  const handleSubmit = () => {
    if (!title.trim() || !comment.trim()) return
    onSubmit({ rating, title, comment, images: [] })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-card rounded-2xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Escrever Avaliacao</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sua Avaliacao</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-muted text-muted'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Titulo</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resuma sua experiencia"
              className="h-12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Comentario</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte-nos mais sobre sua experiencia com o produto..."
              className="w-full h-32 px-4 py-3 rounded-lg bg-secondary border border-border resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              className="gradient-primary flex-1" 
              onClick={handleSubmit}
              disabled={!title.trim() || !comment.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Avaliacao
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
