import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  Settings,
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  TrendingUp,
  DollarSign,
  Clock
} from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    oldPrice: 0,
    stock: 0,
    category: '',
    images: [''],
    discount: 0,
    rating: 5,
    reviews: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsSnap, ordersSnap, usersSnap] = await Promise.all([
        getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'users'))
      ]);

      setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCustomers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        ...productForm,
        createdAt: new Date().toISOString()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Produto atualizado!');
      } else {
        await addDoc(collection(db, 'products'), productData);
        toast.success('Produto criado!');
      }

      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: 0,
        oldPrice: 0,
        stock: 0,
        category: '',
        images: [''],
        discount: 0,
        rating: 5,
        reviews: 0
      });
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar produto');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;

    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Produto excluído!');
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir produto');
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice || 0,
      stock: product.stock,
      category: product.category,
      images: product.images || [''],
      discount: product.discount || 0,
      rating: product.rating || 5,
      reviews: product.reviews || 0
    });
    setShowProductModal(true);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: new Date().toISOString()
      });
      toast.success('Status atualizado!');
      loadData();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const getOrderStatusColor = (order: any) => {
    if (order.status === 'paid') return 'text-green-600';

    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff <= 12) return 'text-green-600';
    if (hoursDiff <= 24) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOrderStatusBadge = (order: any) => {
    if (order.status === 'paid') return '🟢';

    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff <= 12) return '🟢';
    if (hoursDiff <= 24) return '🟡';
    return '🔴';
  };

  const stats = {
    totalSales: orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.total, 0),
    totalOrders: orders.length,
    totalProducts: products.length,
    totalCustomers: customers.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length
  };

  const salesData = [
    { name: 'Jan', vendas: 4000 },
    { name: 'Fev', vendas: 3000 },
    { name: 'Mar', vendas: 5000 },
    { name: 'Abr', vendas: 7000 },
    { name: 'Mai', vendas: 9000 }
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#e50914] text-white p-6">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-white/80">Soleer Hub - Gerenciamento Completo</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-2 sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#e50914] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-4">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-8 h-8 text-green-600" />
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-gray-600 text-sm">Vendas Totais</p>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {stats.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <ShoppingBag className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-gray-600 text-sm">Pedidos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <Package className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-gray-600 text-sm">Produtos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <Users className="w-8 h-8 text-orange-600 mb-2" />
                    <p className="text-gray-600 text-sm">Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Vendas Mensais</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="vendas" fill="#e50914" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Crescimento</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="vendas" stroke="#e50914" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Pedidos Recentes</h3>
                  <div className="space-y-2">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getOrderStatusBadge(order)}</span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.customer?.name || 'Cliente'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-[#e50914]">
                          R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Products */}
            {activeTab === 'products' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Produtos</h2>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({
                          name: '',
                          description: '',
                          price: 0,
                          oldPrice: 0,
                          stock: 0,
                          category: '',
                          images: [''],
                          discount: 0,
                          rating: 5,
                          reviews: 0
                        });
                        setShowProductModal(true);
                      }}
                      className="bg-[#e50914] hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Novo Produto
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        <img
                          src={product.images?.[0] || 'https://via.placeholder.com/300'}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <p className="text-xl font-bold text-[#e50914] mb-3">
                            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Pedidos</h2>

                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getOrderStatusBadge(order)}</span>
                            <div>
                              <p className="font-bold text-gray-900">
                                {order.customer?.name || 'Cliente'}
                              </p>
                              <p className="text-sm text-gray-600">{order.customer?.email}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#e50914]">
                              R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-gray-600">{order.paymentMethod?.toUpperCase()}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => updateOrderStatus(order.id, 'paid')}
                            disabled={order.status === 'paid'}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors text-sm"
                          >
                            Aprovar Pagamento
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Customers */}
            {activeTab === 'customers' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Clientes</h2>

                  <div className="space-y-3">
                    {customers.map((customer) => {
                      const customerOrders = orders.filter(o => o.userId === customer.uid);
                      const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);

                      return (
                        <div key={customer.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-gray-900">{customer.displayName}</p>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                              <p className="text-xs text-gray-500">
                                Cadastro: {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-[#e50914]">
                                R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-sm text-gray-600">
                                {customerOrders.length} pedido(s)
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <input
                  type="text"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                <input
                  type="url"
                  value={productForm.images[0]}
                  onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                  placeholder="https://exemplo.com/imagem.jpg"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#e50914] hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                >
                  {editingProduct ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
