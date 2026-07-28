# 💰 CashView

**CashView** é uma plataforma inovadora de educação financeira que transforma economias em conquistas. Com um sistema de milhas, investimentos inteligentes e doações para ONGs, o CashView gamifica o processo de poupar dinheiro e incentiva hábitos financeiros saudáveis.

![CashView Logo](public/cashview-logo.png)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)
- [Páginas e Rotas](#-páginas-e-rotas)
- [Banco de Dados](#-banco-de-dados)
- [Sistema Antifraude](#-sistema-antifraude)
- [API Endpoints](#-api-endpoints)
- [Como Usar o Sistema](#-como-usar-o-sistema)
- [Contribuindo](#-contribuindo)

---

## 🎯 Sobre o Projeto

O **CashView** foi desenvolvido para ajudar pessoas a economizar dinheiro de forma divertida e engajante. A plataforma oferece:

- **Sistema de Milhas**: Cada R$ 1,00 economizado = 1 milha
- **Investimentos Inteligentes**: Fundo CashView com rendimentos baseados na taxa Selic
- **Doações para ONGs**: Converta milhas em doações para causas sociais e ambientais
- **Conquistas e Gamificação**: Desbloqueie conquistas e compita com amigos
- **Sistema Antifraude**: Validação inteligente de economias para prevenir fraudes

O projeto foi desenvolvido com **Next.js 15**, **TypeScript**, **Turso Database (SQLite)**, **Better-Auth** e **TailwindCSS 4**.

---

## ✨ Funcionalidades

### 🏠 Página Inicial
- Landing page com apresentação da plataforma
- Explicação das funcionalidades principais
- Call-to-action para registro e login
- Carregamento otimizado de imagens com loading states

### 🔐 Autenticação
- **Registro de usuários** com email, nome e senha
- **Login seguro** com validação de credenciais
- **Sessão persistente** com Better-Auth
- **Proteção de rotas** com middleware
- Redirecionamento automático para dashboard após login

### 📊 Dashboard
- Visão geral das finanças do usuário
- Cards com estatísticas em tempo real:
  - Saldo atual
  - Receitas totais
  - Despesas totais
  - Total economizado
  - Milhas disponíveis
- Acesso rápido a todas as funcionalidades

### 💳 Gestão Financeira
- **Adicionar receitas** (salário, freelance, investimentos, etc.)
- **Adicionar despesas** com duas opções:
  - **Confirmar despesa**: Registra como transação e subtrai do saldo
  - **Adiar e ganhar milhas**: NÃO registra transação, ganha milhas imediatamente, NÃO afeta o saldo
- **Histórico de transações** completo (apenas transações reais)
- **Cálculo automático de saldo**: Receitas - Despesas Confirmadas
- **Card "Economizado"**: Mostra total de despesas adiadas

### 🪙 Sistema de Milhas
- **Ganhar milhas** ao adiar despesas (R$ 1,00 = 1 milha)
- **Sistema antifraude** com validação de:
  - Consistência de padrões de economia
  - Idade da conta
  - Frequência de economias
  - Integração bancária (se disponível)
- **Milhas pendentes** por até 72h para validação antifraude
- **Milhas liberadas** após validação bem-sucedida
- Histórico completo de ganho de milhas

### 🏦 Fundo CashView
- **Converter milhas** em dinheiro (1 milha = R$ 0,01)
- **Rendimentos mensais** baseados na taxa Selic
- **Projeções de investimento**:
  - Conservador (0.5%/mês)
  - Moderado (1.0%/mês)
  - Agressivo (2.0%/mês)
- **Resgatar valores** a qualquer momento
- **Histórico completo** de depósitos, rendimentos e resgates
- Cálculo automático de rendimentos mensais

### 💝 Doações para ONGs
- **5 ONGs parceiras** alinhadas aos ODS da ONU:
  - **Instituto Ayrton Senna** (ODS 4, 10) - Educação de qualidade
  - **Ação da Cidadania** (ODS 1, 2, 10) - Combate à fome e pobreza
  - **Geração Empreendedora** (ODS 8, 9, 10) - Empreendedorismo jovem
  - **Observatório do Clima** (ODS 13, 15) - Mudanças climáticas
  - **Pastoral da Criança** (ODS 1, 2, 3) - Saúde e nutrição infantil
- **Converter milhas** em doações
- **Valores mínimos** de doação por ONG
- **Links para sites oficiais** das ONGs
- **Logos otimizadas** com carregamento rápido e loading states

### 🏆 Conquistas
- **15 conquistas únicas** desbloqueáveis:
  - **Primeira Economia**: Adie sua primeira despesa
  - **Economizador Semanal**: Economize 7 dias seguidos
  - **Economizador Mensal**: Economize 30 dias seguidos
  - **100 Milhas**: Acumule 100 milhas
  - **1000 Milhas**: Acumule 1.000 milhas
  - **5000 Milhas**: Acumule 5.000 milhas
  - **10000 Milhas**: Acumule 10.000 milhas
  - **Primeira Doação**: Faça sua primeira doação
  - **Doador Generoso**: Doe 100 milhas
  - **Filantropo**: Doe 500 milhas
  - **Grande Benfeitor**: Doe 1.000 milhas
  - **Investidor Iniciante**: Faça seu primeiro investimento
  - **Investidor Pequeno**: Invista R$ 10
  - **Investidor Médio**: Invista R$ 100
  - **Investidor Grande**: Invista R$ 500
- **Progresso em tempo real** para cada conquista
- **Badge system** com ícones e descrições
- Verificação automática após ações relevantes

### 👥 Sistema de Amigos e Metas
- **Adicionar amigos** por email
- **Metas financeiras competitivas**:
  - Criar metas com nome, valor alvo e prazo opcional
  - Adicionar progresso às metas (R$ 100 por vez)
  - Visualizar progresso com barras e porcentagens
  - Completar metas e ganhar no ranking
  - Dias restantes para metas com prazo
- **Ranking de metas**:
  - Ordenação por número de metas completadas
  - Critério secundário: progresso médio de todas as metas
  - Destaque visual para o usuário atual
- **Estatísticas**:
  - Sua posição no ranking (🏆)
  - Metas completadas (✓)
  - Metas ativas (🎯)
  - Total de amigos competindo (👥)

### 📈 Simulador de Investimentos
- **Simulações personalizadas** baseadas no perfil do investidor:
  - **Conservador**: Menor risco, menor retorno
  - **Moderado**: Risco e retorno equilibrados
  - **Agressivo**: Maior risco, maior retorno
- **Cálculo de rendimentos** com juros compostos
- **Comparação visual** entre perfis
- **Sugestões de investimento** baseadas no perfil escolhido
- Interface intuitiva com gráficos

### 🛍️ Marketplace
- Página preparada para futura integração de produtos e serviços
- Sistema de pontos e recompensas planejado

### 👤 Perfil do Usuário
- **Visualizar informações** da conta
- **Estatísticas financeiras**:
  - Total de milhas
  - Saldo no fundo
  - Total de doações
  - Total economizado
- **Configurações de perfil** do investidor
- **Botão de logout** seguro
- Dados sincronizados em tempo real

---

## 🚀 Tecnologias Utilizadas

### Frontend
- **[Next.js 15](https://nextjs.org/)** - Framework React com App Router e Server Components
- **[React 19](https://react.dev/)** - Biblioteca JavaScript para interfaces de usuário
- **[TypeScript 5](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[TailwindCSS 4](https://tailwindcss.com/)** - Framework CSS utility-first moderno
- **[Framer Motion](https://www.framer.com/motion/)** - Biblioteca de animações para React
- **[Lucide React](https://lucide.dev/)** - Biblioteca de ícones SVG otimizados

### Backend e Banco de Dados
- **[Turso Database](https://turso.tech/)** - Banco de dados SQLite edge distribuído
- **[Drizzle ORM](https://orm.drizzle.team/)** - ORM TypeScript-first leve e performático
- **[Better-Auth 1.3](https://better-auth.com/)** - Sistema de autenticação moderno
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Endpoints REST API

### UI Components
- **[Radix UI](https://www.radix-ui.com/)** - Componentes primitivos acessíveis
- **[Shadcn/UI](https://ui.shadcn.com/)** - Coleção de componentes reutilizáveis
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications elegantes
- **[Recharts](https://recharts.org/)** - Biblioteca de gráficos para React
- **[React Hook Form](https://react-hook-form.com/)** - Gerenciamento de formulários

### Autenticação e Segurança
- **Better-Auth** - Autenticação com sessões e tokens
- **bcrypt** - Hash seguro de senhas
- **Sistema antifraude customizado** - Validação inteligente de economias
- **Middleware de proteção** - Rotas protegidas automaticamente

### Desenvolvimento
- **[Bun](https://bun.sh/)** - Runtime JavaScript/TypeScript rápido
- **ESLint** - Linter para JavaScript/TypeScript
- **PostCSS** - Processador CSS
- **Drizzle Kit** - CLI para migrations de banco de dados

---

## 🏗️ Arquitetura do Sistema

### Estrutura de Camadas

```
┌─────────────────────────────────────┐
│      Frontend (Next.js 15)          │
│  - Pages (App Router)               │
│  - Components (React 19)            │
│  - Client-side Logic                │
│  - Server Components                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      API Routes (Next.js)           │
│  - RESTful Endpoints                │
│  - Business Logic                   │
│  - Validation & Security            │
│  - Better-Auth Integration          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│    Database (Turso/SQLite)          │
│  - Drizzle ORM                      │
│  - Schema Definitions               │
│  - Migrations                       │
│  - Edge Database                    │
└─────────────────────────────────────┘
```

### Fluxo de Dados

1. **Usuário interage** com a interface React
2. **Cliente envia requisição** para API Route (com Bearer Token)
3. **API valida** autenticação e autorização
4. **Business logic** processa a requisição
5. **Drizzle ORM** executa query no banco de dados Turso
6. **Resposta retorna** ao cliente com dados atualizados
7. **UI atualiza** de forma reativa com novos dados

### Autenticação e Autorização

```
Registro → Better-Auth → Session Token → localStorage → Bearer Token → API Routes
```

- Token JWT armazenado no `localStorage` como `bearer_token`
- Middleware protege rotas autenticadas automaticamente
- Sessão validada em cada requisição API
- Logout limpa sessão e token

### Sistema Antifraude

```
Economia Registrada → Análise de Padrões → Cálculo de Score → Status das Milhas
```

**Critérios de validação:**
- Consistência de economias ao longo do tempo
- Idade da conta do usuário
- Frequência de economias (diária/semanal)
- Integração bancária (se disponível)
- Padrões suspeitos de comportamento

**Status das milhas:**
- `pending`: Aguardando validação (até 72h)
- `released`: Validadas e disponíveis para uso
- `fraud`: Marcadas como suspeitas de fraude

---

## 📁 Estrutura de Pastas

```
cashview/
├── public/                          # Arquivos estáticos
│   ├── cashview-logo.png           # Logo da aplicação
│   └── ngos/                       # Logos das ONGs parceiras
│       ├── instituto-ayrton-senna.png
│       ├── acao-da-cidadania.png
│       ├── geracao-empreendedora.png
│       ├── observatorio-do-clima.png
│       └── pastoral-da-crianca.png
├── src/
│   ├── app/                        # App Router (Next.js 15)
│   │   ├── amigos/                 # Página de amigos e metas financeiras
│   │   │   └── page.tsx
│   │   ├── api/                    # API Routes (Backend)
│   │   │   ├── achievements/       # Conquistas
│   │   │   │   ├── route.ts        # GET: Listar conquistas
│   │   │   │   └── check/          # POST: Verificar novas conquistas
│   │   │   │       └── route.ts
│   │   │   ├── auth/               # Autenticação (Better-Auth)
│   │   │   │   └── [...all]/
│   │   │   │       └── route.ts
│   │   │   ├── donations/          # Doações para ONGs
│   │   │   │   └── route.ts        # GET/POST: Doações
│   │   │   ├── friends/            # Sistema de amigos
│   │   │   │   ├── route.ts        # GET/POST: Listar/Adicionar amigos
│   │   │   │   └── search/         # GET: Buscar usuário por email
│   │   │   │       └── route.ts
│   │   │   ├── fund/               # Fundo de investimentos
│   │   │   │   └── route.ts        # GET/POST: Gerenciar fundo
│   │   │   ├── goals/              # Metas financeiras
│   │   │   │   └── route.ts        # GET/POST/PUT: Gerenciar metas
│   │   │   ├── miles/              # Sistema de milhas
│   │   │   │   ├── route.ts        # GET: Total de milhas
│   │   │   │   └── earn/           # POST: Ganhar milhas
│   │   │   │       └── route.ts
│   │   │   ├── ngos/               # ONGs parceiras
│   │   │   │   └── route.ts        # GET: Listar ONGs
│   │   │   ├── profile/            # Perfil do usuário
│   │   │   │   └── route.ts        # GET: Dados do perfil
│   │   │   ├── savings/            # Economias (despesas adiadas)
│   │   │   │   └── route.ts        # GET: Total economizado
│   │   │   └── transactions/       # Transações financeiras
│   │   │       └── route.ts        # GET/POST: Transações
│   │   ├── conquistas/             # Página de conquistas
│   │   │   └── page.tsx
│   │   ├── dashboard/              # Dashboard principal
│   │   │   └── page.tsx
│   │   ├── doacoes/                # Página de doações
│   │   │   └── page.tsx
│   │   ├── financas/               # Gestão financeira
│   │   │   └── page.tsx
│   │   ├── fundo/                  # Fundo de investimentos
│   │   │   └── page.tsx
│   │   ├── login/                  # Página de login
│   │   │   └── page.tsx
│   │   ├── mercado/                # Marketplace
│   │   │   └── page.tsx
│   │   ├── perfil/                 # Perfil do usuário
│   │   │   └── page.tsx
│   │   ├── register/               # Página de registro
│   │   │   └── page.tsx
│   │   ├── simulador/              # Simulador de investimentos
│   │   │   └── page.tsx
│   │   ├── sobre/                  # Sobre o projeto
│   │   │   └── page.tsx
│   │   ├── transacoes/             # Histórico de transações
│   │   │   └── page.tsx
│   │   ├── layout.tsx              # Layout global
│   │   ├── page.tsx                # Página inicial (Landing)
│   │   └── globals.css             # Estilos globais (TailwindCSS 4)
│   ├── components/                 # Componentes reutilizáveis
│   │   ├── ui/                     # Componentes UI (Shadcn)
│   │   │   └── sonner.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Navbar.tsx
│   ├── db/                         # Banco de dados
│   │   ├── seeds/                  # Seeders para popular DB
│   │   ├── index.ts                # Conexão com Turso
│   │   └── schema.ts               # Schema Drizzle ORM
│   ├── lib/                        # Bibliotecas e utilities
│   │   ├── auth.ts                 # Better-Auth (server)
│   │   └── auth-client.ts          # Better-Auth (client)
│   └── middleware.ts               # Middleware de autenticação
├── drizzle/                        # Migrations do Drizzle
│   └── meta/
├── .env                            # Variáveis de ambiente
├── drizzle.config.ts               # Configuração Drizzle
├── next.config.ts                  # Configuração Next.js
├── package.json                    # Dependências
├── tsconfig.json                   # Configuração TypeScript
└── README.md                       # Este arquivo
```

---

## 🔧 Como Rodar o Projeto

### Pré-requisitos

- **Node.js 18+**
- Conta no **[Turso](https://turso.tech/)** (gratuita)

### Instalação Passo a Passo

#### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/cashview.git
cd cashview
```

#### 2. Instale as dependências

```bash
npm install
```

#### 3. Configure as variáveis de ambiente

Copie `.env.example` para `.env` e preencha os valores:

```bash
cp .env.example .env
```

```env
# Banco de dados Turso
TURSO_CONNECTION_URL=libsql://seu-banco.turso.io
TURSO_AUTH_TOKEN=seu-token

# Segredo das sessoes - gere com: openssl rand -base64 32
BETTER_AUTH_SECRET=seu-segredo-de-no-minimo-32-chars

# URL publica do site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Opcionais - a tela de Mercado precisa da chave do Finnhub
FINNHUB_API_KEY=
COINGECKO_API_KEY=
```

> ⚠️ **Nunca commite o arquivo `.env`.** Ele já está no `.gitignore`.

**Como obter as credenciais do Turso:**

```bash
# 1. Instale o Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# 2. Faça login
turso auth login

# 3. Crie um banco de dados
turso db create cashview

# 4. Obtenha a URL do banco
turso db show cashview

# 5. Crie um token de autenticação
turso db tokens create cashview
```

#### 4. Execute as migrations do banco de dados

```bash
npm run db:push
```

#### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

#### 6. Acesse a aplicação

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento com Turbopack
npm run build        # Cria build de produção otimizado
npm run start        # Inicia servidor de produção
npm run lint         # Executa ESLint para verificar código
npm run db:generate  # Gera migrations a partir do schema
npm run db:push      # Aplica o schema no banco
```

---

## ▲ Deploy na Vercel

1. Suba o projeto para um repositório no GitHub.
2. Na Vercel, clique em **Add New → Project** e importe o repositório.
3. O framework Next.js é detectado sozinho — não altere os comandos de build.
4. Em **Settings → Environment Variables**, cadastre:

| Variável | Obrigatória | Observação |
|---|---|---|
| `TURSO_CONNECTION_URL` | Sim | URL do banco Turso |
| `TURSO_AUTH_TOKEN` | Sim | Token do banco Turso |
| `BETTER_AUTH_SECRET` | Sim | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | Sim | Domínio final, ex: `https://cashview.vercel.app` |
| `FINNHUB_API_KEY` | Não | Sem ela, a tela **Mercado** não carrega os ativos |
| `COINGECKO_API_KEY` | Não | Melhora o limite de requisições de cripto |

5. Clique em **Deploy**.

> Rode `npm run db:push` uma vez apontando para o banco de produção antes do primeiro acesso, para criar as tabelas.

---

## 🗺️ Páginas e Rotas

### Páginas Públicas (Não autenticadas)

| Rota | Descrição | Componentes Principais |
|------|-----------|------------------------|
| `/` | Landing page com apresentação do projeto | Hero, Features, CTA, Footer |
| `/login` | Página de login com email e senha | Formulário de login, Better-Auth |
| `/register` | Página de registro de novos usuários | Formulário de cadastro, validação |
| `/sobre` | Informações sobre o projeto e equipe | Conteúdo informativo |

### Páginas Protegidas (Requerem autenticação)

| Rota | Descrição | Funcionalidades |
|------|-----------|-----------------|
| `/dashboard` | Dashboard principal com visão geral | Cards de estatísticas, navegação rápida |
| `/financas` | Gestão de receitas e despesas | Adicionar receitas/despesas, confirmar ou adiar |
| `/transacoes` | Histórico completo de transações | Lista de transações, filtros, estatísticas |
| `/fundo` | Fundo de investimentos CashView | Converter milhas, resgatar, projeções |
| `/doacoes` | Doações para ONGs parceiras | Lista de ONGs, doação de milhas, ODS |
| `/conquistas` | Conquistas desbloqueadas e progresso | 15 conquistas, progresso em tempo real |
| `/amigos` | Amigos e metas financeiras competitivas | Adicionar amigos, criar metas, ranking |
| `/simulador` | Simulador de investimentos | Perfis de investidor, projeções |
| `/perfil` | Perfil e configurações do usuário | Dados da conta, estatísticas, logout |
| `/mercado` | Marketplace (em desenvolvimento) | Futura integração de produtos |

---

## 🗄️ Banco de Dados

### Tecnologia
- **Turso Database**: SQLite edge distribuído globalmente
- **Drizzle ORM**: ORM TypeScript-first para queries type-safe

### Tabelas Principais

#### `user` - Usuários
Armazena informações dos usuários cadastrados.

```typescript
{
  id: string (PK)
  name: string
  email: string (unique)
  emailVerified: boolean
  image: string?
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `session` - Sessões
Gerencia sessões de autenticação.

```typescript
{
  id: string (PK)
  expiresAt: timestamp
  token: string (unique)
  createdAt: timestamp
  updatedAt: timestamp
  ipAddress: string?
  userAgent: string?
  userId: string (FK → user)
}
```

#### `transactions` - Transações Financeiras
Apenas transações confirmadas (receitas e despesas reais).

```typescript
{
  id: integer (PK)
  userId: string (FK)
  amount: real
  description: string
  type: 'income' | 'expense'
  date: integer (timestamp)
  createdAt: integer (timestamp)
}
```

**IMPORTANTE**: Despesas adiadas NÃO são registradas aqui!

#### `savings` - Economias (Despesas Adiadas)
Despesas que o usuário decidiu adiar e ganhou milhas.

```typescript
{
  id: integer (PK)
  userId: string (FK)
  amount: real
  date: integer (timestamp)
  cancelled: boolean
  milesEarned: integer
  createdAt: integer (timestamp)
}
```

#### `miles_history` - Histórico de Milhas
Registra ganho de milhas e status de validação.

```typescript
{
  id: integer (PK)
  userId: string (FK)
  milesEarned: integer
  reason: string
  source: string
  createdAt: integer (timestamp)
  status: 'pending' | 'released' | 'fraud'
  releasedAt: integer? (timestamp)
}
```

#### `user_profile` - Perfil do Usuário
Perfil financeiro e estatísticas do usuário.

```typescript
{
  id: integer (PK)
  userId: string (FK, unique)
  investorProfile: string?
  totalMiles: integer
  fundBalance: real
  monthlyReturn: real
  lastFundUpdate: integer? (timestamp)
  accountCreatedAt: integer (timestamp)
  consistencyScore: integer (0-100)
  accountAge: integer (dias)
  dailyDesistCount: integer
  weeklyDesistCount: integer
  lastSavingDate: integer? (timestamp)
  hasBankIntegration: boolean
  totalSavings: real
  totalDonations: integer
}
```

#### `ngos` - ONGs Parceiras
ONGs disponíveis para doação.

```typescript
{
  id: integer (PK)
  name: string
  description: string
  logoUrl: string
  minMiles: integer (doação mínima)
  ods: string (CSV - ex: "1,2,10")
  active: boolean
  createdAt: integer (timestamp)
}
```

#### `donations` - Doações
Registro de doações feitas para ONGs.

```typescript
{
  id: integer (PK)
  userId: string (FK)
  ngoId: integer (FK → ngos)
  milesAmount: integer
  investmentValue: real
  createdAt: integer (timestamp)
  status: string
}
```

#### `achievements` - Conquistas
Conquistas desbloqueadas pelos usuários.

```typescript
{
  id: integer (PK)
  userId: string (FK)
  achievementId: string
  unlockedAt: integer (timestamp)
  progress: integer
  target: integer
}
```

#### `goals` - Metas Financeiras
Metas financeiras dos usuários para competição.

```typescript
{
  id: integer (PK)
  userId: string (FK)
  name: string
  targetAmount: real
  currentAmount: real
  deadline: integer? (timestamp)
  completed: boolean
  createdAt: integer (timestamp)
}
```

#### `friends` - Amigos
Relacionamento de amizade entre usuários.

```typescript
{
  id: integer (PK)
  userId: string (FK)
  friendId: string (FK → user)
  createdAt: integer (timestamp)
}
```

#### `fund_history` - Histórico do Fundo
Transações do Fundo de Investimentos.

```typescript
{
  id: integer (PK)
  userId: string (FK)
  type: 'deposit' | 'return' | 'withdrawal'
  value: real
  balanceAfter: real
  createdAt: integer (timestamp)
}
```

#### `fraud_logs` - Logs Antifraude
Registros do sistema antifraude.

```typescript
{
  id: integer (PK)
  userId: string (FK)
  action: string
  riskLevel: string
  details: string (JSON)
  createdAt: integer (timestamp)
}
```

---

## 🛡️ Sistema Antifraude

### Objetivo

Prevenir que usuários fraudem o sistema registrando economias falsas apenas para ganhar milhas gratuitamente.

### Como Funciona

1. **Análise de Padrões**: O sistema analisa o histórico de economias do usuário
2. **Cálculo de Score de Risco**: Score calculado baseado em múltiplos critérios
3. **Validação de Milhas**: Milhas ficam com status `pending` por até 72h
4. **Liberação ou Bloqueio**: Após validação, milhas são liberadas (`released`) ou bloqueadas (`fraud`)

### Critérios de Validação

#### 1. Consistência de Economias
- Usuários que economizam regularmente = maior confiabilidade
- Economias esporádicas ou muito irregulares = maior risco
- Padrão de economia consistente aumenta o score

#### 2. Idade da Conta
- Contas novas (< 7 dias) = validação mais rigorosa
- Contas antigas com histórico = validação mais flexível
- Score aumenta com idade da conta

#### 3. Frequência de Economias
- Múltiplas economias no mesmo dia = suspeito
- Economias todos os dias na mesma hora = suspeito
- Padrões muito regulares (robóticos) = suspeito

#### 4. Integração Bancária
- Com integração bancária = validação automática
- Sem integração = validação manual necessária
- Score máximo com integração ativa

### Níveis de Risco

| Nível | Score | Descrição | Ação |
|-------|-------|-----------|------|
| **Baixo** | 80-100 | Padrão normal de economia | Milhas liberadas imediatamente |
| **Médio** | 50-79 | Alguns indicadores suspeitos | Milhas liberadas após 72h |
| **Alto** | 20-49 | Múltiplos indicadores de fraude | Milhas bloqueadas, análise manual |
| **Crítico** | 0-19 | Fraude confirmada | Conta suspensa permanentemente |

### Implementação no Código

```typescript
// Exemplo simplificado do sistema antifraude
const validateSaving = async (userId: string, amount: number) => {
  const profile = await getUserProfile(userId);
  const recentSavings = await getRecentSavings(userId, 24); // últimas 24h
  
  let riskScore = 100; // Score perfeito inicial
  
  // Critério 1: Frequência diária
  if (recentSavings.length > 5) {
    riskScore -= 30; // Muitas economias no mesmo dia
  }
  
  // Critério 2: Idade da conta
  const accountAgeInDays = (Date.now() - profile.accountCreatedAt) / (1000 * 60 * 60 * 24);
  if (accountAgeInDays < 7) {
    riskScore -= 20; // Conta muito nova
  }
  
  // Critério 3: Consistência
  if (profile.consistencyScore < 50) {
    riskScore -= 15; // Baixa consistência de economias
  }
  
  // Critério 4: Integração bancária
  if (profile.hasBankIntegration) {
    riskScore = Math.min(100, riskScore + 20); // Bônus por integração
  }
  
  // Determinar status
  return {
    status: riskScore >= 80 ? 'released' : 'pending',
    riskScore,
    releaseAt: riskScore >= 80 ? Date.now() : Date.now() + (72 * 60 * 60 * 1000)
  };
};
```

### Benefícios do Sistema

1. **Protege a economia da plataforma** contra fraudes
2. **Incentiva uso legítimo** do sistema
3. **Recompensa usuários consistentes** com validação rápida
4. **Detecta padrões anormais** automaticamente
5. **Mantém a integridade** das milhas e recompensas

---

## 🔌 API Endpoints

### Autenticação (Better-Auth)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `POST` | `/api/auth/sign-up` | Registrar novo usuário | Não |
| `POST` | `/api/auth/sign-in` | Login de usuário | Não |
| `POST` | `/api/auth/sign-out` | Logout de usuário | Sim |
| `GET` | `/api/auth/session` | Obter sessão atual | Sim |

### Transações

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/transactions` | Listar transações do usuário | Sim |
| `POST` | `/api/transactions` | Criar nova transação (receita ou despesa confirmada) | Sim |

**Body POST:**
```json
{
  "userId": "string",
  "amount": 100.50,
  "description": "Salário",
  "type": "income", // ou "expense"
  "postponed": false // true = adiar (não cria transação)
}
```

### Milhas

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/miles` | Obter total de milhas do usuário | Sim |
| `POST` | `/api/miles/earn` | Registrar ganho de milhas | Sim |

**Response GET:**
```json
{
  "totalMiles": 1500,
  "pendingMiles": 200,
  "releasedMiles": 1300
}
```

### Economias

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/savings` | Obter total economizado | Sim |

**Response:**
```json
{
  "totalSaved": 500.00
}
```

### Fundo de Investimentos

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/fund?userId=X` | Obter dados do fundo | Sim |
| `POST` | `/api/fund?action=convert` | Converter milhas em dinheiro | Sim |
| `POST` | `/api/fund?action=withdraw` | Resgatar valores do fundo | Sim |
| `GET` | `/api/fund?action=projections` | Obter projeções de rendimento | Sim |

**Body POST (convert):**
```json
{
  "userId": "string",
  "milesAmount": 1000
}
```

**Body POST (withdraw):**
```json
{
  "userId": "string",
  "value": 10.50
}
```

### Doações

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/donations` | Listar doações do usuário | Sim |
| `POST` | `/api/donations` | Realizar doação para ONG | Sim |

**Body POST:**
```json
{
  "userId": "string",
  "ngoId": 1,
  "milesAmount": 500,
  "investmentValue": 0
}
```

### ONGs

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/ngos` | Listar ONGs parceiras | Sim |

**Response:**
```json
[
  {
    "id": 1,
    "name": "Instituto Ayrton Senna",
    "description": "...",
    "logoUrl": "/ngos/instituto-ayrton-senna.png",
    "minMiles": 100,
    "ods": "4,10",
    "active": true
  }
]
```

### Conquistas

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/achievements` | Listar conquistas do usuário | Sim |
| `POST` | `/api/achievements/check` | Verificar e desbloquear novas conquistas | Sim |

### Amigos

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/friends` | Listar amigos do usuário | Sim |
| `POST` | `/api/friends` | Adicionar novo amigo | Sim |
| `GET` | `/api/friends/search?email=X` | Buscar usuário por email | Sim |

**Body POST:**
```json
{
  "userId": "string",
  "friendEmail": "amigo@email.com"
}
```

### Metas

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/goals` | Listar metas do usuário | Sim |
| `POST` | `/api/goals` | Criar nova meta | Sim |
| `PUT` | `/api/goals` | Atualizar progresso da meta | Sim |

**Body POST (criar):**
```json
{
  "userId": "string",
  "name": "Viagem para Europa",
  "targetAmount": 5000,
  "deadline": 1735689600000
}
```

**Body PUT (atualizar):**
```json
{
  "goalId": 1,
  "userId": "string",
  "addAmount": 100
}
```

### Perfil

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/api/profile` | Obter perfil completo do usuário | Sim |

---

## 🎮 Como Usar o Sistema

### 1️⃣ Cadastro e Login

1. Acesse a página inicial: `http://localhost:3000`
2. Clique em **"Começar Agora"** ou **"Registrar"**
3. Preencha: **Nome**, **Email**, **Senha** e **Confirmar Senha**
4. Clique em **"Criar Conta"**
5. Faça login com seu email e senha
6. Você será redirecionado para o **Dashboard**

### 2️⃣ Gestão Financeira

#### Adicionar Receitas
1. Acesse **"Finanças"** no menu
2. Na seção **"Nova Receita"**:
   - Digite a descrição (ex: "Salário")
   - Digite o valor (ex: R$ 3.000,00)
   - Selecione a categoria
   - Clique em **"Adicionar Receita"**

#### Registrar Despesas
1. Na seção **"Nova Despesa"**:
   - Digite a descrição (ex: "Almoço")
   - Digite o valor (ex: R$ 50,00)
   - Escolha uma opção:
     - **"Confirmar Despesa"**: Registra como gasto real, subtrai do saldo
     - **"Adiar e Ganhar Milhas"**: Ganha milhas, NÃO afeta o saldo

**IMPORTANTE**: Despesas adiadas NÃO aparecem no histórico de transações, pois você não gastou o dinheiro!

### 3️⃣ Ganhar Milhas

- Cada R$ 1,00 economizado = **1 milha**
- Milhas ficam **pendentes** por até 72h (sistema antifraude)
- Após validação, milhas são **liberadas** automaticamente
- Veja seu total em: **Dashboard** → Card "Milhas Disponíveis"

### 4️⃣ Investir no Fundo CashView

1. Acesse **"Fundo"** no menu
2. Na seção **"Investir Milhas"**:
   - Digite quantas milhas quer converter (mínimo 100)
   - Veja o valor equivalente (1 milha = R$ 0,01)
   - Clique em **"Converter e Investir"**
3. Seu investimento renderá mensalmente baseado na Selic
4. Para resgatar:
   - Digite o valor em reais
   - Clique em **"Resgatar"**

### 5️⃣ Doar para ONGs

1. Acesse **"Doações"** no menu
2. Escolha uma ONG:
   - Instituto Ayrton Senna (Educação)
   - Ação da Cidadania (Combate à fome)
   - Geração Empreendedora (Empreendedorismo)
   - Observatório do Clima (Meio ambiente)
   - Pastoral da Criança (Saúde infantil)
3. Digite a quantidade de milhas (respeite o mínimo)
4. Clique em **"Doar Milhas"**
5. Sua doação será registrada e você pode verificar conquistas relacionadas

### 6️⃣ Desbloquear Conquistas

**Conquistas são desbloqueadas automaticamente!**

Exemplos:
- **Primeira Economia**: Adie sua primeira despesa
- **100 Milhas**: Acumule 100 milhas
- **Primeira Doação**: Doe para qualquer ONG
- **Investidor Iniciante**: Faça seu primeiro investimento

Acesse **"Conquistas"** para ver:
- ✓ Conquistas desbloqueadas
- 🔒 Conquistas bloqueadas com progresso

### 7️⃣ Competir com Amigos

1. Acesse **"Amigos"** no menu
2. **Adicionar um amigo**:
   - Clique em **"Adicionar Amigo"**
   - Digite o email do amigo
   - Clique em **"Adicionar"**
3. **Criar uma meta financeira**:
   - Clique em **"Nova Meta"**
   - Nome: "Viagem para Europa"
   - Valor alvo: R$ 5.000,00
   - Prazo (opcional): Escolha uma data
   - Clique em **"Criar Meta"**
4. **Adicionar progresso**:
   - Na sua meta, clique em **"Adicionar R$ 100"**
   - Veja a barra de progresso atualizar
5. **Completar metas**:
   - Quando atingir 100%, a meta é marcada como concluída
   - Você sobe no ranking automaticamente

**Ranking**:
- 1º critério: Metas completadas
- 2º critério: Progresso médio de todas as metas

### 8️⃣ Simular Investimentos

1. Acesse **"Simulador"** no menu
2. Escolha seu perfil:
   - **Conservador**: Menor risco, menor retorno
   - **Moderado**: Risco médio, retorno médio
   - **Agressivo**: Maior risco, maior retorno
3. Digite o valor inicial
4. Digite o valor de aportes mensais
5. Selecione o período (meses)
6. Veja as projeções de rendimento

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Siga os passos abaixo:

### Como Contribuir

1. **Fork** o projeto
2. **Clone** seu fork:
   ```bash
   git clone https://github.com/seu-usuario/cashview.git
   ```
3. Crie uma **branch** para sua feature:
   ```bash
   git checkout -b feature/MinhaFeature
   ```
4. **Commit** suas mudanças:
   ```bash
   git commit -m 'feat: Adiciona MinhaFeature'
   ```
5. **Push** para a branch:
   ```bash
   git push origin feature/MinhaFeature
   ```
6. Abra um **Pull Request** no GitHub

### Diretrizes de Código

- ✅ Use **TypeScript** para tipagem forte
- ✅ Siga os padrões do **ESLint**
- ✅ Escreva código limpo e bem documentado
- ✅ Teste suas mudanças antes de commitar
- ✅ Use **Conventional Commits** para mensagens:
  - `feat:` Nova funcionalidade
  - `fix:` Correção de bug
  - `docs:` Documentação
  - `style:` Formatação
  - `refactor:` Refatoração
  - `test:` Testes
  - `chore:` Manutenção

### Áreas para Contribuição

- 🐛 **Correção de bugs**
- ✨ **Novas funcionalidades**
- 📚 **Melhorias na documentação**
- 🎨 **Melhorias de UI/UX**
- ⚡ **Otimizações de performance**
- 🧪 **Testes automatizados**
- 🌐 **Internacionalização (i18n)**

---

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

---

## 👨‍💻 Desenvolvido Por

Projeto desenvolvido como demonstração de:
- **Educação Financeira Gamificada**
- **Full-Stack com Next.js 15**
- **Sistema de Autenticação Moderno**
- **Banco de Dados Edge (Turso)**
- **UI/UX com TailwindCSS 4**

---

## 🙏 Agradecimentos

- **ONGs Parceiras** pelos trabalhos incríveis em prol da sociedade
- **Comunidade Open Source** pelas ferramentas e bibliotecas utilizadas
- **Next.js Team** pelo framework incrível
- **Turso** pelo banco de dados edge distribuído
- **Better-Auth** pelo sistema de autenticação moderno
- **Shadcn/UI** pelos componentes acessíveis

---

## 📞 Suporte e Contato

- 🐛 **Bugs**: Abra uma [issue](https://github.com/seu-usuario/cashview/issues)
- 💡 **Sugestões**: Abra uma [discussion](https://github.com/seu-usuario/cashview/discussions)
- 📧 **Email**: contato@cashview.com

---

## 🚀 Roadmap Futuro

### Em Desenvolvimento
- [ ] Integração bancária via Open Banking
- [ ] Marketplace de produtos e serviços
- [ ] Aplicativo mobile (React Native)
- [ ] Notificações push
- [ ] Gamificação avançada com níveis

### Planejado
- [ ] Análise de gastos com IA
- [ ] Chatbot financeiro
- [ ] Sistema de cashback
- [ ] Investimentos automatizados
- [ ] Programa de afiliados

---

<div align="center">

**CashView** - Transforme suas economias em conquistas! 💰✨

Made with ❤️ using Next.js 15, TypeScript & TailwindCSS 4

[⬆ Voltar ao topo](#-cashview)

</div>