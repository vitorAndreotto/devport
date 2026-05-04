# Dev Port

Plataforma de recrutamento tech onde devs constroem perfis profissionais e empresas publicam vagas, com matching inteligente baseado em árvore de skills.

**Stack:** NestJS · Angular · PostgreSQL · Redis · Docker

Documentação completa em [`/doc/`](doc/RESUME.md).

---

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose
- [Node.js 22+](https://nodejs.org/) (para desenvolvimento local sem Docker)

---

## Inicialização

### 1. Clonar e configurar variáveis de ambiente

```bash
git clone <repo-url> devport
cd devport

# Backend
cp backend/.env.example backend/.env

# Banco de dados
cp database/pgsql/.env.example database/pgsql/.env
cp database/redis/.env.example database/redis/.env
```

Ajuste as senhas nos arquivos `.env` conforme necessário.

### 2. Subir os containers

```bash
docker compose up -d
```

Aguarde todos ficarem saudáveis:

```bash
docker compose ps
```

| Container | Porta | Descrição |
|---|---|---|
| `devport-backend` | `localhost:3000` | API NestJS |
| `devport-frontend` | `localhost:4200` | SPA Angular |
| `devport-pgsql` | `localhost:5432` | PostgreSQL 17 |
| `devport-redis` | `localhost:6379` | Redis 7 |

### 3. Rodar migrations

As migrations rodam automaticamente ao iniciar o backend (`migrationsRun: true`).

Para rodar manualmente (desenvolvimento local sem Docker):

```bash
cd backend
npm run migration:run
```

### 4. Rodar seeds

Após as migrations, popule a árvore de skills:

```bash
docker exec -i devport-pgsql psql -U devport -d devport < database/seeds/01_skill_tree.sql
```

Verifique:

```bash
docker exec devport-pgsql psql -U devport -d devport -c "SELECT category, COUNT(*) FROM skill_tree GROUP BY category ORDER BY category;"
```

---

## Comandos úteis

```bash
# Subir tudo
docker compose up -d

# Parar tudo
docker compose down

# Logs em tempo real
docker compose logs -f backend
docker compose logs -f frontend

# Resetar banco (cuidado: apaga tudo)
docker exec devport-pgsql psql -U devport -d devport -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker restart devport-backend

# Re-rodar seeds
for f in database/seeds/*.sql; do echo "=== $(basename $f) ===" && docker compose exec -T pgsql psql -U devport -d devport < "$f"; done
```

---

## Redis

O Redis é usado para cache (matches, indicadores), JWT blacklist e BullMQ (filas de batch matching).

```bash
# Abrir redis-cli interativo
docker compose exec redis redis-cli

# Limpar TODAS as chaves (cuidado: apaga tudo, inclusive blacklist e filas)
docker compose exec redis redis-cli FLUSHALL

# Limpar apenas matches
docker compose exec redis redis-cli --scan --pattern 'match:*' | xargs -r docker compose exec -T redis redis-cli DEL

# Limpar apenas indicadores
docker compose exec redis redis-cli --scan --pattern 'indicator:*' | xargs -r docker compose exec -T redis redis-cli DEL
```

### Inspeção rápida

```bash
# Listar todas as chaves (devs, use SCAN em produção)
docker compose exec redis redis-cli KEYS '*'

# Listar chaves por padrão
docker compose exec redis redis-cli KEYS 'indicator:dev:*'
docker compose exec redis redis-cli KEYS 'match:*'

# Total de chaves
docker compose exec redis redis-cli DBSIZE

# Ler um valor (string)
docker compose exec redis redis-cli GET 'indicator:global:ranking:top_skills:overall'

# Ler um HASH
docker compose exec redis redis-cli HGETALL 'indicator:global:seniority:senior:jobs'

# Ver TTL restante (em segundos)
docker compose exec redis redis-cli TTL 'indicator:dev:abc123:score'

# Stats do servidor
docker compose exec redis redis-cli INFO stats | head -20
docker compose exec redis redis-cli INFO memory | head -10
```

### Interface gráfica

Para uma UI visual, instale o [RedisInsight](https://redis.io/insight/) e conecte em `localhost:6379`.

---

## Estrutura do projeto

```
devport/
├── backend/          # NestJS API
├── frontend/         # Angular SPA
├── database/
│   ├── pgsql/        # .env do PostgreSQL
│   ├── redis/        # .env do Redis
│   └── seeds/        # SQL seeds (skill tree)
├── doc/              # Documentação (PRD, Data Model, API Contract, etc.)
├── docker-compose.yml
└── README.md
```
