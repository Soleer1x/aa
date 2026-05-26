'use client'

import Link from 'next/link'
import { 
  Facebook, Twitter, Instagram, Youtube, Mail, Phone, 
  MapPin, CreditCard, ShieldCheck, Truck, Clock
} from 'lucide-react'
import { Logo } from './logo'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      {/* Features Bar */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Frete Gratis</p>
                <p className="text-xs text-muted-foreground">Acima de R$ 299</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Entrega Rapida</p>
                <p className="text-xs text-muted-foreground">Em ate 24h</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Compra Segura</p>
                <p className="text-xs text-muted-foreground">100% Protegida</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Pague no PIX</p>
                <p className="text-xs text-muted-foreground">10% de desconto</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo size="lg" />
            <p className="text-muted-foreground mt-4 max-w-sm">
              A melhor loja de tecnologia e produtos gamers do Brasil. Produtos de qualidade com precos incriveis.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Institucional</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Sobre Nos</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Trabalhe Conosco</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Politica de Privacidade</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Ajuda</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Trocas e Devolucoes</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Rastrear Pedido</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Formas de Pagamento</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>contato@soleerhub.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Sao Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-semibold">Receba ofertas exclusivas</h4>
              <p className="text-sm text-muted-foreground">Cadastre-se e receba as melhores promocoes</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input 
                type="email" 
                placeholder="Digite seu e-mail" 
                className="w-full md:w-72"
              />
              <Button className="gradient-primary">Cadastrar</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Soleer Hub. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <img src="https://logodownload.org/wp-content/uploads/2017/04/visa-logo-1.png" alt="Visa" className="h-6 object-contain opacity-60" />
              <img src="https://logodownload.org/wp-content/uploads/2014/07/mastercard-logo-1.png" alt="Mastercard" className="h-6 object-contain opacity-60" />
              <img src="https://logodownload.org/wp-content/uploads/2017/03/pix-logo-0.png" alt="PIX" className="h-6 object-contain opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
