'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star, Eye, Zap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Product, useCartStore, useWishlistStore } from '@/lib/store'
import { formatPrice } from '@/lib/data'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [addedEffect, setAddedEffect] = useState(false)

  const router = useRouter()
  const { addItem } = useCartStore()
  const wishlist = useWishlistStore()
  const isInWishlist = wishlist.isInWishlist(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    setAddedEffect(true)
    setTimeout(() => setAddedEffect(false), 1200)
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInWishlist) {
      wishlist.removeItem(product.id)
    } else {
      wishlist.addItem(product)
    }
  }

  const displayPrice = product.isFlashSale && product.flashSalePrice
    ? product.flashSalePrice
    : product.price

  const discountPct = product.discount ?? (
    product.originalPrice
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <Link href={`/product/${product.id}`}>
        <div
          className="product-card group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-secondary/40">
            {!imageLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={product.image}
              alt={product.name}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-108 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
              {product.isFlashSale && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-bold rounded-md shadow-lg animate-pulse">
                  <Zap className="w-3 h-3" /> FLASH
                </span>
              )}
              {discountPct && !product.isFlashSale && (
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[11px] font-bold rounded-md shadow">
                  -{discountPct}%
                </span>
              )}
              {product.stock > 0 && product.stock <= 5 && (
                <span className="px-2 py-0.5 bg-yellow-500 text-black text-[11px] font-bold rounded-md shadow">
                  Últimas {product.stock}!
                </span>
              )}
            </div>

            {/* Wishlist button */}
            <button
              onClick={handleToggleWishlist}
              className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
                isInWishlist
                  ? 'bg-primary text-white scale-110'
                  : 'bg-black/40 backdrop-blur-sm text-white hover:bg-primary'
              }`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>

            {/* Hover overlay */}
            <motion.div
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex items-end justify-center pb-4 gap-2 pointer-events-none"
            >
              <div className="pointer-events-auto flex gap-2">
                <button
                  onClick={handleAddToCart}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg transition-all duration-200 ${
                    addedEffect
                      ? 'bg-green-500 scale-95'
                      : 'gradient-primary hover:brightness-110'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {addedEffect ? 'Adicionado!' : 'Carrinho'}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    router.push(`/product/${product.id}`)
                  }}
                  className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-3.5">
            {/* Category + Brand */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                {product.category}
              </span>
              <span className="text-[11px] text-muted-foreground font-semibold">{product.brand}</span>
            </div>

            {/* Name */}
            <h3 className="text-sm font-semibold line-clamp-2 min-h-[2.6rem] group-hover:text-primary transition-colors leading-snug">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-[11px] text-muted-foreground/60">
                ({product.reviews.toLocaleString('pt-BR')})
              </span>
              {product.soldCount && product.soldCount > 0 && (
                <span className="ml-auto flex items-center gap-0.5 text-[11px] text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  {product.soldCount > 1000
                    ? `${(product.soldCount / 1000).toFixed(1)}k`
                    : product.soldCount}{' '}
                  vendidos
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mt-2.5 space-y-0.5">
              {(product.originalPrice || (product.isFlashSale && product.flashSalePrice)) && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.isFlashSale ? product.price : product.originalPrice!)}
                </p>
              )}
              <p className="text-lg font-bold text-primary leading-none">
                {formatPrice(displayPrice)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                ou 12× de {formatPrice(displayPrice / 12)}
              </p>
              <p className="text-[11px] text-green-500 font-medium">
                {formatPrice(displayPrice * 0.9)} no Pix
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border">
      <div className="aspect-square skeleton" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-2.5 skeleton rounded w-1/3" />
        <div className="h-3.5 skeleton rounded w-full" />
        <div className="h-3.5 skeleton rounded w-3/4" />
        <div className="h-2.5 skeleton rounded w-1/2" />
        <div className="h-5 skeleton rounded w-2/5 mt-1" />
      </div>
    </div>
  )
}
