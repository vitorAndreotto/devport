# DEBIT-001 — Pipeline CI/CD Ausente (Infraestrutura)

> Tipo: DevOps
> Prioridade: Alta
> Status: Pendente

---

## Problema

O projeto nao possui nenhuma pipeline de CI/CD configurada. Nao ha GitHub Actions, GitLab CI ou qualquer outro sistema de integracao continua. Isso significa que:
- Pull requests sao mergeadas sem verificacao automatizada
- Nao ha build automatico para detectar erros de compilacao
- Nao ha execucao automatica de testes
- Nao ha lint check automatico
- Deploy e totalmente manual

---

## Solucao

Configurar GitHub Actions com pipelines para CI (validacao) e CD (deploy futuro).

---

## Escopo

### Pipeline de CI (Pull Requests)

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]

jobs:
  backend:
    - Checkout
    - Setup Node.js
    - Install dependencies (npm ci)
    - Lint (npm run lint)
    - Build (npm run build)
    - Unit tests (npm run test)
    - E2E tests (npm run test:e2e) — com PostgreSQL e Redis via services

  frontend:
    - Checkout
    - Setup Node.js
    - Install dependencies (npm ci)
    - Lint (npm run lint)
    - Build (npm run build)
    - Unit tests (npm run test -- --no-watch --browsers=ChromeHeadless)
```

### Checks obrigatorios

| Check | Bloqueia merge? |
|---|---|
| Backend lint | Sim |
| Backend build | Sim |
| Backend unit tests | Sim |
| Backend E2E tests | Sim |
| Frontend lint | Sim |
| Frontend build | Sim |
| Frontend tests | Sim |

---

## Criterios de aceite

- [ ] Workflow de CI executado em push e pull requests
- [ ] Backend: lint, build e testes passando
- [ ] Frontend: lint, build e testes passando
- [ ] PostgreSQL e Redis disponiveis como services para E2E
- [ ] Status checks obrigatorios configurados no branch `main`
- [ ] Workflow funcional e verde no primeiro PR

---

## Arquivos impactados

- `.github/workflows/ci.yml` *(novo)*
- `.github/workflows/cd.yml` *(futuro, opcional)*
