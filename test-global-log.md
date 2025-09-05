# Teste do Middleware Global de Log

## 🎯 Objetivo
Testar o novo middleware global de log que captura automaticamente todas as operações PUT e DELETE em qualquer entidade.

## 🔄 Diferenças do Sistema Anterior

### Sistema Anterior (Middleware Específico)
- ✅ Configuração por rota
- ✅ Controle granular
- ❌ Necessidade de configurar cada rota
- ❌ Duplicação de código

### Sistema Atual (Middleware Global)
- ✅ **Automático para todas as rotas PUT/DELETE**
- ✅ **Configuração centralizada**
- ✅ **Detecção automática de entidades**
- ✅ **Captura dados antes e depois**
- ✅ **Comparação inteligente de campos**

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
    "name": "Usuário Teste Global",
    "email": "global@teste.com",
    "password": "123456"
  }'

# Fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "global@teste.com",
    "password": "123456"
  }'
```

**Copie o token retornado para usar nos próximos comandos.**

### 2. Teste de Log Automático - Atualização (PUT)

```bash
# Atualizar usuário (log automático via middleware global)
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuário Atualizado Global",
    "email": "atualizado@global.com"
  }'
```

**Resultado esperado**: 
- ✅ Usuário atualizado com sucesso
- ✅ **Log criado automaticamente** sem configuração adicional
- ✅ **Campos alterados capturados** com valores antigos e novos

### 3. Teste de Log Automático - Exclusão (DELETE)

```bash
# Deletar usuário (log automático via middleware global)
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resultado esperado**:
- ✅ Usuário deletado com sucesso
- ✅ **Log criado automaticamente** sem configuração adicional
- ✅ **Operação de exclusão registrada**

### 4. Verificar Logs Automáticos

```bash
# Ver todos os logs (deve incluir os logs automáticos)
curl -X GET http://localhost:3000/api/logs \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🔍 Funcionalidades do Middleware Global

### ✅ **Detecção Automática**
- **Entidade**: Extraída automaticamente da URL
- **ID**: Capturado dos parâmetros ou body
- **Token**: Validado automaticamente
- **Repositório**: Obtido dinamicamente

### ✅ **Captura de Dados**
- **Antes**: Dados originais da entidade
- **Depois**: Dados enviados na requisição
- **Comparação**: Campos realmente alterados
- **Filtros**: Campos sensíveis não logados

### ✅ **Logs Inteligentes**
- **UPDATE**: Só cria log se há mudanças
- **DELETE**: Sempre registra a operação
- **Status**: Só loga operações bem-sucedidas
- **Erros**: Não interrompem o fluxo principal

## 🚀 Como Funciona

### 1. **Interceptação da Requisição**
```typescript
// Middleware captura requisições PUT/DELETE
if (!['PUT', 'DELETE'].includes(method)) {
  return next();
}
```

### 2. **Extração de Informações**
```typescript
// Nome da entidade da URL
const entityName = getEntityNameFromUrl(url);

// ID da entidade
const entityId = parseInt(pathSegments[2]);

// Usuário do token JWT
const userId = decoded.userId;
```

### 3. **Captura de Dados Antes**
```typescript
// Busca dados originais
const beforeUpdateData = await entityRepository.findOneBy({ id: entityId });
```

### 4. **Interceptação da Resposta**
```typescript
// Captura status da resposta
res.on('finish', async () => {
  if (![200, 201, 204].includes(statusCode)) return;
  // Cria log se operação foi bem-sucedida
});
```

### 5. **Comparação e Log**
```typescript
// Compara campos alterados
Object.keys(newData).forEach((key) => {
  if (oldVal !== newVal) {
    changedFields[key] = { old: oldVal, new: newVal };
  }
});
```

## 📊 Exemplos de Logs Automáticos

### Log de Atualização Automático
```json
{
  "id": 1,
  "userId": 1,
  "datetime": "2024-01-01T12:00:00.000Z",
  "entity": "users",
  "entityId": 1,
  "action": "UPDATE",
  "changedFields": {
    "name": {
      "old": "Usuário Teste Global",
      "new": "Usuário Atualizado Global"
    },
    "email": {
      "old": "global@teste.com",
      "new": "atualizado@global.com"
    }
  },
  "functionUsed": "PUT /api/users/1"
}
```

### Log de Exclusão Automático
```json
{
  "id": 2,
  "userId": 1,
  "datetime": "2024-01-01T12:05:00.000Z",
  "entity": "users",
  "entityId": 1,
  "action": "DELETE",
  "changedFields": {
    "deleted": {
      "old": true,
      "new": false
    }
  },
  "functionUsed": "DELETE /api/users/1"
}
```

## 🔧 Configuração e Extensibilidade

### Adicionar Nova Entidade
```typescript
// src/config/entityMapping.ts
export const entityRepositoryMap: Record<string, any> = {
  'users': AppDataSource.getRepository(User),
  'products': AppDataSource.getRepository(Product), // Nova entidade
  'orders': AppDataSource.getRepository(Order),     // Nova entidade
};
```

### Excluir Rotas Específicas
```typescript
// No middleware, adicione condições
if (url.startsWith('/api/users') || url.startsWith('/api/admin')) {
  return next();
}
```

## ⚠️ Pontos de Atenção

### 1. **Performance**
- ✅ **Não bloqueia** a resposta da API
- ✅ **Logs assíncronos** via `res.on('finish')`
- ✅ **Erros no log** não interrompem o fluxo

### 2. **Segurança**
- ✅ **Tokens validados** automaticamente
- ✅ **Campos sensíveis** podem ser filtrados
- ✅ **Usuário autenticado** obrigatório

### 3. **Compatibilidade**
- ✅ **Funciona com rotas existentes**
- ✅ **Não requer mudanças** nos controllers
- ✅ **Configuração automática** por entidade

## 🎯 Vantagens do Sistema Global

### ✅ **Simplicidade**
- **Zero configuração** por rota
- **Funciona automaticamente** para todas as entidades
- **Manutenção centralizada**

### ✅ **Consistência**
- **Padrão único** para todos os logs
- **Formato consistente** de auditoria
- **Comportamento previsível**

### ✅ **Extensibilidade**
- **Fácil adicionar** novas entidades
- **Configuração flexível** por entidade
- **Filtros personalizáveis**

## ✅ Checklist de Validação

- [ ] Usuário criado com sucesso
- [ ] Login retorna token JWT
- [ ] Atualização funciona sem configuração adicional
- [ ] **Log criado automaticamente** para UPDATE
- [ ] Exclusão funciona sem configuração adicional
- [ ] **Log criado automaticamente** para DELETE
- [ ] **Middleware global** ativo para todas as rotas
- [ ] **Detecção automática** de entidades
- [ ] **Captura de dados** antes e depois
- [ ] **Comparação inteligente** de campos alterados

## 🔧 Troubleshooting

### Problema: Logs não são criados automaticamente
**Solução**: Verificar se o middleware global está configurado no servidor

### Problema: Entidade não reconhecida
**Solução**: Adicionar entidade no `entityMapping.ts`

### Problema: Token não validado
**Solução**: Verificar se `JWT_SECRET` está configurado

### Problema: Performance lenta
**Solução**: Logs são assíncronos, não devem afetar performance 