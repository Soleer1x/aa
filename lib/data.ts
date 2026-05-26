import { Product, Category } from './store'

// Remove all pre-created products - Admin will add products
export const products: Product[] = []

export const categories = [
  { id: 'smartphones', name: 'Smartphones', icon: 'smartphone', count: 0, slug: 'smartphones' },
  { id: 'notebooks', name: 'Notebooks', icon: 'laptop', count: 0, slug: 'notebooks' },
  { id: 'games', name: 'Games & Consoles', icon: 'gamepad-2', count: 0, slug: 'games' },
  { id: 'hardware', name: 'Hardware', icon: 'cpu', count: 0, slug: 'hardware' },
  { id: 'perifericos', name: 'Periféricos', icon: 'mouse', count: 0, slug: 'perifericos' },
  { id: 'monitores', name: 'Monitores', icon: 'monitor', count: 0, slug: 'monitores' },
  { id: 'audio', name: 'Áudio', icon: 'headphones', count: 0, slug: 'audio' },
  { id: 'acessorios', name: 'Acessórios', icon: 'cable', count: 0, slug: 'acessorios' },
]

export const brands = [
  'Apple', 'Samsung', 'Sony', 'Microsoft', 'NVIDIA', 'AMD', 'Razer', 
  'Logitech', 'SteelSeries', 'HyperX', 'Corsair', 'ASUS', 'MSI',
  'LG', 'Dell', 'HP', 'Lenovo', 'Acer', 'JBL', 'Bose', 'Xiaomi',
  'Motorola', 'Google', 'OnePlus', 'Realme', 'POCO'
]

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

export const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export const formatDateShort = (dateString: string) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString))
}

export const getTimeRemaining = (endTime: string) => {
  const total = new Date(endTime).getTime() - Date.now()
  
  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  
  return { total, days, hours, minutes, seconds }
}

export const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export const getDiscountPercentage = (originalPrice: number, currentPrice: number) => {
  if (!originalPrice || originalPrice <= currentPrice) return 0
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

export const getCategoryIcon = (iconName: string) => {
  const icons: Record<string, string> = {
    'smartphone': 'Smartphone',
    'laptop': 'Laptop',
    'gamepad-2': 'Gamepad2',
    'cpu': 'Cpu',
    'mouse': 'Mouse',
    'monitor': 'Monitor',
    'headphones': 'Headphones',
    'cable': 'Cable',
  }
  return icons[iconName] || 'Package'
}

export const orderStatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Aguardando Pagamento', color: 'bg-yellow-500' },
  processing: { label: 'Em Processamento', color: 'bg-blue-500' },
  shipped: { label: 'Enviado', color: 'bg-purple-500' },
  completed: { label: 'Entregue', color: 'bg-green-500' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500' },
}

export const adminRoleLabels: Record<string, { label: string; description: string }> = {
  super_admin: { 
    label: 'Super Admin', 
    description: 'Acesso total ao sistema, incluindo gerenciamento de outros admins' 
  },
  admin: { 
    label: 'Administrador', 
    description: 'Gerencia produtos, pedidos, usuários, avaliações, cupons e chat' 
  },
  moderator: { 
    label: 'Moderador', 
    description: 'Modera avaliações, responde chat e visualiza pedidos' 
  },
}

export const notificationTypeIcons: Record<string, { icon: string; color: string }> = {
  order: { icon: 'Package', color: 'text-blue-500' },
  promo: { icon: 'Tag', color: 'text-green-500' },
  system: { icon: 'Bell', color: 'text-gray-500' },
  review: { icon: 'Star', color: 'text-yellow-500' },
  wishlist: { icon: 'Heart', color: 'text-pink-500' },
  flash_sale: { icon: 'Zap', color: 'text-orange-500' },
  coupon: { icon: 'Ticket', color: 'text-purple-500' },
}

export const sortOptions = [
  { value: 'relevance', label: 'Mais Relevantes' },
  { value: 'price_asc', label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
  { value: 'rating', label: 'Melhor Avaliação' },
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'bestseller', label: 'Mais Vendidos' },
]

export const couponTypeLabels: Record<string, string> = {
  percentage: 'Porcentagem',
  fixed: 'Valor Fixo',
}

export const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'agora mesmo'
  if (diffMins < 60) return `há ${diffMins} min`
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays < 7) return `há ${diffDays}d`
  return formatDateShort(dateString)
}

export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
}
