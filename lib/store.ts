import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface User {
  id: string
  name: string
  email: string
  cpf?: string
  phone?: string
  avatar?: string
  isAdmin?: boolean
  adminRole?: 'super_admin' | 'admin' | 'moderator'
  createdAt: string
}

export interface AdminUser extends User {
  isAdmin: true
  adminRole: 'super_admin' | 'admin' | 'moderator'
  permissions: string[]
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  brand: string
  rating: number
  reviews: number
  stock: number
  featured?: boolean
  discount?: number
  specs?: Record<string, string>
  createdAt: string
  soldCount?: number
  isFlashSale?: boolean
  flashSalePrice?: number
  flashSaleEndsAt?: string
  flashSaleStock?: number
  flashSaleSold?: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Address {
  id: string
  label: string
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  isDefault?: boolean
}

export interface Order {
  id: string
  userId: string
  userName: string
  userEmail: string
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  paymentMethod: 'pix' | 'boleto' | 'credit_card'
  address: Address
  createdAt: string
  trackingCode?: string
  couponCode?: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  isAdmin: boolean
  message: string
  createdAt: string
  read: boolean
}

export interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantEmail: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  images?: string[]
  helpful: number
  verified: boolean
  createdAt: string
  approved: boolean
}

export interface Coupon {
  id: string
  code: string
  description: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase: number
  maxDiscount?: number
  usageLimit: number
  usedCount: number
  validFrom: string
  validUntil: string
  active: boolean
  categories?: string[]
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  image?: string
  description?: string
  productCount: number
  featured?: boolean
}

export interface Notification {
  id: string
  userId: string
  type: 'order' | 'promo' | 'system' | 'review' | 'wishlist' | 'flash_sale' | 'coupon'
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
  imageUrl?: string
  actionText?: string
}

export interface SearchHistory {
  id: string
  userId: string
  query: string
  timestamp: string
}

export interface ProductFilter {
  categories: string[]
  brands: string[]
  priceRange: [number, number]
  rating: number
  inStock: boolean
  onSale: boolean
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'bestseller'
}

export interface FlashSale {
  id: string
  name: string
  startTime: string
  endTime: string
  productIds: string[]
  active: boolean
}

// Admin permissions
export const ADMIN_PERMISSIONS = {
  super_admin: ['all'],
  admin: ['products', 'orders', 'users', 'reviews', 'coupons', 'chat', 'categories', 'flash_sales'],
  moderator: ['reviews', 'chat', 'orders_view']
} as const

// Auth Store
interface AuthState {
  user: User | null
  users: User[]
  adminUsers: AdminUser[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginAsAdmin: (email: string, password: string) => Promise<boolean>
  register: (data: { name: string; email: string; password: string; cpf: string; phone: string }) => Promise<boolean>
  registerAdmin: (data: { name: string; email: string; password: string; role: AdminUser['adminRole'] }) => Promise<boolean>
  logout: () => void
  updateUser: (data: Partial<User>) => void
  getAllUsers: () => User[]
  getAllAdmins: () => AdminUser[]
  updateAdminRole: (adminId: string, role: AdminUser['adminRole']) => void
  deleteAdmin: (adminId: string) => boolean
  hasPermission: (permission: string) => boolean
}

// Stored passwords (in real app, this would be hashed and in a database)
const storedPasswords: Record<string, string> = {
  'admin@soleerhub.com': 'admin123'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [],
      adminUsers: [{
        id: 'admin-1',
        name: 'Super Admin',
        email: 'admin@soleerhub.com',
        isAdmin: true,
        adminRole: 'super_admin',
        permissions: ['all'],
        createdAt: new Date().toISOString(),
      }],
      isAuthenticated: false,
      isLoading: false,
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const existingUser = get().users.find(u => u.email === email)
        if (existingUser && storedPasswords[email] === password) {
          set({ user: existingUser, isAuthenticated: true, isLoading: false })
          return true
        }
        
        // For demo: allow any registered user
        if (existingUser) {
          set({ user: existingUser, isAuthenticated: true, isLoading: false })
          return true
        }
        
        set({ isLoading: false })
        return false
      },
      loginAsAdmin: async (email: string, password: string) => {
        set({ isLoading: true })
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const adminUser = get().adminUsers.find(u => u.email === email)
        if (adminUser && storedPasswords[email] === password) {
          set({ user: adminUser, isAuthenticated: true, isLoading: false })
          return true
        }
        
        set({ isLoading: false })
        return false
      },
      register: async (data) => {
        set({ isLoading: true })
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if email already exists
        if (get().users.some(u => u.email === data.email)) {
          set({ isLoading: false })
          return false
        }
        
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          phone: data.phone,
          isAdmin: false,
          createdAt: new Date().toISOString(),
        }
        
        storedPasswords[data.email] = data.password
        
        set((state) => ({ 
          users: [...state.users, newUser],
          user: newUser, 
          isAuthenticated: true, 
          isLoading: false 
        }))
        return true
      },
      registerAdmin: async (data) => {
        set({ isLoading: true })
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const currentUser = get().user
        if (!currentUser?.isAdmin || (currentUser as AdminUser).adminRole !== 'super_admin') {
          set({ isLoading: false })
          return false
        }
        
        if (get().adminUsers.some(u => u.email === data.email)) {
          set({ isLoading: false })
          return false
        }
        
        const permissions = ADMIN_PERMISSIONS[data.role]
        const newAdmin: AdminUser = {
          id: `admin-${Date.now()}`,
          name: data.name,
          email: data.email,
          isAdmin: true,
          adminRole: data.role,
          permissions: [...permissions],
          createdAt: new Date().toISOString(),
        }
        
        storedPasswords[data.email] = data.password
        
        set((state) => ({ 
          adminUsers: [...state.adminUsers, newAdmin],
          isLoading: false 
        }))
        return true
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (data) => set((state) => {
        if (!state.user) return state
        const updatedUser = { ...state.user, ...data }
        const updatedUsers = state.users.map(u => 
          u.id === state.user?.id ? updatedUser : u
        )
        return { user: updatedUser, users: updatedUsers }
      }),
      getAllUsers: () => get().users,
      getAllAdmins: () => get().adminUsers,
      updateAdminRole: (adminId: string, role: AdminUser['adminRole']) => {
        set((state) => ({
          adminUsers: state.adminUsers.map(a => 
            a.id === adminId ? { ...a, adminRole: role, permissions: [...ADMIN_PERMISSIONS[role]] } : a
          )
        }))
      },
      deleteAdmin: (adminId: string) => {
        const admin = get().adminUsers.find(a => a.id === adminId)
        if (!admin || admin.adminRole === 'super_admin') return false
        
        set((state) => ({
          adminUsers: state.adminUsers.filter(a => a.id !== adminId)
        }))
        return true
      },
      hasPermission: (permission: string) => {
        const user = get().user
        if (!user?.isAdmin) return false
        const adminUser = user as AdminUser
        return adminUser.permissions.includes('all') || adminUser.permissions.includes(permission)
      },
    }),
    { name: 'soleer-auth' }
  )
)

// Products Store
interface ProductsState {
  products: Product[]
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviews' | 'soldCount'>) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProduct: (id: string) => Product | undefined
  getAllProducts: () => Product[]
  getProductsByCategory: (category: string) => Product[]
  getFeaturedProducts: () => Product[]
  searchProducts: (query: string) => Product[]
  getFlashSaleProducts: () => Product[]
  setFlashSale: (productId: string, data: { price: number; stock: number; endsAt: string }) => void
  removeFlashSale: (productId: string) => void
  incrementSold: (productId: string, quantity: number) => void
  // Advanced filtering
  filterProducts: (filter: ProductFilter) => Product[]
  getBrands: () => string[]
  getPriceRange: () => [number, number]
  getNewArrivals: (days?: number) => Product[]
  getBestSellers: (limit?: number) => Product[]
  getRelatedProducts: (productId: string, limit?: number) => Product[]
  getProductsOnSale: () => Product[]
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: [],
      addProduct: (product) => {
        const newProduct: Product = {
          ...product,
          id: `prod-${Date.now()}`,
          rating: 0,
          reviews: 0,
          soldCount: 0,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ products: [...state.products, newProduct] }))
      },
      updateProduct: (id, data) => {
        set((state) => ({
          products: state.products.map(p => 
            p.id === id ? { ...p, ...data } : p
          )
        }))
      },
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter(p => p.id !== id)
        }))
      },
      getProduct: (id) => get().products.find(p => p.id === id),
      getAllProducts: () => get().products,
      getProductsByCategory: (category) => 
        get().products.filter(p => p.category.toLowerCase() === category.toLowerCase()),
      getFeaturedProducts: () => get().products.filter(p => p.featured),
      searchProducts: (query) => {
        const lowercaseQuery = query.toLowerCase()
        return get().products.filter(p => 
          p.name.toLowerCase().includes(lowercaseQuery) ||
          p.description.toLowerCase().includes(lowercaseQuery) ||
          p.category.toLowerCase().includes(lowercaseQuery) ||
          p.brand.toLowerCase().includes(lowercaseQuery)
        )
      },
      getFlashSaleProducts: () => {
        const now = new Date().toISOString()
        return get().products.filter(p => 
          p.isFlashSale && 
          p.flashSaleEndsAt && 
          p.flashSaleEndsAt > now &&
          (p.flashSaleStock || 0) > (p.flashSaleSold || 0)
        )
      },
      setFlashSale: (productId, data) => {
        set((state) => ({
          products: state.products.map(p => 
            p.id === productId ? {
              ...p,
              isFlashSale: true,
              flashSalePrice: data.price,
              flashSaleStock: data.stock,
              flashSaleSold: 0,
              flashSaleEndsAt: data.endsAt,
            } : p
          )
        }))
      },
      removeFlashSale: (productId) => {
        set((state) => ({
          products: state.products.map(p => 
            p.id === productId ? {
              ...p,
              isFlashSale: false,
              flashSalePrice: undefined,
              flashSaleStock: undefined,
              flashSaleSold: undefined,
              flashSaleEndsAt: undefined,
            } : p
          )
        }))
      },
      incrementSold: (productId, quantity) => {
        set((state) => ({
          products: state.products.map(p => 
            p.id === productId ? {
              ...p,
              soldCount: (p.soldCount || 0) + quantity,
              stock: Math.max(0, p.stock - quantity),
              flashSaleSold: p.isFlashSale ? (p.flashSaleSold || 0) + quantity : p.flashSaleSold,
            } : p
          )
        }))
      },
      // Advanced filtering
      filterProducts: (filter) => {
        let filtered = get().products

        // Filter by categories
        if (filter.categories.length > 0) {
          filtered = filtered.filter(p => 
            filter.categories.some(cat => 
              p.category.toLowerCase().includes(cat.toLowerCase())
            )
          )
        }

        // Filter by brands
        if (filter.brands.length > 0) {
          filtered = filtered.filter(p => 
            filter.brands.some(brand => 
              p.brand.toLowerCase() === brand.toLowerCase()
            )
          )
        }

        // Filter by price range
        if (filter.priceRange) {
          const [min, max] = filter.priceRange
          filtered = filtered.filter(p => {
            const price = p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price
            return price >= min && price <= max
          })
        }

        // Filter by rating
        if (filter.rating > 0) {
          filtered = filtered.filter(p => p.rating >= filter.rating)
        }

        // Filter in stock
        if (filter.inStock) {
          filtered = filtered.filter(p => p.stock > 0)
        }

        // Filter on sale
        if (filter.onSale) {
          filtered = filtered.filter(p => 
            p.discount || p.originalPrice || p.isFlashSale
          )
        }

        // Sort
        switch (filter.sortBy) {
          case 'price_asc':
            filtered.sort((a, b) => {
              const priceA = a.isFlashSale && a.flashSalePrice ? a.flashSalePrice : a.price
              const priceB = b.isFlashSale && b.flashSalePrice ? b.flashSalePrice : b.price
              return priceA - priceB
            })
            break
          case 'price_desc':
            filtered.sort((a, b) => {
              const priceA = a.isFlashSale && a.flashSalePrice ? a.flashSalePrice : a.price
              const priceB = b.isFlashSale && b.flashSalePrice ? b.flashSalePrice : b.price
              return priceB - priceA
            })
            break
          case 'rating':
            filtered.sort((a, b) => b.rating - a.rating)
            break
          case 'newest':
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            break
          case 'bestseller':
            filtered.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
            break
          default:
            // relevance - keep original order
            break
        }

        return filtered
      },
      getBrands: () => {
        const brands = new Set<string>()
        get().products.forEach(p => brands.add(p.brand))
        return Array.from(brands).sort()
      },
      getPriceRange: () => {
        const products = get().products
        if (products.length === 0) return [0, 10000]
        
        const prices = products.map(p => 
          p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price
        )
        return [Math.min(...prices), Math.max(...prices)]
      },
      getNewArrivals: (days = 30) => {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        return get().products
          .filter(p => new Date(p.createdAt) >= cutoff)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      },
      getBestSellers: (limit = 10) => {
        return [...get().products]
          .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
          .slice(0, limit)
      },
      getRelatedProducts: (productId, limit = 4) => {
        const product = get().getProduct(productId)
        if (!product) return []
        
        return get().products
          .filter(p => 
            p.id !== productId && 
            (p.category === product.category || p.brand === product.brand)
          )
          .sort((a, b) => {
            // Prioritize same category and brand
            const aScore = (a.category === product.category ? 2 : 0) + (a.brand === product.brand ? 1 : 0)
            const bScore = (b.category === product.category ? 2 : 0) + (b.brand === product.brand ? 1 : 0)
            return bScore - aScore
          })
          .slice(0, limit)
      },
      getProductsOnSale: () => {
        return get().products.filter(p => 
          p.discount || p.originalPrice || p.isFlashSale
        )
      },
    }),
    { name: 'soleer-products' }
  )
)

// Cart Store
interface CartState {
  items: CartItem[]
  appliedCoupon: Coupon | null
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getDiscount: () => number
  getTotal: () => number
  getItemCount: () => number
  applyCoupon: (coupon: Coupon) => boolean
  removeCoupon: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.product.id === product.id)
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }
          return { items: [...state.items, { product, quantity }] }
        })
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId),
        }))
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }))
      },
      clearCart: () => set({ items: [], appliedCoupon: null }),
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.isFlashSale && item.product.flashSalePrice 
            ? item.product.flashSalePrice 
            : item.product.price
          return total + price * item.quantity
        }, 0)
      },
      getDiscount: () => {
        const coupon = get().appliedCoupon
        if (!coupon) return 0
        
        const subtotal = get().getSubtotal()
        if (subtotal < coupon.minPurchase) return 0
        
        let discount = 0
        if (coupon.type === 'percentage') {
          discount = subtotal * (coupon.value / 100)
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount
          }
        } else {
          discount = coupon.value
        }
        
        return Math.min(discount, subtotal)
      },
      getTotal: () => {
        return get().getSubtotal() - get().getDiscount()
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
      applyCoupon: (coupon) => {
        const subtotal = get().getSubtotal()
        if (subtotal < coupon.minPurchase) return false
        if (!coupon.active) return false
        if (coupon.usedCount >= coupon.usageLimit) return false
        
        const now = new Date().toISOString()
        if (coupon.validFrom > now || coupon.validUntil < now) return false
        
        set({ appliedCoupon: coupon })
        return true
      },
      removeCoupon: () => set({ appliedCoupon: null }),
    }),
    { name: 'soleer-cart' }
  )
)

// Wishlist Store
interface WishlistState {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  toggleItem: (product: Product) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        set((state) => {
          if (state.items.some(item => item.id === product.id)) return state
          return { items: [...state.items, product] }
        })
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== productId),
        }))
      },
      isInWishlist: (productId) => {
        return get().items.some(item => item.id === productId)
      },
      clearWishlist: () => set({ items: [] }),
      toggleItem: (product) => {
        if (get().isInWishlist(product.id)) {
          get().removeItem(product.id)
        } else {
          get().addItem(product)
        }
      },
    }),
    { name: 'soleer-wishlist' }
  )
)

// Address Store
interface AddressState {
  addresses: Address[]
  addAddress: (address: Omit<Address, 'id'>) => void
  updateAddress: (id: string, data: Partial<Address>) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  getDefaultAddress: () => Address | undefined
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      addAddress: (address) => {
        const newAddress: Address = {
          ...address,
          id: `addr-${Date.now()}`,
        }
        set((state) => {
          const addresses = state.addresses.map(a => ({ ...a, isDefault: false }))
          return { addresses: [...addresses, { ...newAddress, isDefault: true }] }
        })
      },
      updateAddress: (id, data) => {
        set((state) => ({
          addresses: state.addresses.map(a => 
            a.id === id ? { ...a, ...data } : a
          )
        }))
      },
      deleteAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.filter(a => a.id !== id)
        }))
      },
      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map(a => ({
            ...a,
            isDefault: a.id === id
          }))
        }))
      },
      getDefaultAddress: () => get().addresses.find(a => a.isDefault),
    }),
    { name: 'soleer-addresses' }
  )
)

// Orders Store
interface OrdersState {
  orders: Order[]
  createOrder: (order: Omit<Order, 'id' | 'createdAt'>) => string
  updateOrderStatus: (id: string, status: Order['status']) => void
  setTrackingCode: (id: string, trackingCode: string) => void
  getUserOrders: (userId: string) => Order[]
  getAllOrders: () => Order[]
  getOrderById: (id: string) => Order | undefined
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      createOrder: (order) => {
        const orderId = `SH${Date.now().toString().slice(-8)}`
        const newOrder: Order = {
          ...order,
          id: orderId,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ orders: [...state.orders, newOrder] }))
        return orderId
      },
      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map(o => 
            o.id === id ? { ...o, status } : o
          )
        }))
      },
      setTrackingCode: (id, trackingCode) => {
        set((state) => ({
          orders: state.orders.map(o => 
            o.id === id ? { ...o, trackingCode } : o
          )
        }))
      },
      getUserOrders: (userId) => get().orders.filter(o => o.userId === userId),
      getAllOrders: () => get().orders,
      getOrderById: (id) => get().orders.find(o => o.id === id),
    }),
    { name: 'soleer-orders' }
  )
)

// Chat Store
interface ChatState {
  conversations: Conversation[]
  messages: ChatMessage[]
  sendMessage: (conversationId: string, senderId: string, senderName: string, isAdmin: boolean, message: string) => void
  getConversation: (participantId: string) => Conversation | undefined
  getOrCreateConversation: (participantId: string, participantName: string, participantEmail: string) => string
  getMessages: (conversationId: string) => ChatMessage[]
  markAsRead: (conversationId: string, isAdmin: boolean) => void
  getAllConversations: () => Conversation[]
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: [],
      sendMessage: (conversationId, senderId, senderName, isAdmin, message) => {
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          conversationId,
          senderId,
          senderName,
          isAdmin,
          message,
          createdAt: new Date().toISOString(),
          read: false,
        }
        
        set((state) => ({
          messages: [...state.messages, newMessage],
          conversations: state.conversations.map(c => 
            c.id === conversationId ? {
              ...c,
              lastMessage: message,
              lastMessageAt: newMessage.createdAt,
              unreadCount: isAdmin ? c.unreadCount : c.unreadCount + 1,
            } : c
          )
        }))
      },
      getConversation: (participantId) => 
        get().conversations.find(c => c.participantId === participantId),
      getOrCreateConversation: (participantId, participantName, participantEmail) => {
        const existing = get().conversations.find(c => c.participantId === participantId)
        if (existing) return existing.id
        
        const conversationId = `conv-${Date.now()}`
        const newConversation: Conversation = {
          id: conversationId,
          participantId,
          participantName,
          participantEmail,
          lastMessage: '',
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
        }
        
        set((state) => ({
          conversations: [...state.conversations, newConversation]
        }))
        
        return conversationId
      },
      getMessages: (conversationId) => 
        get().messages.filter(m => m.conversationId === conversationId),
      markAsRead: (conversationId, isAdmin) => {
        set((state) => ({
          messages: state.messages.map(m => 
            m.conversationId === conversationId && m.isAdmin !== isAdmin
              ? { ...m, read: true }
              : m
          ),
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? { ...c, unreadCount: 0 }
              : c
          )
        }))
      },
      getAllConversations: () => get().conversations,
    }),
    { name: 'soleer-chat' }
  )
)

// Reviews Store
interface ReviewsState {
  reviews: Review[]
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'helpful' | 'approved'>) => void
  updateReview: (id: string, data: Partial<Review>) => void
  deleteReview: (id: string) => void
  approveReview: (id: string) => void
  getProductReviews: (productId: string) => Review[]
  getUserReviews: (userId: string) => Review[]
  getPendingReviews: () => Review[]
  incrementHelpful: (id: string) => void
  getAverageRating: (productId: string) => number
}

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: [],
      addReview: (review) => {
        const newReview: Review = {
          ...review,
          id: `rev-${Date.now()}`,
          helpful: 0,
          approved: false,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ reviews: [...state.reviews, newReview] }))
        
        // Update product rating
        const productReviews = [...get().reviews, newReview].filter(r => r.productId === review.productId && r.approved)
        if (productReviews.length > 0) {
          const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
          useProductsStore.getState().updateProduct(review.productId, { 
            rating: Math.round(avgRating * 10) / 10,
            reviews: productReviews.length 
          })
        }
      },
      updateReview: (id, data) => {
        set((state) => ({
          reviews: state.reviews.map(r => 
            r.id === id ? { ...r, ...data } : r
          )
        }))
      },
      deleteReview: (id) => {
        const review = get().reviews.find(r => r.id === id)
        set((state) => ({
          reviews: state.reviews.filter(r => r.id !== id)
        }))
        
        // Update product rating
        if (review) {
          const productReviews = get().reviews.filter(r => r.productId === review.productId && r.approved)
          if (productReviews.length > 0) {
            const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
            useProductsStore.getState().updateProduct(review.productId, { 
              rating: Math.round(avgRating * 10) / 10,
              reviews: productReviews.length 
            })
          } else {
            useProductsStore.getState().updateProduct(review.productId, { rating: 0, reviews: 0 })
          }
        }
      },
      approveReview: (id) => {
        const review = get().reviews.find(r => r.id === id)
        if (!review) return
        
        set((state) => ({
          reviews: state.reviews.map(r => 
            r.id === id ? { ...r, approved: true } : r
          )
        }))
        
        // Update product rating
        const productReviews = get().reviews.filter(r => r.productId === review.productId && (r.approved || r.id === id))
        if (productReviews.length > 0) {
          const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
          useProductsStore.getState().updateProduct(review.productId, { 
            rating: Math.round(avgRating * 10) / 10,
            reviews: productReviews.length 
          })
        }
      },
      getProductReviews: (productId) => 
        get().reviews.filter(r => r.productId === productId && r.approved),
      getUserReviews: (userId) => 
        get().reviews.filter(r => r.userId === userId),
      getPendingReviews: () => 
        get().reviews.filter(r => !r.approved),
      incrementHelpful: (id) => {
        set((state) => ({
          reviews: state.reviews.map(r => 
            r.id === id ? { ...r, helpful: r.helpful + 1 } : r
          )
        }))
      },
      getAverageRating: (productId) => {
        const reviews = get().reviews.filter(r => r.productId === productId && r.approved)
        if (reviews.length === 0) return 0
        return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      },
    }),
    { name: 'soleer-reviews' }
  )
)

// Coupons Store
interface CouponsState {
  coupons: Coupon[]
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => void
  updateCoupon: (id: string, data: Partial<Coupon>) => void
  deleteCoupon: (id: string) => void
  getCouponByCode: (code: string) => Coupon | undefined
  validateCoupon: (code: string, cartTotal: number) => { valid: boolean; message: string; coupon?: Coupon }
  useCoupon: (code: string) => void
  getAllCoupons: () => Coupon[]
}

export const useCouponsStore = create<CouponsState>()(
  persist(
    (set, get) => ({
      coupons: [],
      addCoupon: (coupon) => {
        const newCoupon: Coupon = {
          ...coupon,
          id: `coup-${Date.now()}`,
          usedCount: 0,
        }
        set((state) => ({ coupons: [...state.coupons, newCoupon] }))
      },
      updateCoupon: (id, data) => {
        set((state) => ({
          coupons: state.coupons.map(c => 
            c.id === id ? { ...c, ...data } : c
          )
        }))
      },
      deleteCoupon: (id) => {
        set((state) => ({
          coupons: state.coupons.filter(c => c.id !== id)
        }))
      },
      getCouponByCode: (code) => 
        get().coupons.find(c => c.code.toUpperCase() === code.toUpperCase()),
      validateCoupon: (code, cartTotal) => {
        const coupon = get().getCouponByCode(code)
        
        if (!coupon) {
          return { valid: false, message: 'Cupom não encontrado' }
        }
        
        if (!coupon.active) {
          return { valid: false, message: 'Este cupom está inativo' }
        }
        
        const now = new Date().toISOString()
        if (coupon.validFrom > now) {
          return { valid: false, message: 'Este cupom ainda não está válido' }
        }
        
        if (coupon.validUntil < now) {
          return { valid: false, message: 'Este cupom expirou' }
        }
        
        if (coupon.usedCount >= coupon.usageLimit) {
          return { valid: false, message: 'Este cupom atingiu o limite de uso' }
        }
        
        if (cartTotal < coupon.minPurchase) {
          return { valid: false, message: `Compra mínima de R$ ${coupon.minPurchase.toFixed(2)}` }
        }
        
        return { valid: true, message: 'Cupom aplicado com sucesso!', coupon }
      },
      useCoupon: (code) => {
        set((state) => ({
          coupons: state.coupons.map(c => 
            c.code.toUpperCase() === code.toUpperCase() 
              ? { ...c, usedCount: c.usedCount + 1 } 
              : c
          )
        }))
      },
      getAllCoupons: () => get().coupons,
    }),
    { name: 'soleer-coupons' }
  )
)

// Categories Store
interface CategoriesState {
  categories: Category[]
  addCategory: (category: Omit<Category, 'id' | 'productCount'>) => void
  updateCategory: (id: string, data: Partial<Category>) => void
  deleteCategory: (id: string) => void
  getCategoryBySlug: (slug: string) => Category | undefined
  getAllCategories: () => Category[]
  getFeaturedCategories: () => Category[]
  updateProductCount: (categorySlug: string) => void
}

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set, get) => ({
      categories: [
        { id: 'cat-1', name: 'Smartphones', slug: 'smartphones', icon: 'smartphone', productCount: 0, featured: true },
        { id: 'cat-2', name: 'Notebooks', slug: 'notebooks', icon: 'laptop', productCount: 0, featured: true },
        { id: 'cat-3', name: 'Games & Consoles', slug: 'games', icon: 'gamepad-2', productCount: 0, featured: true },
        { id: 'cat-4', name: 'Hardware', slug: 'hardware', icon: 'cpu', productCount: 0 },
        { id: 'cat-5', name: 'Periféricos', slug: 'perifericos', icon: 'mouse', productCount: 0, featured: true },
        { id: 'cat-6', name: 'Monitores', slug: 'monitores', icon: 'monitor', productCount: 0 },
        { id: 'cat-7', name: 'Áudio', slug: 'audio', icon: 'headphones', productCount: 0, featured: true },
        { id: 'cat-8', name: 'Acessórios', slug: 'acessorios', icon: 'cable', productCount: 0 },
      ],
      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: `cat-${Date.now()}`,
          productCount: 0,
        }
        set((state) => ({ categories: [...state.categories, newCategory] }))
      },
      updateCategory: (id, data) => {
        set((state) => ({
          categories: state.categories.map(c => 
            c.id === id ? { ...c, ...data } : c
          )
        }))
      },
      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter(c => c.id !== id)
        }))
      },
      getCategoryBySlug: (slug) => 
        get().categories.find(c => c.slug === slug),
      getAllCategories: () => get().categories,
      getFeaturedCategories: () => get().categories.filter(c => c.featured),
      updateProductCount: (categorySlug) => {
        const products = useProductsStore.getState().getProductsByCategory(categorySlug)
        set((state) => ({
          categories: state.categories.map(c => 
            c.slug === categorySlug ? { ...c, productCount: products.length } : c
          )
        }))
      },
    }),
    { name: 'soleer-categories' }
  )
)

// Notifications Store
interface NotificationsState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: (userId: string) => void
  deleteNotification: (id: string) => void
  clearAll: (userId: string) => void
  getUserNotifications: (userId: string) => Notification[]
  getUnreadCount: (userId: string) => number
  notifyWishlistSale: (userId: string, productName: string, productId: string) => void
  notifyFlashSale: (userId: string, productName: string, productId: string, discount: number) => void
  notifyOrderUpdate: (userId: string, orderId: string, status: string) => void
  notifyCouponAvailable: (userId: string, couponCode: string, discount: string) => void
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}`,
          read: false,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ notifications: [newNotification, ...state.notifications] }))
      },
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          )
        }))
      },
      markAllAsRead: (userId) => {
        set((state) => ({
          notifications: state.notifications.map(n => 
            n.userId === userId ? { ...n, read: true } : n
          )
        }))
      },
      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },
      clearAll: (userId) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.userId !== userId)
        }))
      },
      getUserNotifications: (userId) => 
        get().notifications.filter(n => n.userId === userId),
      getUnreadCount: (userId) => 
        get().notifications.filter(n => n.userId === userId && !n.read).length,
      notifyWishlistSale: (userId, productName, productId) => {
        get().addNotification({
          userId,
          type: 'wishlist',
          title: 'Produto em promoção!',
          message: `${productName} da sua lista de desejos está em promoção!`,
          link: `/product/${productId}`,
          actionText: 'Ver produto',
        })
      },
      notifyFlashSale: (userId, productName, productId, discount) => {
        get().addNotification({
          userId,
          type: 'flash_sale',
          title: 'Flash Sale começou!',
          message: `${productName} com ${discount}% de desconto por tempo limitado!`,
          link: `/product/${productId}`,
          actionText: 'Comprar agora',
        })
      },
      notifyOrderUpdate: (userId, orderId, status) => {
        const statusMessages: Record<string, string> = {
          processing: 'está sendo processado',
          shipped: 'foi enviado',
          completed: 'foi entregue',
          cancelled: 'foi cancelado',
        }
        get().addNotification({
          userId,
          type: 'order',
          title: 'Atualização do pedido',
          message: `Seu pedido #${orderId} ${statusMessages[status] || status}`,
          link: `/profile?tab=orders`,
          actionText: 'Ver pedido',
        })
      },
      notifyCouponAvailable: (userId, couponCode, discount) => {
        get().addNotification({
          userId,
          type: 'coupon',
          title: 'Cupom disponível!',
          message: `Use o cupom ${couponCode} e ganhe ${discount} de desconto!`,
          link: `/coupons`,
          actionText: 'Ver cupons',
        })
      },
    }),
    { name: 'soleer-notifications' }
  )
)

// Search History Store
interface SearchHistoryState {
  history: SearchHistory[]
  addSearch: (userId: string, query: string) => void
  removeSearch: (id: string) => void
  clearHistory: (userId: string) => void
  getUserHistory: (userId: string) => SearchHistory[]
  getPopularSearches: () => string[]
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      addSearch: (userId, query) => {
        const trimmedQuery = query.trim().toLowerCase()
        if (!trimmedQuery) return
        
        // Remove duplicate
        set((state) => ({
          history: state.history.filter(h => 
            !(h.userId === userId && h.query.toLowerCase() === trimmedQuery)
          )
        }))
        
        const newSearch: SearchHistory = {
          id: `search-${Date.now()}`,
          userId,
          query: trimmedQuery,
          timestamp: new Date().toISOString(),
        }
        set((state) => ({ 
          history: [newSearch, ...state.history].slice(0, 100) // Keep last 100
        }))
      },
      removeSearch: (id) => {
        set((state) => ({
          history: state.history.filter(h => h.id !== id)
        }))
      },
      clearHistory: (userId) => {
        set((state) => ({
          history: state.history.filter(h => h.userId !== userId)
        }))
      },
      getUserHistory: (userId) => 
        get().history.filter(h => h.userId === userId).slice(0, 10),
      getPopularSearches: () => {
        const searches = get().history
        const counts: Record<string, number> = {}
        searches.forEach(s => {
          counts[s.query] = (counts[s.query] || 0) + 1
        })
        return Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([query]) => query)
      },
    }),
    { name: 'soleer-search-history' }
  )
)

// Product Comparison Store
interface ComparisonState {
  products: Product[]
  maxProducts: number
  addProduct: (product: Product) => boolean
  removeProduct: (productId: string) => void
  clearComparison: () => void
  isInComparison: (productId: string) => boolean
  canAddMore: () => boolean
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      products: [],
      maxProducts: 4,
      addProduct: (product) => {
        if (get().products.length >= get().maxProducts) return false
        if (get().isInComparison(product.id)) return false
        set((state) => ({ products: [...state.products, product] }))
        return true
      },
      removeProduct: (productId) => {
        set((state) => ({
          products: state.products.filter(p => p.id !== productId)
        }))
      },
      clearComparison: () => set({ products: [] }),
      isInComparison: (productId) => get().products.some(p => p.id === productId),
      canAddMore: () => get().products.length < get().maxProducts,
    }),
    { name: 'soleer-comparison' }
  )
)

// Recently Viewed Products Store
interface RecentlyViewedState {
  products: Product[]
  maxProducts: number
  addProduct: (product: Product) => void
  clearHistory: () => void
  getRecentProducts: (limit?: number) => Product[]
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      products: [],
      maxProducts: 20,
      addProduct: (product) => {
        set((state) => {
          // Remove if already exists
          const filtered = state.products.filter(p => p.id !== product.id)
          // Add to beginning
          return { products: [product, ...filtered].slice(0, state.maxProducts) }
        })
      },
      clearHistory: () => set({ products: [] }),
      getRecentProducts: (limit = 10) => get().products.slice(0, limit),
    }),
    { name: 'soleer-recently-viewed' }
  )
)

// Order Tracking Store
export interface TrackingEvent {
  id: string
  orderId: string
  status: string
  description: string
  location?: string
  timestamp: string
}

interface OrderTrackingState {
  events: TrackingEvent[]
  addEvent: (orderId: string, status: string, description: string, location?: string) => void
  getOrderEvents: (orderId: string) => TrackingEvent[]
  getLatestEvent: (orderId: string) => TrackingEvent | undefined
}

export const useOrderTrackingStore = create<OrderTrackingState>()(
  persist(
    (set, get) => ({
      events: [],
      addEvent: (orderId, status, description, location) => {
        const newEvent: TrackingEvent = {
          id: `track-${Date.now()}`,
          orderId,
          status,
          description,
          location,
          timestamp: new Date().toISOString(),
        }
        set((state) => ({ events: [...state.events, newEvent] }))
      },
      getOrderEvents: (orderId) => 
        get().events.filter(e => e.orderId === orderId).sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
      getLatestEvent: (orderId) => {
        const events = get().getOrderEvents(orderId)
        return events[0]
      },
    }),
    { name: 'soleer-order-tracking' }
  )
)

// Price Alert Store
export interface PriceAlert {
  id: string
  userId: string
  productId: string
  productName: string
  targetPrice: number
  currentPrice: number
  active: boolean
  createdAt: string
  triggeredAt?: string
}

interface PriceAlertState {
  alerts: PriceAlert[]
  addAlert: (userId: string, productId: string, productName: string, targetPrice: number, currentPrice: number) => void
  removeAlert: (id: string) => void
  getUserAlerts: (userId: string) => PriceAlert[]
  getProductAlerts: (productId: string) => PriceAlert[]
  triggerAlert: (id: string) => void
  checkAlerts: (productId: string, newPrice: number) => PriceAlert[]
}

export const usePriceAlertStore = create<PriceAlertState>()(
  persist(
    (set, get) => ({
      alerts: [],
      addAlert: (userId, productId, productName, targetPrice, currentPrice) => {
        // Check if alert already exists
        const existing = get().alerts.find(a => 
          a.userId === userId && a.productId === productId && a.active
        )
        if (existing) return

        const newAlert: PriceAlert = {
          id: `alert-${Date.now()}`,
          userId,
          productId,
          productName,
          targetPrice,
          currentPrice,
          active: true,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ alerts: [...state.alerts, newAlert] }))
      },
      removeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter(a => a.id !== id)
        }))
      },
      getUserAlerts: (userId) => get().alerts.filter(a => a.userId === userId),
      getProductAlerts: (productId) => get().alerts.filter(a => a.productId === productId && a.active),
      triggerAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map(a => 
            a.id === id ? { ...a, active: false, triggeredAt: new Date().toISOString() } : a
          )
        }))
      },
      checkAlerts: (productId, newPrice) => {
        const activeAlerts = get().alerts.filter(a => 
          a.productId === productId && a.active && newPrice <= a.targetPrice
        )
        return activeAlerts
      },
    }),
    { name: 'soleer-price-alerts' }
  )
)

// Store Settings Store
export interface StoreSettings {
  storeName: string
  contactEmail: string
  contactPhone: string
  freeShippingThreshold: number
  defaultShippingCost: number
  pixDiscountPercent: number
  boletoExpirationDays: number
  pixEnabled: boolean
  boletoEnabled: boolean
}

interface StoreSettingsState {
  settings: StoreSettings
  updateSettings: (data: Partial<StoreSettings>) => void
  getSettings: () => StoreSettings
}

export const useStoreSettingsStore = create<StoreSettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        storeName: 'Soleer Hub',
        contactEmail: 'contato@soleerhub.com',
        contactPhone: '(11) 99999-9999',
        freeShippingThreshold: 299,
        defaultShippingCost: 29.90,
        pixDiscountPercent: 10,
        boletoExpirationDays: 3,
        pixEnabled: true,
        boletoEnabled: true,
      },
      updateSettings: (data) => {
        set((state) => ({ settings: { ...state.settings, ...data } }))
      },
      getSettings: () => get().settings,
    }),
    { name: 'soleer-store-settings' }
  )
)
