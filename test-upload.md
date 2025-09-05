# Teste de Upload de Avatar

## Pré-requisitos
1. Servidor rodando (`npm run dev`)
2. Usuário criado e autenticado
3. Token JWT válido

## Passos para Teste

### 1. Criar Usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Avatar",
    "email": "avatar@teste.com",
    "password": "123456"
  }'
```

### 2. Fazer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "avatar@teste.com",
    "password": "123456"
  }'
```

**Copie o token retornado para usar nos próximos comandos.**

### 3. Upload de Avatar
```bash
curl -X POST http://localhost:3000/api/users/avatar \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "avatar=@caminho/para/sua/foto.jpg"
```

### 4. Verificar Usuário Atualizado
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 5. Remover Avatar
```bash
curl -X DELETE http://localhost:3000/api/users/avatar \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 6. Verificar Avatar Padrão
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## Validações

### Tipos de Arquivo Permitidos
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ GIF (.gif)
- ❌ Outros formatos

### Tamanho Máximo
- ✅ Até 5MB
- ❌ Acima de 5MB

### Campo do Formulário
- ✅ `avatar`
- ❌ Outros nomes

## Respostas Esperadas

### Upload Bem-sucedido
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Teste Avatar",
    "email": "avatar@teste.com",
    "avatar_url": "/uploads/avatars/1700000000000_abc123.jpg",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Avatar atualizado com sucesso"
}
```

### Erro de Validação
```json
{
  "success": false,
  "message": "Tipo de arquivo não permitido. Use apenas: JPEG, JPG, PNG ou GIF"
}
```

### Erro de Tamanho
```json
{
  "success": false,
  "message": "Arquivo muito grande. Tamanho máximo: 5MB"
}
```

## Verificação de Arquivos

### Estrutura de Diretórios
```
uploads/
└── avatars/
    ├── default-avatar.png
    └── 1700000000000_abc123.jpg
```

### Acesso via URL
- Avatar do usuário: `http://localhost:3000/uploads/avatars/1700000000000_abc123.jpg`
- Avatar padrão: `http://localhost:3000/uploads/avatars/default-avatar.png`

## Limpeza Automática

- ✅ Avatar anterior é deletado ao fazer novo upload
- ✅ Avatar é deletado ao remover usuário
- ✅ Arquivos são organizados por tipo
- ✅ Nomes únicos evitam conflitos 