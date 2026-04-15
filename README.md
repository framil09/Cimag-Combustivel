# CIMAG - Controle de KM e Combustível 🚗⛽

Sistema web colaborativo para controle de quilometragem e abastecimento de combustível do **Consórcio Público Intermunicipal Multifinalitário da AMAG (CIMAG)**.

## 📋 Funcionalidades

- **Formulário de Registro**: Preenchimento com campos de seleção para veículos (FIAT FASTBACK, POLO TRACK, MONTANA) e placas (TYW5H46, TYW5I45)
- **Cálculos Automáticos**: KM percorrido, valor total e KM/litro calculados em tempo real
- **Tabela de Registros**: Visualização com busca, paginação e exportação para Excel (.xlsx)
- **Painel de Estatísticas**: Cards com métricas animadas (KM total, litros, gastos, média KM/L)
- **Proteção de Dados**: Apenas inserção permitida — sem edição ou exclusão de registros
- **Exportação Excel**: Download dos dados em planilha .xlsx formatada

## 🛠️ Tecnologias

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Prisma ORM** + PostgreSQL
- **Framer Motion** (animações)
- **Shadcn/ui** (componentes)
- **xlsx** (exportação Excel)

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Yarn ou npm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/cimag-controle-combustivel.git
cd cimag-controle-combustivel

# Instale as dependências
yarn install

# Configure o banco de dados
cp .env.example .env
# Edite o .env com sua DATABASE_URL do PostgreSQL

# Crie as tabelas no banco
yarn prisma db push

# Inicie o servidor de desenvolvimento
yarn dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
├── app/
│   ├── api/
│   │   └── registros/       # API de registros (GET/POST)
│   │       └── stats/       # API de estatísticas
│   ├── globals.css           # Tema CIMAG (teal)
│   ├── layout.tsx            # Layout raiz
│   └── page.tsx              # Página principal
├── components/
│   ├── form-section.tsx      # Formulário de registro
│   ├── header.tsx            # Cabeçalho com logo CIMAG
│   ├── stats-cards.tsx       # Cards de estatísticas
│   ├── table-section.tsx     # Tabela + exportação Excel
│   └── ui/                   # Componentes base (shadcn)
├── lib/
│   └── prisma.ts             # Cliente Prisma (singleton)
├── prisma/
│   └── schema.prisma         # Schema do banco de dados
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
