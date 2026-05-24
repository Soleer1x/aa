import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, MapPin, Package, Heart, Settings, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [newAddress, setNewAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
    isPrimary: false
  });

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setUserData(data);
      setFormData({
        displayName: data.displayName || '',
        email: data.email || '',
        phone: data.phone || '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile({
        displayName: formData.displayName,
        phone: formData.phone
      });
      toast.success('Dados atualizados com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const addresses = userData?.addresses || [];

      if (newAddress.isPrimary) {
        addresses.forEach((addr: any) => (addr.isPrimary = false));
      }

      addresses.push({ ...newAddress, id: Date.now().toString() });

      await updateDoc(doc(db, 'users', user.uid), { addresses });
      setUserData({ ...userData, addresses });

      setNewAddress({
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        cep: '',
        isPrimary: false
      });

      toast.success('Endereço adicionado!');
    } catch (error) {
      toast.error('Erro ao adicionar endereço');
    }
  };

  const tabs = [
    { id: 'account', label: 'Minha Conta', icon: User },
    { id: 'addresses', label: 'Endereços', icon: MapPin },
    { id: 'orders', label: 'Pedidos', icon: Package },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'security', label: 'Segurança', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meu Perfil</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-br from-[#e50914] to-red-700 p-6 text-white text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white text-[#e50914] p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-lg">{user?.displayName || 'Usuário'}</h3>
                <p className="text-white/80 text-sm truncate">{user?.email}</p>
              </div>

              {/* Navigation */}
              <div className="p-2">
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
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Account Tab */}
              {activeTab === 'account' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Dados da Conta</h2>

                  <form onSubmit={handleUpdateAccount} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) =>
                          setFormData({ ...formData, displayName: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#e50914] hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Meus Endereços</h2>

                  {/* Existing Addresses */}
                  {userData?.addresses && userData.addresses.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {userData.addresses.map((addr: any) => (
                        <div
                          key={addr.id}
                          className={`p-4 border-2 rounded-lg ${
                            addr.isPrimary ? 'border-[#e50914] bg-red-50' : 'border-gray-200'
                          }`}
                        >
                          {addr.isPrimary && (
                            <span className="inline-block bg-[#e50914] text-white text-xs px-2 py-1 rounded mb-2">
                              Principal
                            </span>
                          )}
                          <p className="font-medium text-gray-900">
                            {addr.street}, {addr.number}
                          </p>
                          {addr.complement && (
                            <p className="text-sm text-gray-600">{addr.complement}</p>
                          )}
                          <p className="text-sm text-gray-600">
                            {addr.neighborhood}, {addr.city} - {addr.state}
                          </p>
                          <p className="text-sm text-gray-600">CEP: {addr.cep}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Address */}
                  <form onSubmit={handleAddAddress} className="space-y-4 pt-6 border-t">
                    <h3 className="font-bold text-gray-900">Adicionar Novo Endereço</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="CEP"
                          value={newAddress.cep}
                          onChange={(e) => setNewAddress({ ...newAddress, cep: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Rua"
                          value={newAddress.street}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, street: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                          required
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Número"
                        value={newAddress.number}
                        onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                        required
                      />

                      <input
                        type="text"
                        placeholder="Complemento"
                        value={newAddress.complement}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, complement: e.target.value })
                        }
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                      />

                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Bairro"
                          value={newAddress.neighborhood}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, neighborhood: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                          required
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Cidade"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                        required
                      />

                      <input
                        type="text"
                        placeholder="Estado"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                        required
                      />
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newAddress.isPrimary}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, isPrimary: e.target.checked })
                        }
                        className="w-4 h-4 text-[#e50914]"
                      />
                      <span className="text-sm text-gray-700">
                        Definir como endereço principal
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="bg-[#e50914] hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                    >
                      Adicionar Endereço
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Meus Pedidos</h2>
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Você ainda não fez nenhum pedido</p>
                  </div>
                </motion.div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Meus Favoritos</h2>
                  <div className="text-center py-12 text-gray-500">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Você ainda não tem favoritos</p>
                  </div>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Segurança</h2>

                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, newPassword: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                        placeholder="Digite a nova senha"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e50914]"
                        placeholder="Confirme a nova senha"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-[#e50914] hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                    >
                      Alterar Senha
                    </button>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
