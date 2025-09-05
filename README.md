# Backend TypeScript com MySQL

Projeto backend em Node.js com TypeScript, seguindo princípios de Clean Architecture e conectado a um banco de dados MySQL.

## 🚀 Características

- **TypeScript** para tipagem estática
- **Clean Architecture** com separação clara de responsabilidades
- **TypeORM** como ORM para MySQL
- **JWT** para autenticação
- **Validação** com express-validator e class-validator
- **Logging** com Winston
- **Segurança** com Helmet, CORS e rate limiting
- **ESLint + Prettier** para padronização de código
- **Upload de arquivos** com Multer
- **Gerenciamento de avatares** para usuários
- **Sistema de auditoria** com logs detalhados de alterações
- **Middleware global de log** automático para PUT/DELETE

## 📁 Estrutura do Projeto

```
src/
├── config/          # Configurações (db, env, etc.)
├── core/            # Entidades e interfaces (domain layer)
├── modules/         # Módulos separados (user, auth, log)
├── middlewares/     # Middlewares globais
├── shared/          # Utilidades e gerenciamento de arquivos
├── errors/          # Tratamento centralizado de erros
├── server.ts        # Inicialização da aplicação
└── routes.ts        # Definição central de rotas

uploads/
└── avatars/         # Avatares dos usuários
```

## 🛠️ Pré-requisitos

- Node.js 18+
- MySQL 8.0+
- npm ou yarn

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd backend-typescript-mysql
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=sua_senha_aqui
DB_DATABASE=nome_do_banco
DB_SYNCHRONIZE=false
DB_LOGGING=true

# Configurações JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=24h

# Configurações de Segurança
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. Crie o banco de dados MySQL:
```sql
CREATE DATABASE nome_do_banco;
```

6. Execute as migrações:
```bash
npm run migration:run
```

## 🚀 Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📚 Rotas da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Usuários (Protegidas)
- `GET /api/users` - Listar todos os usuários
- `GET /api/users/:id` - Buscar usuário por ID
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Avatar (Protegidas)
- `POST /api/users/avatar` - Upload de avatar (multipart/form-data)
- `DELETE /api/users/avatar` - Remover avatar

### Logs de Auditoria (Protegidas)
- `GET /api/logs` - Listar todos os logs
- `GET /api/logs/:id` - Buscar log por ID
- `GET /api/logs/user/:userId` - Logs por usuário
- `GET /api/logs/entity/:entity/:entityId` - Logs por entidade
- `GET /api/logs/action/:action` - Logs por ação (CREATE/UPDATE/DELETE)

### Health Check
- `GET /api/health` - Status da API

## 🔐 Autenticação

Para acessar rotas protegidas, inclua o header:
```
Authorization: Bearer <seu_token_jwt>
```

## 📁 Upload de Arquivos

### Configurações
- **Tipos permitidos**: JPEG, JPG, PNG, GIF
- **Tamanho máximo**: 5MB
- **Campo do formulário**: `avatar`
- **Diretório de destino**: `uploads/avatars/`

### Funcionalidades
- **Upload automático**: Arquivo é salvo com nome único
- **Substituição**: Avatar anterior é automaticamente deletado
- **Avatar padrão**: Usuários sem avatar recebem imagem padrão
- **Validação**: Verificação de tipo e tamanho do arquivo
- **Limpeza**: Arquivos são removidos quando usuário é deletado

## 📊 Sistema de Auditoria

### Funcionalidades
- **Log automático** de todas as operações PUT e DELETE
- **Rastreamento completo** de quem fez o quê e quando
- **Campos alterados** com valores antigos e novos
- **Relacionamento** com usuários para auditoria completa
- **Middleware global automático** para todas as entidades

### Estrutura do Log
```typescript
export enum LogAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE", 
  DELETE = "DELETE"
}

@Entity("log")
export class Log {
  id: number;                    // ID único do log
  userId: number;                // Quem fez a alteração
  datetime: Date;                // Data e hora da modificação
  entity: string;                // Nome da entidade modificada
  entityId: number;              // ID do registro alterado
  action: LogAction;             // Tipo de ação
  changedFields: Record<string, { old: any; new: any }>; // Campos alterados
  functionUsed: string;          // Função que gerou a mudança
  user: User;                    // Relacionamento com usuário
}
```

### Sistema de Middleware de Auditoria

#### **Sistema Atual (Middleware Global)**
```typescript
// ✅ FUNCIONA AUTOMATICAMENTE para todas as rotas PUT/DELETE
// ✅ Zero configuração necessária
// ✅ Detecção automática de entidades
// ✅ Captura dados antes e depois
// ✅ Comparação inteligente de campos
```

O middleware global (`logMiddleware`) está ativo automaticamente no servidor e captura todas as operações de modificação sem necessidade de configuração adicional por rota.

### Funcionalidades
- **Interceptação automática** de todas as requisições PUT/DELETE
- **Detecção automática** de entidades da URL
- **Validação automática** de tokens JWT
- **Captura de dados antes e depois** das operações
- **Comparação inteligente** de campos alterados
- **Logs assíncronos** que não interferem na performance

### Campos Excluídos por Padrão
- Campos sensíveis podem ser configurados via filtros no middleware

## 🧪 Testando a API

### 1. Registrar usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "123456"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "123456"
  }'
```

### 3. Upload de avatar
```bash
curl -X POST http://localhost:3000/api/users/avatar \
  -H "Authorization: Bearer <token_do_login>" \
  -F "avatar=@caminho/para/sua/foto.jpg"
```

### 4. Atualizar usuário (log automático via middleware global)
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer <token_do_login>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Atualizado"
  }'
```

### 5. Ver logs de auditoria
```bash
# Todos os logs
curl -X GET http://localhost:3000/api/logs \
  -H "Authorization: Bearer <token_do_login>"

# Logs de um usuário específico
curl -X GET http://localhost:3000/api/logs/user/1 \
  -H "Authorization: Bearer <token_do_login>"

# Logs de uma entidade específica
curl -X GET http://localhost:3000/api/logs/entity/User/1 \
  -H "Authorization: Bearer <token_do_login>"

# Logs de uma ação específica
curl -X GET http://localhost:3000/api/logs/action/UPDATE \
  -H "Authorization: Bearer <token_do_login>"
```

### 6. Remover usuário (log automático via middleware global)
```bash
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer <token_do_login>"
```

## 📝 Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm start` - Executa em produção
- `npm run lint` - Executa o ESLint
- `npm run lint:fix` - Corrige problemas do ESLint
- `npm run format` - Formata o código com Prettier
- `npm run migration:generate` - Gera nova migração
- `npm run migration:run` - Executa migrações
- `npm run migration:revert` - Reverte última migração

## 🏗️ Arquitetura

O projeto segue os princípios de Clean Architecture:

- **Domain Layer** (`core/`): Entidades e interfaces
- **Application Layer** (`modules/`): Casos de uso e regras de negócio
- **Infrastructure Layer** (`config/`): Banco de dados e configurações
- **Presentation Layer** (`controllers/`, `routes/`): Controllers e rotas

### Gerenciamento de Arquivos
- **FileManager**: Classe utilitária para operações de arquivo
- **Validação**: Verificação de tipo, tamanho e segurança
- **Armazenamento**: Sistema de arquivos local organizado
- **Limpeza**: Remoção automática de arquivos órfãos

### Sistema de Auditoria
- **LogService**: Serviço para gerenciar logs
- **LogRepository**: Acesso aos dados de log
- **AuditMiddleware**: Middleware automático para PUT/DELETE
- **LogMiddleware**: **Middleware global automático** para todas as entidades
- **Rastreamento**: Histórico completo de alterações

## 🔒 Segurança

- Senhas hash com bcrypt
- JWT com expiração configurável
- Headers de segurança com Helmet
- CORS configurável
- Rate limiting
- Validação de entrada
- Sanitização de dados
- Validação de arquivos de upload
- Limite de tamanho de arquivo
- **Auditoria completa** de todas as modificações
- **Proteção de dados sensíveis** nos logs
- **Middleware global** com validação automática de tokens

## 📊 Logging

O projeto utiliza Winston para logging estruturado:
- Logs de erro em `logs/error.log`
- Logs combinados em `logs/combined.log`
- Console em desenvolvimento

### Logs de Auditoria
- **Tabela dedicada** no banco de dados
- **Relacionamentos** com usuários
- **Campos alterados** com valores antigos e novos
- **Timestamps** precisos de todas as operações
- **Função responsável** por cada alteração
- **Middleware global** para captura automática

## 📁 Estrutura de Uploads

```
uploads/
├── avatars/
│   ├── default-avatar.png
│   ├── 1700000000000_abc123.jpg
│   └── 1700000000001_def456.png
└── (outros tipos de arquivo no futuro)
```

## 🗄️ Estrutura do Banco

### Tabela Users
- `id`, `name`, `email`, `password`, `avatar_url`, `created_at`, `updated_at`

### Tabela Logs
- `id`, `userId`, `datetime`, `entity`, `entityId`, `action`, `changedFields`, `functionUsed`
- **Relacionamento**: `users.id` → `log.userId` (CASCADE)

## 🔧 Configuração do Middleware Global

### Mapeamento de Entidades
```typescript
// src/config/entityMapping.ts
export const entityRepositoryMap: Record<string, any> = {
  'users': AppDataSource.getRepository(User),
  'user': AppDataSource.getRepository(User),
  // Adicione novas entidades aqui
  // 'products': AppDataSource.getRepository(Product),
  // 'orders': AppDataSource.getRepository(Order),
};
```

### Funcionamento Automático
- **Captura** todas as operações PUT/DELETE
- **Detecta** entidade automaticamente da URL
- **Valida** token JWT automaticamente
- **Compara** dados antes e depois
- **Cria** logs apenas para operações bem-sucedidas
- **Não interfere** no funcionamento normal da API

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. 