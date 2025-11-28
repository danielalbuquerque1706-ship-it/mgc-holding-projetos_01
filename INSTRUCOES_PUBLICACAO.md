# MGC HOLDING - Sistema de Controle de Projetos

## 📋 Descrição
Sistema web de gerenciamento de projetos com autenticação de usuários, filtros avançados e sincronização de dados em tempo real.

## 🚀 Como Publicar na Sua Nuvem

### Pré-requisitos
- Node.js 18+ instalado
- npm ou pnpm instalado
- Acesso a um servidor web (Apache, Nginx, etc.)

### Passos de Instalação

#### 1. Extrair o projeto
```bash
unzip mgc-holding-projetos-completo.zip
cd mgc-holding-projetos
```

#### 2. Instalar dependências
```bash
npm install
# ou
pnpm install
```

#### 3. Compilar para produção
```bash
npm run build
# ou
pnpm build
```

Os arquivos compilados estarão em `/dist`

#### 4. Publicar na sua nuvem

**Opção A: Servidor Apache**
- Copie o conteúdo da pasta `dist/` para a raiz do seu servidor web
- Configure o `.htaccess` para redirecionar requisições para `index.html`

**Opção B: Servidor Nginx**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    root /caminho/para/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Opção C: Node.js (Express)**
```bash
npm install express
node server.js
```

## 🔐 Credenciais Padrão
- **Usuário:** Projetosmgc_2025
- **Senha:** Proje@2025

## 📁 Estrutura do Projeto
```
mgc-holding-projetos/
├── src/
│   ├── App.jsx              # Componente principal
│   ├── Login.jsx            # Tela de login
│   ├── FileAssistant.jsx    # Assistente de arquivos
│   ├── assets/              # Imagens e logos
│   └── components/          # Componentes UI
├── dist/                    # Build compilado (gerado após npm run build)
├── package.json             # Dependências do projeto
├── vite.config.js           # Configuração do Vite
└── index.html               # HTML principal
```

## 🎨 Funcionalidades
- ✅ Autenticação de usuários
- ✅ Criação, edição e exclusão de projetos
- ✅ Filtros por Status, Prioridade, Área e Executor
- ✅ Sincronização de dados entre máquinas
- ✅ Interface responsiva e moderna
- ✅ Gerenciamento de usuários (admin)

## 📝 Filtros Disponíveis
- **Status:** Todos, Aguardando Início, Em Andamento, Finalizados
- **Prioridade:** Todas, Alta, Média, Baixa
- **Área Solicitante:** Seleção múltipla
- **Responsável pela Execução:** Marcos, Thiago, Geovanna Martins, INEX, Paganini

## 🔧 Variáveis de Ambiente (Opcional)
Crie um arquivo `.env` na raiz do projeto:
```
VITE_API_URL=http://seu-servidor.com
VITE_APP_TITLE=MGC HOLDING - Controle de Projetos
```

## 📞 Suporte
Para dúvidas ou problemas, consulte a documentação ou entre em contato com o desenvolvedor.

## 📄 Licença
Projeto desenvolvido para MGC HOLDING.
