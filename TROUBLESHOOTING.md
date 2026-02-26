# Guia de Solução de Problemas - FLOWA

## Erro 502 / Proxy error / ECONNREFUSED 127.0.0.1:4000

Se no terminal do **frontend** aparecer algo como:

- `Proxy error: TypeError: fetch failed`
- `Error: connect ECONNREFUSED 127.0.0.1:4000`
- `GET /api/proxy/auth/me 502`

**Causa:** o backend não está rodando. O frontend (Next.js) faz proxy das chamadas para a API na porta 4000; se nada estiver escutando lá, a conexão é recusada.

**Solução:** abra um **segundo terminal**, vá na pasta do backend e inicie a API:

```powershell
cd backend
npm run dev
```

Aguarde aparecer algo como: `API rodando em http://localhost:4000`. Depois recarregue a página do frontend.

**Ordem recomendada:** sempre iniciar primeiro o backend (porta 4000) e depois o frontend (porta 3000).

---

## Erro: ERR_CONNECTION_REFUSED no localhost

Este erro significa que o navegador não consegue se conectar ao servidor. Siga os passos abaixo:

### 1. Verificar se os servidores estão rodando

**Backend (porta 4000):**
```powershell
# Verificar se está rodando
netstat -ano | findstr ":4000"

# Testar conexão
Invoke-WebRequest -Uri "http://127.0.0.1:4000/health" -UseBasicParsing
```

**Frontend (porta 3000):**
```powershell
# Verificar se está rodando
netstat -ano | findstr ":3000"

# Testar conexão
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
```

### 2. Iniciar os servidores

**Opção 1 - Script automatizado (recomendado):**
```powershell
npm run servers:start
```

**Opção 2 - Script PowerShell:**
```powershell
.\scripts\start.ps1
```

**Opção 3 - Manualmente:**

Terminal 1 - Backend:
```powershell
cd backend
npm run dev
```

Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```

### 3. Verificar dependências instaladas

Certifique-se de que as dependências estão instaladas:

```powershell
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 4. Verificar variáveis de ambiente

**Backend** (`backend/.env`):
```
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=dev-secret-mude-em-producao
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000
```

### 5. Verificar portas em uso

Se as portas 3000 ou 4000 estiverem ocupadas:

```powershell
# Ver processos usando a porta 3000
netstat -ano | findstr ":3000"
# Matar processo (substitua PID pelo número do processo)
taskkill /F /PID <PID>

# Ver processos usando a porta 4000
netstat -ano | findstr ":4000"
# Matar processo
taskkill /F /PID <PID>
```

### 6. Verificar firewall/antivírus

Alguns firewalls ou antivírus podem bloquear conexões locais. Tente:
- Desabilitar temporariamente o firewall
- Adicionar exceção para Node.js
- Verificar se o antivírus não está bloqueando

### 7. Verificar logs de erro

**Backend:**
- Verifique a janela do terminal onde o backend está rodando
- Procure por erros de conexão com o banco de dados
- Verifique se o Prisma está configurado corretamente

**Frontend:**
- Verifique a janela do terminal onde o frontend está rodando
- Abra o DevTools do navegador (F12) e verifique a aba Console
- Verifique a aba Network para ver requisições falhando

### 8. Reiniciar os servidores

Se nada funcionar, tente reiniciar:

```powershell
# Parar servidores
npm run servers:stop

# Aguardar alguns segundos
Start-Sleep -Seconds 3

# Iniciar novamente
npm run servers:start
```

### 9. Verificar banco de dados

Se o backend não conseguir conectar ao banco:

```powershell
cd backend
npm run db:generate
npm run db:push
```

### 10. Acessar a aplicação

Após iniciar os servidores, acesse:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Health Check:** http://localhost:4000/health

## Problemas Comuns

### Backend não inicia
- Verifique se a porta 4000 está livre
- Verifique se o arquivo `.env` existe em `backend/`
- Verifique se o Prisma está configurado: `npm run db:generate`

### Frontend não inicia
- Verifique se a porta 3000 está livre
- Verifique se o arquivo `.env.local` existe em `frontend/`
- Verifique se as dependências estão instaladas: `npm install`

### Erro 502 Bad Gateway
- O frontend está rodando, mas o backend não está
- Verifique se o backend está rodando na porta 4000
- Verifique se `NEXT_PUBLIC_API_URL` está correto no `.env.local`

### Backend não fica online ao usar `npm run servers:start`
O script abre duas janelas (backend e frontend). Se a janela do **Backend** abrir e fechar logo em seguida, o processo do backend está encerrando com erro.

1. **Ver o erro:** rode o backend direto no terminal (na raiz do projeto):
   ```powershell
   npm run backend
   ```
   A mensagem de erro que aparecer é a causa (ex.: banco não encontrado, porta em uso, falta de `.env`).

2. **Se aparecer erro de permissão (EPERM / esbuild / tsx):** use a versão que compila e roda com Node (sem tsx):
   ```powershell
   npm run backend:node
   ```
   Na primeira vez ele faz o build (`tsc`); depois só sobe a API.

3. **Confira o ambiente do backend:**
   - Existe o arquivo `backend/.env`? (copie de `backend/.env.example` se precisar.)
   - No `backend`, já rodou `npm run db:generate` e `npm run db:push`?

### CORS Error
- Verifique se `CORS_ORIGIN` no backend inclui `http://localhost:3000`
- Reinicie o backend após alterar o `.env`

## Ainda com problemas?

1. Verifique os logs completos nos terminais
2. Verifique se todas as dependências estão instaladas
3. Tente limpar cache: `npm cache clean --force`
4. Tente deletar `node_modules` e reinstalar: `rm -r node_modules && npm install`
