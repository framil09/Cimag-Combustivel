# CIMAG - Controle de KM e Combustível 🚗⛽

Sistema web colaborativo para controle de quilometragem e abastecimento de combustível do **Consórcio Público Intermunicipal Multifinalitário da AMAG (CIMAG)**.

## 📋 Funcionalidades

- **Autenticação**: Login com email/senha protegido por NextAuth.js
- **Gestão de Usuários**: Painel admin para criar e remover usuários com geração automática de senha
- **Formulário de Registro**: Preenchimento com campos de seleção para veículos e placas
- **Cálculos Automáticos**: KM percorrido, valor total e KM/litro calculados em tempo real
- **Tabela de Registros**: Visualização com busca, paginação e exportação para Excel (.xlsx)
- **Painel de Estatísticas**: Cards com métricas animadas (KM total, litros, gastos, média KM/L)
- **Proteção de Dados**: Apenas inserção permitida — sem edição ou exclusão de registros
- **Exportação Excel**: Download dos dados em planilha .xlsx formatada
- **Envio de Credenciais por Email**: Senha gerada automaticamente e enviada via SMTP

## 🛠️ Tecnologias

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Prisma ORM** + SQLite (dev) / PostgreSQL (prod)
- **NextAuth.js** (autenticação)
- **Nodemailer** (envio de emails)
- **Framer Motion** (animações)
- **Shadcn/ui** (componentes)
- **xlsx** (exportação Excel)

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- npm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/framil09/Cimag-Combustivel.git
cd Cimag-Combustivel

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Crie as tabelas no banco
npx prisma migrate dev

# Crie o usuário admin
npx tsx scripts/seed.ts

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Credenciais padrão do admin

- **Email:** admin@cimag.com
- **Senha:** admin123

### Variáveis de ambiente (.env)

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta"

# SMTP para envio de emails (opcional)
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-app-password"
SMTP_FROM="CIMAG Sistema <seu-email@gmail.com>"
```

### Scripts disponíveis

```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build de produção
npm start         # Servidor de produção
npm run lint      # Linting
```

## 📁 Estrutura do Projeto

```
├── app/
│   ├── api/
│   │   ├── auth/             # NextAuth.js endpoints
│   │   ├── registros/        # API de registros (GET/POST)
│   │   │   └── stats/        # API de estatísticas
│   │   └── users/            # API de usuários (CRUD)
│   ├── admin/
│   │   └── users/            # Painel de gestão de usuários
│   ├── login/                # Página de login
│   ├── globals.css           # Tema CIMAG (teal)
│   ├── layout.tsx            # Layout raiz
│   └── page.tsx              # Página principal
├── components/
│   ├── auth-provider.tsx     # Provider de autenticação
│   ├── form-section.tsx      # Formulário de registro
│   ├── header.tsx            # Cabeçalho com logo e logout
│   ├── stats-cards.tsx       # Cards de estatísticas
│   ├── table-section.tsx     # Tabela + exportação Excel
│   └── ui/                   # Componentes base (shadcn)
├── lib/
│   ├── auth.ts               # Configuração NextAuth.js
│   ├── email.ts              # Serviço de envio de emails
│   └── prisma.ts             # Cliente Prisma (singleton)
├── middleware.ts              # Proteção de rotas
├── prisma/
│   └── schema.prisma         # Schema do banco de dados
├── scripts/
│   └── seed.ts               # Seed do usuário admin
└── public/
    └── logo-cimag.png        # Logo CIMAG
```

## 🎨 Identidade Visual

O sistema utiliza a paleta de cores oficial do CIMAG:
- **Teal escuro**: #0D3640
- **Teal médio**: #1B4D5C
- **Teal claro**: #2A7A8A / #5BB5C5

## 📄 Licença

Projeto desenvolvido para uso interno do CIMAG.
