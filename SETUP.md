# 🚀 Setup do Soleer Hub

## Pré-requisitos

- Node.js 18+
- pnpm
- Conta no Firebase

## 1. Instalação

```bash
pnpm install
```

## 2. Configuração do Firebase

### 2.1 Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Adicionar projeto"
3. Siga o assistente de criação

### 2.2 Ativar Authentication

1. No menu lateral, vá em **Authentication**
2. Clique em **Começar**
3. Ative os provedores:
   - **Email/Password**
   - **Google**

### 2.3 Criar Firestore Database

1. No menu lateral, vá em **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha modo de produção
4. Selecione a localização

### 2.4 Configurar Storage (opcional)

1. No menu lateral, vá em **Storage**
2. Clique em **Começar**

### 2.5 Obter Credenciais

1. Vá em **Configurações do Projeto** (ícone de engrenagem)
2. Em "Seus apps", selecione **Web** (</>)
3. Registre seu app
4. Copie as credenciais do Firebase

### 2.6 Atualizar Configurações

Edite `src/config/firebase.ts` com suas credenciais:

```typescript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

## 3. Configurar Regras do Firestore

No Firestore, adicione estas regras:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Products
    match /products/{productId} {
      allow read: if true;
      allow write: if get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.admin == true;
    }
    
    // Orders
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.admin == true;
    }
    
    // Admins
    match /admins/{userId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

## 4. Criar Primeiro Admin

### Opção 1: Via Firebase Console

1. Crie uma conta normal no site
2. Copie o UID do usuário (veja em Authentication)
3. No Firestore, crie uma coleção `admins`
4. Adicione um documento com o ID = UID do usuário
5. Adicione o campo: `admin: true`

### Opção 2: Via Script

Crie um usuário com:
- Email: admin@soleerhub.com
- Senha: 1877

Depois, no Firestore Console:
1. Vá em **Firestore Database**
2. Crie coleção `admins`
3. ID do documento = UID do usuário criado
4. Campo: `{ "admin": true }`

## 5. Iniciar Aplicação

```bash
# O dev server já está rodando no ambiente Make
# Caso precise iniciar manualmente:
pnpm dev
```

## 6. Acessar

- **Site:** Preview automático do Figma Make
- **Admin:** Faça login e clique no botão "Admin" ao lado do perfil

## 📝 Estrutura de Dados

### Collection: `users`

```json
{
  "uid": "user_id",
  "email": "user@email.com",
  "displayName": "Nome do Usuário",
  "phone": "11999999999",
  "photoURL": "https://...",
  "addresses": [],
  "favorites": [],
  "orders": [],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Collection: `products`

```json
{
  "name": "Nome do Produto",
  "description": "Descrição",
  "price": 1999.99,
  "oldPrice": 2499.99,
  "stock": 50,
  "category": "notebooks",
  "images": ["url1", "url2"],
  "discount": 20,
  "rating": 5,
  "reviews": 150,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Collection: `orders`

```json
{
  "userId": "user_id",
  "items": [],
  "total": 2014.99,
  "shipping": 15.00,
  "subtotal": 1999.99,
  "address": {},
  "customer": {},
  "paymentMethod": "pix",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Collection: `admins`

```json
{
  "admin": true
}
```

## 🎯 Funcionalidades

✅ Autenticação completa (Email, Google)
✅ Catálogo de produtos dinâmico
✅ Carrinho de compras
✅ Checkout multi-step
✅ Pagamento PIX com QR Code
✅ Pagamento Boleto
✅ Perfil do usuário
✅ Gerenciamento de endereços
✅ Painel administrativo completo
✅ Dashboard com gráficos
✅ Gerenciamento de produtos (CRUD)
✅ Gerenciamento de pedidos
✅ Gerenciamento de clientes
✅ Sistema de status de pedidos
✅ Totalmente responsivo

## 🔧 Comandos Úteis

```bash
# Instalar dependências
pnpm install

# Iniciar desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Preview da build
pnpm preview
```

## 🐛 Troubleshooting

### Erro: Firebase not configured

- Verifique se as credenciais em `src/config/firebase.ts` estão corretas

### Erro: Permission denied

- Verifique as regras do Firestore
- Certifique-se de que o usuário está autenticado

### Botão Admin não aparece

- Verifique se o usuário está na collection `admins`
- Faça logout e login novamente

### PIX QR Code não gera

- Verifique se o pacote `qrcode` está instalado
- Confira se o valor do pedido está correto

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação do Firebase
2. Confira o console do navegador para erros
3. Revise os logs do Firestore

---

**Desenvolvido com Claude Code**
