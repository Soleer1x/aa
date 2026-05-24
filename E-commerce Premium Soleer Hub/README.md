# Soleer Hub - E-commerce Premium

E-commerce completo e profissional especializado em produtos eletrônicos, acessórios gamers e tecnologia.

## 🚀 Recursos

### Autenticação
- Login com email/nome de usuário e senha
- Login com Google (Firebase Auth)
- Cadastro de novos usuários
- Recuperação de senha
- Sessões persistentes

### E-commerce
- Catálogo de produtos dinâmico
- Carrinho de compras moderno
- Checkout completo
- Pagamento via PIX com QR Code
- Pagamento via Boleto
- Sistema de categorias
- Busca de produtos

### Área do Usuário
- Perfil completo
- Gerenciamento de endereços
- Histórico de pedidos
- Lista de favoritos
- Alteração de senha

### Painel Administrativo
**Login Admin:**
- Usuário: `soleerhub`
- Senha: `1877`

**Funcionalidades:**
- Dashboard com estatísticas
- Gráficos de vendas
- Gerenciamento completo de produtos (CRUD)
- Gerenciamento de pedidos
- Aprovação de pagamentos
- Visualização de clientes
- Sistema de status de pedidos (verde/amarelo/vermelho)

### Tecnologias
- React
- TypeScript
- Tailwind CSS v4
- Firebase (Auth + Firestore)
- React Router
- Framer Motion
- Recharts
- QRCode
- Lucide Icons

## 🔑 Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative Authentication (Email/Password e Google)
3. Ative Firestore Database
4. Atualize as credenciais em `src/config/firebase.ts`

## 🎨 Design

- Cores principais: Vermelho Premium (#e50914), Branco, Preto
- Logo profissional com raio
- Interface moderna com glassmorphism
- Animações suaves
- Totalmente responsivo
- UX/UI premium

## 📦 Estrutura

```
src/
├── app/
│   ├── App.tsx
│   └── components/
├── pages/
│   ├── AuthPage.tsx
│   ├── HomePage.tsx
│   ├── CheckoutPage.tsx
│   ├── PixPaymentPage.tsx
│   ├── ProfilePage.tsx
│   └── AdminPage.tsx
├── components/
│   ├── Logo.tsx
│   ├── Header.tsx
│   └── Cart.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── config/
│   └── firebase.ts
└── styles/
    ├── fonts.css
    └── theme.css
```

## 🔒 Rotas Protegidas

- `/` - Home (requer autenticação)
- `/checkout` - Checkout (requer autenticação)
- `/profile` - Perfil (requer autenticação)
- `/admin` - Painel Admin (requer autenticação + admin)
- `/auth` - Login/Cadastro (público)

## 💳 Pagamentos

### PIX
- Chave PIX: `0dfadcc1-5e2b-4b9c-a7af-e2cb0766f998`
- QR Code gerado automaticamente
- Código copia e cola
- Timer de 10 minutos
- Confirmação de pagamento

### Boleto
- Geração de boleto
- Dados completos do pedido
- Status de pagamento

## 👥 Cadastro de Admin

Para tornar um usuário administrador, adicione um documento na coleção `admins` do Firestore:

```
Collection: admins
Document ID: {userId}
Data: { admin: true }
```

## 🎯 Status de Pedidos

- 🟢 Verde: Confirmado em até 12 horas
- 🟡 Amarelo: Confirmado em até 1 dia
- 🔴 Vermelho: Não confirmado após 2 dias

## 📱 Responsividade

Totalmente responsivo para:
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)
- Widescreen (1920px+)

---

**Desenvolvido com Claude Code**
