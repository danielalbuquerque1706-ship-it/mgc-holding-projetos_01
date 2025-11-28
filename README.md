# MGC HOLDING - Sistema de Controle de Projetos

Sistema web de gerenciamento de projetos com autenticação, filtros avançados e sincronização em tempo real via Supabase.

## 🚀 Características

- ✅ Autenticação com credenciais fixas
- ✅ Sincronização de dados em tempo real (Supabase)
- ✅ Acesso de qualquer máquina/navegador
- ✅ Filtros por Status, Prioridade, Área e Responsável
- ✅ CRUD completo de projetos
- ✅ Interface responsiva e moderna

## 📋 Credenciais Padrão

- **Usuário:** Projetosmgc_2025
- **Senha:** Proje@2025

## 🔧 Configuração do Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Crie uma tabela `projects` com os campos:
   - id (UUID, primary key)
   - name (text)
   - description (text)
   - startDate (date)
   - endDate (date)
   - status (text)
   - priority (text)
   - areaSolicitante (text)
   - responsavelExecucao (text)
   - progresso (integer)
   - created_at (timestamp)

4. Copie as credenciais do Supabase:
   - URL do projeto
   - Chave pública (anon key)

## 🌐 Publicação na Vercel

### Passo 1: Preparar o Projeto

```bash
npm install
npm run build
```

### Passo 2: Conectar com GitHub

1. Faça push do código para GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Selecione seu repositório

### Passo 3: Configurar Variáveis de Ambiente

No painel da Vercel, vá para Settings > Environment Variables:

```
VITE_SUPABASE_URL = https://seu-projeto.supabase.co
VITE_SUPABASE_KEY = sua-chave-publica
```

### Passo 4: Deploy

Clique em "Deploy" e aguarde a publicação

## 📦 Estrutura do Projeto

```
mgc-holding-projetos/
├── src/
│   ├── App.jsx           # Componente principal
│   ├── App.css           # Estilos
│   └── main.jsx          # Ponto de entrada
├── index.html            # HTML principal
├── vite.config.js        # Configuração Vite
├── vercel.json           # Configuração Vercel
├── package.json          # Dependências
└── README.md             # Este arquivo
```

## 🔐 Segurança

- Credenciais fixas (mudar em produção)
- Supabase com Row Level Security (RLS) recomendado
- HTTPS automático na Vercel

## 📱 Funcionalidades

### Filtros
- Status: Todos, Aguardando Início, Em Andamento, Finalizados
- Prioridade: Todas, Alta, Média, Baixa
- Responsável: Marcos, Thiago, Geovanna Martins, INEX, Paganini

### Operações
- Criar novo projeto
- Editar projeto existente
- Deletar projeto
- Acompanhar progresso (0-100%)

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Visualizar build localmente
npm run preview
```

## 📞 Suporte

Para dúvidas sobre:
- **Supabase:** https://supabase.com/docs
- **Vercel:** https://vercel.com/docs
- **Vite:** https://vitejs.dev/guide/

## 📄 Licença

Desenvolvido para MGC HOLDING
