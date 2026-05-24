import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Sparkles, ShoppingBag, Zap, Chrome } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signup, login, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Login realizado com sucesso!');
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('As senhas não coincidem');
          setLoading(false);
          return;
        }
        await signup(formData.email, formData.password, formData.name);
        toast.success('Conta criada com sucesso!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Login com Google realizado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login com Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-[#e50914] opacity-10 blur-3xl rounded-full"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-red-600 opacity-10 blur-3xl rounded-full"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white space-y-6 hidden md:block"
        >
          <Logo size="lg" className="text-white" />

          <h1 className="text-5xl font-bold leading-tight">
            A Tecnologia que
            <span className="block text-[#e50914]">Você Precisa</span>
          </h1>

          <p className="text-gray-400 text-lg">
            Produtos eletrônicos premium, acessórios gamers e as últimas novidades em tecnologia.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-8">
            {[
              { icon: ShoppingBag, label: 'Produtos Premium' },
              { icon: Zap, label: 'Entrega Rápida' },
              { icon: Sparkles, label: 'Qualidade' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center"
              >
                <item.icon className="w-8 h-8 mx-auto mb-2 text-[#e50914]" />
                <p className="text-sm text-gray-300">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          <div className="md:hidden mb-6">
            <Logo size="md" className="text-white mx-auto" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>
          <p className="text-gray-400 mb-6">
            {isLogin ? 'Entre para continuar' : 'Junte-se à Soleer Hub'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914] transition-colors"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={isLogin ? 'text' : 'email'}
                placeholder={isLogin ? 'Email ou nome de usuário' : 'Email'}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914] transition-colors"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Senha"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914] transition-colors"
                required
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirmar senha"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914] transition-colors"
                  required={!isLogin}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e50914] hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-gray-400 text-sm">ou</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Chrome className="w-5 h-5" />
            Continuar com Google
          </button>

          <p className="text-center text-gray-400 mt-6">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#e50914] hover:underline font-semibold"
            >
              {isLogin ? 'Criar conta' : 'Fazer login'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
