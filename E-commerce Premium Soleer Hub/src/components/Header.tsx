import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, Bell, Shield } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'Notebooks',
    'Smartphones',
    'Periféricos',
    'Monitores',
    'Componentes',
    'Áudio',
    'Acessórios'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <header className="bg-[#e50914] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => navigate('/')}>
            <Logo className="text-white" />
          </div>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos, marcas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-12 py-2.5 text-white placeholder-white/70 focus:outline-none focus:bg-white/30 transition-all"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors border border-white/20"
              >
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Admin</span>
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-white text-[#e50914] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <User className="w-6 h-6" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="p-3 border-b border-gray-200">
                      <p className="font-semibold truncate">{user?.displayName || 'Usuário'}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      Meu Perfil
                    </button>
                    <button
                      onClick={() => {
                        navigate('/orders');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      Meus Pedidos
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-red-600"
                    >
                      Sair
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Categories - Desktop */}
        <div className="hidden md:flex items-center gap-6 pb-3 border-t border-white/20 pt-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => navigate(`/category/${category.toLowerCase()}`)}
              className="text-sm hover:text-white/80 transition-colors whitespace-nowrap"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/20 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-full px-12 py-2.5 text-white placeholder-white/70 focus:outline-none"
                />
              </form>

              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      navigate(`/category/${category.toLowerCase()}`);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
