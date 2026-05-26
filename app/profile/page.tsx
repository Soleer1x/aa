'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, MapPin, Package, Heart, Settings, LogOut, ChevronRight,
  Plus, Edit, Trash2, Check, X, MessageCircle, Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/logo'
import { useAuthStore, useAddressStore, useOrdersStore, useWishlistStore, useChatStore } from '@/lib/store'
import { formatPrice } from '@/lib/data'

type Tab = 'profile' | 'addresses' | 'orders' | 'wishlist' | 'chat'

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const { user, logout, updateUser, isAuthenticated } = useAuthStore()
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddressStore()
  const { getUserOrders } = useOrdersStore()
  const wishlist = useWishlistStore()
  const { getOrCreateConversation, getMessages, sendMessage } = useChatStore()

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cpf: user?.cpf || '',
  })

  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState({
    label: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  })

  const [chatMessage, setChatMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user) {
    return null
  }

  const userOrders = getUserOrders(user.id)
  const conversationId = getOrCreateConversation(user.id, user.name, user.email)
  const chatMessages = getMessages(conversationId)

  const handleUpdateProfile = () => {
    updateUser(editData)
    setIsEditing(false)
  }

  const handleAddAddress = () => {
    addAddress(addressForm)
    setAddressForm({
      label: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    })
    setShowAddressForm(false)
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return
    sendMessage(conversationId, user.id, user.name, false, chatMessage)
    setChatMessage('')
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const menuItems = [
    { id: 'profile' as Tab, label: 'Meus Dados', icon: User },
    { id: 'addresses' as Tab, label: 'Endereços', icon: MapPin },
    { id: 'orders' as Tab, label: 'Meus Pedidos', icon: Package },
    { id: 'wishlist' as Tab, label: 'Favoritos', icon: Heart },
    { id: 'chat' as Tab, label: 'Chat com Vendedor', icon: MessageCircle },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-lg z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              {/* User Info */}
              <div className="text-center mb-6 pb-6 border-b border-border">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-4xl font-bold text-white">
                    {user.name.charAt(0)}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="font-bold text-lg mt-4">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cliente desde {new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">Meus Dados</h2>
                      {!isEditing ? (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="ghost" onClick={() => setIsEditing(false)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                          <Button className="gradient-primary" onClick={handleUpdateProfile}>
                            <Check className="w-4 h-4 mr-2" />
                            Salvar
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nome Completo</label>
                        {isEditing ? (
                          <Input
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="h-12"
                          />
                        ) : (
                          <p className="h-12 flex items-center px-4 bg-secondary rounded-lg">{user.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">E-mail</label>
                        {isEditing ? (
                          <Input
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            className="h-12"
                          />
                        ) : (
                          <p className="h-12 flex items-center px-4 bg-secondary rounded-lg">{user.email}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CPF</label>
                        {isEditing ? (
                          <Input
                            value={editData.cpf}
                            onChange={(e) => setEditData({ ...editData, cpf: e.target.value })}
                            className="h-12"
                          />
                        ) : (
                          <p className="h-12 flex items-center px-4 bg-secondary rounded-lg">{user.cpf || 'Não informado'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Telefone</label>
                        {isEditing ? (
                          <Input
                            value={editData.phone}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            className="h-12"
                          />
                        ) : (
                          <p className="h-12 flex items-center px-4 bg-secondary rounded-lg">{user.phone || 'Não informado'}</p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
                      <div className="text-center p-4 bg-secondary/50 rounded-xl">
                        <p className="text-2xl font-bold text-primary">{userOrders.length}</p>
                        <p className="text-sm text-muted-foreground">Pedidos</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/50 rounded-xl">
                        <p className="text-2xl font-bold text-primary">{wishlist.items.length}</p>
                        <p className="text-sm text-muted-foreground">Favoritos</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/50 rounded-xl">
                        <p className="text-2xl font-bold text-primary">{addresses.length}</p>
                        <p className="text-sm text-muted-foreground">Endereços</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Meus Endereços</h2>
                      <Button className="gradient-primary" onClick={() => setShowAddressForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>

                    {/* Address Form */}
                    <AnimatePresence>
                      {showAddressForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-card rounded-2xl border border-border p-6"
                        >
                          <h3 className="font-semibold mb-4">Novo Endereço</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium mb-2">Nome do Endereço</label>
                              <Input
                                value={addressForm.label}
                                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                                placeholder="Ex: Casa, Trabalho..."
                                className="h-12"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">CEP</label>
                              <Input
                                value={addressForm.cep}
                                onChange={(e) => setAddressForm({ ...addressForm, cep: e.target.value })}
                                placeholder="00000-000"
                                className="h-12"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Estado</label>
                              <Input
                                value={addressForm.state}
                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                placeholder="UF"
                                className="h-12"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium mb-2">Rua</label>
                              <Input
                                value={addressForm.street}
                                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                placeholder="Nome da rua"
                                className="h-12"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Número</label>
                              <Input
                                value={addressForm.number}
                                onChange={(e) => setAddressForm({ ...addressForm, number: e.target.value })}
                                placeholder="123"
                                className="h-12"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Complemento</label>
                              <Input
                                value={addressForm.complement}
                                onChange={(e) => setAddressForm({ ...addressForm, complement: e.target.value })}
                                placeholder="Apto, Bloco..."
                                className="h-12"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Bairro</label>
                              <Input
                                value={addressForm.neighborhood}
                                onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                                placeholder="Bairro"
                                className="h-12"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Cidade</label>
                              <Input
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                placeholder="Cidade"
                                className="h-12"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-6">
                            <Button variant="outline" onClick={() => setShowAddressForm(false)}>
                              Cancelar
                            </Button>
                            <Button className="gradient-primary" onClick={handleAddAddress}>
                              Salvar Endereço
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Address List */}
                    {addresses.length === 0 ? (
                      <div className="bg-card rounded-2xl border border-border p-12 text-center">
                        <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="font-semibold mb-2">Nenhum endereço cadastrado</h3>
                        <p className="text-muted-foreground">Adicione um endereço para facilitar suas compras</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className={`bg-card rounded-2xl border p-6 ${
                              address.isDefault ? 'border-primary' : 'border-border'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{address.label}</span>
                                {address.isDefault && (
                                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                    Padrão
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="w-8 h-8">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 text-destructive"
                                  onClick={() => deleteAddress(address.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {address.street}, {address.number}
                              {address.complement && ` - ${address.complement}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.neighborhood} - {address.city}/{address.state}
                            </p>
                            <p className="text-sm text-muted-foreground">CEP: {address.cep}</p>
                            {!address.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => setDefaultAddress(address.id)}
                              >
                                Definir como padrão
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold">Meus Pedidos</h2>

                    {userOrders.length === 0 ? (
                      <div className="bg-card rounded-2xl border border-border p-12 text-center">
                        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="font-semibold mb-2">Nenhum pedido realizado</h3>
                        <p className="text-muted-foreground mb-4">Explore nossos produtos e faça seu primeiro pedido!</p>
                        <Link href="/">
                          <Button className="gradient-primary">Ver Produtos</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userOrders.map((order) => (
                          <div key={order.id} className="bg-card rounded-2xl border border-border p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className="font-mono font-semibold">#{order.id}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                order.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                order.status === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                                order.status === 'shipped' ? 'bg-purple-500/10 text-purple-500' :
                                order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                'bg-yellow-500/10 text-yellow-500'
                              }`}>
                                {order.status === 'completed' ? 'Entregue' :
                                 order.status === 'processing' ? 'Em preparo' :
                                 order.status === 'shipped' ? 'Enviado' :
                                 order.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div key={item.product.id} className="flex items-center gap-4">
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                                  </div>
                                  <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-border space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                  Pagamento: {order.paymentMethod === 'pix' ? 'PIX' : 'Boleto'}
                                </p>
                                <p className="text-lg font-bold text-primary">{formatPrice(order.total)}</p>
                              </div>
                              {order.trackingCode && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground">Rastreio:</span>
                                  <code className="px-2 py-0.5 bg-secondary rounded font-mono text-xs">{order.trackingCode}</code>
                                </div>
                              )}
                              <div className="flex justify-end">
                                <Link href={`/tracking/${order.id}`}>
                                  <Button size="sm" variant="outline">Rastrear Pedido</Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Wishlist Tab */}
                {activeTab === 'wishlist' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold">Meus Favoritos</h2>

                    {wishlist.items.length === 0 ? (
                      <div className="bg-card rounded-2xl border border-border p-12 text-center">
                        <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="font-semibold mb-2">Nenhum favorito ainda</h3>
                        <p className="text-muted-foreground mb-4">Adicione produtos aos favoritos para encontrá-los facilmente</p>
                        <Link href="/">
                          <Button className="gradient-primary">Ver Produtos</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {wishlist.items.map((product) => (
                          <div key={product.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                              <h3 className="font-medium line-clamp-2">{product.name}</h3>
                              <p className="text-lg font-bold text-primary mt-2">{formatPrice(product.price)}</p>
                              <div className="flex gap-2 mt-4">
                                <Link href={`/product/${product.id}`} className="flex-1">
                                  <Button variant="outline" className="w-full">Ver</Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => wishlist.removeItem(product.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                  <div className="bg-card rounded-2xl border border-border overflow-hidden h-[600px] flex flex-col">
                    <div className="p-4 border-b border-border bg-secondary/50">
                      <h2 className="font-semibold">Chat com Vendedor</h2>
                      <p className="text-sm text-muted-foreground">Soleer Hub - Suporte</p>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Inicie uma conversa com nosso suporte!</p>
                        </div>
                      ) : (
                        chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                msg.isAdmin
                                  ? 'bg-secondary text-foreground'
                                  : 'bg-primary text-primary-foreground'
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                              <p className={`text-xs mt-1 ${msg.isAdmin ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border">
                      <div className="flex gap-2">
                        <Input
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder="Digite sua mensagem..."
                          className="h-12"
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button className="gradient-primary h-12 px-6" onClick={handleSendMessage}>
                          Enviar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}
