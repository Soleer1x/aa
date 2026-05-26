'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, CreditCard, ArrowRight, Loader2, CheckCircle2, Zap, Shield, Truck, Headphones } from 'lucide-react'
import { Logo } from './logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/lib/store'

interface AuthPageProps {
  onSuccess: () => void
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { login, register } = useAuthStore()

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validateCPF = (cpf: string) => cpf.replace(/\D/g, '').length === 11
  const validatePhone = (phone: string) => phone.replace(/\D/g, '').length >= 10

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido'
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (mode === 'register') {
      if (!formData.name.trim()) {
        newErrors.name = 'Nome é obrigatório'
      }
      if (!validateCPF(formData.cpf)) {
        newErrors.cpf = 'CPF inválido'
      }
      if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Telefone inválido'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não conferem'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password)
      } else if (mode === 'register') {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          cpf: formData.cpf,
          phone: formData.phone,
        })
      }
      onSuccess()
    } catch {
      setErrors({ submit: 'Erro ao processar. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    { icon: Zap, title: 'Entrega Expressa', desc: 'Receba em até 24h' },
    { icon: Shield, title: 'Compra Segura', desc: '100% protegida' },
    { icon: Truck, title: 'Frete Grátis', desc: 'Acima de R$ 299' },
    { icon: Headphones, title: 'Suporte 24/7', desc: 'Sempre disponível' },
  ]

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a0a0a] to-[#0a0a0a]" />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        {/* Glowing orb */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo size="lg" />
          
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold text-foreground leading-tight">
                A melhor experiência
                <br />
                em <span className="gradient-text">tecnologia</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-md">
                Descubra os melhores produtos tech e gaming com preços imbatíveis 
                e entrega ultrarrápida.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="glass rounded-xl p-4 hover:border-primary/30 transition-all duration-300"
                >
                  <feature.icon className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Mais de 50.000 clientes satisfeitos</p>
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <CheckCircle2 key={i} className="w-4 h-4 text-primary" />
              ))}
              <span className="ml-2">4.9/5 avaliação média</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size="lg" />
          </div>

          <div className="glass rounded-2xl p-8 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground">
                    {mode === 'login' && 'Bem-vindo de volta'}
                    {mode === 'register' && 'Criar conta'}
                    {mode === 'forgot' && 'Recuperar senha'}
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    {mode === 'login' && 'Entre para continuar comprando'}
                    {mode === 'register' && 'Cadastre-se para começar'}
                    {mode === 'forgot' && 'Informe seu e-mail para recuperar'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <>
                      <div className="space-y-2">
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Nome completo"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="pl-10 h-12 bg-secondary border-border focus:border-primary"
                          />
                        </div>
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="CPF"
                            value={formData.cpf}
                            onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                            className="pl-10 h-12 bg-secondary border-border focus:border-primary"
                          />
                        </div>
                        {errors.cpf && <p className="text-xs text-destructive">{errors.cpf}</p>}
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Telefone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                            className="pl-10 h-12 bg-secondary border-border focus:border-primary"
                          />
                        </div>
                        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="E-mail"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10 h-12 bg-secondary border-border focus:border-primary"
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  {mode !== 'forgot' && (
                    <>
                      <div className="space-y-2">
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Senha"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="pl-10 pr-10 h-12 bg-secondary border-border focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                      </div>

                      {mode === 'register' && (
                        <div className="space-y-2">
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Confirmar senha"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              className="pl-10 h-12 bg-secondary border-border focus:border-primary"
                            />
                          </div>
                          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                        </div>
                      )}
                    </>
                  )}

                  {mode === 'login' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                  )}

                  {errors.submit && (
                    <p className="text-sm text-destructive text-center">{errors.submit}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-primary-sm"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {mode === 'login' && 'Entrar'}
                        {mode === 'register' && 'Criar conta'}
                        {mode === 'forgot' && 'Enviar link de recuperação'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  {mode === 'login' && (
                    <p className="text-muted-foreground">
                      Não tem uma conta?{' '}
                      <button
                        onClick={() => setMode('register')}
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        Cadastre-se
                      </button>
                    </p>
                  )}
                  {mode === 'register' && (
                    <p className="text-muted-foreground">
                      Já tem uma conta?{' '}
                      <button
                        onClick={() => setMode('login')}
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        Fazer login
                      </button>
                    </p>
                  )}
                  {mode === 'forgot' && (
                    <button
                      onClick={() => setMode('login')}
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Voltar ao login
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-primary hover:underline">Termos de Uso</a>
            {' '}e{' '}
            <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
