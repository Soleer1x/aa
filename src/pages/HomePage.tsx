import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

export const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const banners = [
    {
      title: 'Tecnologia de Última Geração',
      subtitle: 'Os melhores produtos eletrônicos do mercado',
      image: 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=1200&h=500&fit=crop',
      gradient: 'from-purple-900/80 to-blue-900/80'
    },
    {
      title: 'Setup Gamer Profissional',
      subtitle: 'Equipamentos de alto desempenho para gamers',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&h=500&fit=crop',
      gradient: 'from-red-900/80 to-pink-900/80'
    },
    {
      title: 'Inovação e Qualidade',
      subtitle: 'Smartphones e notebooks premium',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=500&fit=crop',
      gradient: 'from-gray-900/80 to-black/80'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(12));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || 'https://via.placeholder.com/300',
      quantity: 1,
      stock: product.stock
    });
    toast.success('Produto adicionado ao carrinho!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner / Carousel */}
      <div className="relative h-[500px] overflow-hidden">
        {banners.map((banner, index) => (
          <motion.div
            key={index}
            initial={false}
            animate={{
              opacity: currentSlide === index ? 1 : 0,
              scale: currentSlide === index ? 1 : 1.1
            }}
            transition={{ duration: 0.7 }}
            className={`absolute inset-0 ${currentSlide === index ? 'z-10' : 'z-0'}`}
          >
            <div className="relative h-full">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />

              <div className="absolute inset-0 flex items-center justify-center text-white text-center px-4">
                <div>
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-7xl font-bold mb-4"
                  >
                    {banner.title}
                  </motion.h1>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl md:text-2xl text-white/90"
                  >
                    {banner.subtitle}
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Navigation */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === index ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden">
                <div className="w-full h-64 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Em Breve</h3>
            <p className="text-gray-600">
              Nossa loja está sendo preparada com produtos incríveis!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Apenas administradores podem adicionar produtos.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-8 h-8 text-[#e50914]" />
              <h2 className="text-3xl font-bold text-gray-900">Produtos em Destaque</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.images?.[0] || 'https://via.placeholder.com/300'}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.discount && (
                      <div className="absolute top-2 right-2 bg-[#e50914] text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{product.discount}%
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">{product.name}</h3>

                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (product.rating || 5)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">
                        ({product.reviews || 0})
                      </span>
                    </div>

                    <div className="mb-3">
                      {product.oldPrice && (
                        <p className="text-sm text-gray-400 line-through">
                          R$ {product.oldPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                      <p className="text-2xl font-bold text-[#e50914]">
                        R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="w-full bg-[#e50914] hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: 'Entrega Rápida', desc: 'Receba em até 24h' },
            { icon: Star, title: 'Produtos Premium', desc: 'Qualidade garantida' },
            { icon: TrendingUp, title: 'Melhores Preços', desc: 'Ofertas exclusivas' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <feature.icon className="w-12 h-12 mx-auto mb-4 text-[#e50914]" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
