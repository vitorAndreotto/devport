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
docker exec -i devport-pgsql psql -U devport -d devport < database/seeds/01_skill_tree.sql
```

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
