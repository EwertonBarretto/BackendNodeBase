# Teste do Sistema de Auditoria

## 🎯 Objetivo
Testar o sistema de logs de auditoria que registra automaticamente todas as operações PUT e DELETE.

## 📋 Pré-requisitos
1. Servidor rodando (`npm run dev`)
2. Usuário criado e autenticado
3. Token JWT válido
4. Migrações executadas (incluindo tabela de logs)

## 🧪 Cenários de Teste

### 1. Preparação - Criar Usuário e Fazer Login

```bash
# Criar usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuário Teste",
    "email": "teste@auditoria.com",
    "password": "123456"
  }'

# Fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@auditoria.com",
    "password": "123456"
  }'
```

**Copie o token retornado para usar nos próximos comandos.**

### 2. Teste de Log de Atualização (PUT)

```bash
# Atualizar nome do usuário
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuário Teste Atualizado"
  }'
```

**Resultado esperado**: Log de auditoria criado com:
- `action`: "UPDATE"
- `entity`: "User"
- `entityId`: 1
- `changedFields`: `{"name": {"old": "Usuário Teste", "new": "Usuário Teste Atualizado"}}`
- `functionUsed`: "updateUser"

### 3. Teste de Log de Exclusão (DELETE)

```bash
# Deletar usuário
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resultado esperado**: Log de auditoria criado com:
- `action`: "DELETE"
- `entity`: "User"
- `entityId`: 1
- `changedFields`: `{"deleted": {"old": true, "new": false}}`
- `functionUsed`: "deleteUser"

### 4. Verificar Logs de Auditoria

#### 4.1 Listar todos os logs
```bash
curl -X GET http://localhost:3000/api/logs \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### 4.2 Buscar log específico por ID
```bash
curl -X GET http://localhost:3000/api/logs/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### 4.3 Logs por usuário
```bash
curl -X GET http://localhost:3000/api/logs/user/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### 4.4 Logs por entidade
```bash
curl -X GET http://localhost:3000/api/logs/entity/User/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### 4.5 Logs por ação
```bash
# Logs de UPDATE
curl -X GET http://localhost:3000/api/logs/action/UPDATE \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Logs de DELETE
curl -X GET http://localhost:3000/api/logs/action/DELETE \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🔍 Verificações no Banco de Dados

### Estrutura da Tabela Log
```sql
DESCRIBE log;
```

**Campos esperados**:
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `userId` (INT, NOT NULL, FOREIGN KEY)
- `datetime` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `entity` (VARCHAR(100), NOT NULL)
- `entityId` (INT, NOT NULL)
- `action` (ENUM('CREATE','UPDATE','DELETE'), NOT NULL)
- `changedFields` (JSON, NOT NULL)
- `functionUsed` (VARCHAR(255), NOT NULL)

### Consultas de Verificação

#### Ver todos os logs
```sql
SELECT * FROM log ORDER BY datetime DESC;
```

#### Logs com informações do usuário
```sql
SELECT 
  l.*,
  u.name as userName,
  u.email as userEmail
FROM log l
JOIN users u ON l.userId = u.id
ORDER BY l.datetime DESC;
```

#### Logs de uma entidade específica
```sql
SELECT * FROM log WHERE entity = 'User' AND entityId = 1;
```

#### Logs de uma ação específica
```sql
SELECT * FROM log WHERE action = 'UPDATE';
```

## 📊 Exemplos de Resposta da API

### Log de Atualização
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "datetime": "2024-01-01T12:00:00.000Z",
    "entity": "User",
    "entityId": 1,
    "action": "UPDATE",
    "changedFields": {
      "name": {
        "old": "Usuário Teste",
        "new": "Usuário Teste Atualizado"
      }
    },
    "functionUsed": "updateUser",
    "user": {
      "id": 1,
      "name": "Usuário Teste Atualizado",
      "email": "teste@auditoria.com"
    }
  },
  "message": "Log recuperado com sucesso"
}
```

### Log de Exclusão
```json
{
  "success": true,
  "data": {
    "id": 2,
    "userId": 1,
    "datetime": "2024-01-01T12:05:00.000Z",
    "entity": "User",
    "entityId": 1,
    "action": "DELETE",
    "changedFields": {
      "deleted": {
        "old": true,
        "new": false
      }
    },
    "functionUsed": "deleteUser",
    "user": {
      "id": 1,
      "name": "Usuário Teste Atualizado",
      "email": "teste@auditoria.com"
    }
  },
  "message": "Log recuperado com sucesso"
}
```

## ⚠️ Pontos de Atenção

### 1. Campos Sensíveis
- **Senhas nunca são logadas** (configurado via `excludeFields`)
- Campos sensíveis podem ser configurados por rota

### 2. Middleware de Auditoria
- **Só funciona em rotas PUT e DELETE**
- Deve ser configurado especificamente para cada rota
- Não interfere no funcionamento normal da API

### 3. Relacionamentos
- Logs são automaticamente deletados quando usuário é removido (CASCADE)
- Relacionamento bidirecional entre User e Log

### 4. Performance
- Logs são criados de forma assíncrona
- Não bloqueia a resposta da API
- Erros no log não interrompem o fluxo principal

## 🚀 Cenários Avançados

### 1. Múltiplas Atualizações
```bash
# Atualizar múltiplos campos
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nome Final",
    "email": "final@email.com"
  }'
```

### 2. Verificar Histórico Completo
```bash
# Ver todos os logs de um usuário específico
curl -X GET "http://localhost:3000/api/logs/user/1" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Auditoria de Entidades
```bash
# Ver histórico de uma entidade específica
curl -X GET "http://localhost:3000/api/logs/entity/User/1" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## ✅ Checklist de Validação

- [ ] Usuário criado com sucesso
- [ ] Login retorna token JWT
- [ ] Atualização de usuário funciona
- [ ] Log de UPDATE é criado
- [ ] Exclusão de usuário funciona
- [ ] Log de DELETE é criado
- [ ] API de logs retorna dados corretos
- [ ] Relacionamentos funcionam (User ↔ Log)
- [ ] Campos sensíveis não são logados
- [ ] Timestamps são precisos
- [ ] Middleware não interfere em operações normais

## 🔧 Troubleshooting

### Problema: Logs não são criados
**Solução**: Verificar se o middleware de auditoria está configurado corretamente nas rotas

### Problema: Erro de relacionamento
**Solução**: Verificar se as migrações foram executadas corretamente

### Problema: Campos sensíveis sendo logados
**Solução**: Configurar `excludeFields` no middleware de auditoria 