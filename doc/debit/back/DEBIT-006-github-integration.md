# DEBIT-006 — Integracao GitHub Nao Implementada (Backend)

> Tipo: Feature
> Prioridade: Baixa
> Status: Pendente
> Referencia: [PRD.md](../../PRD.md) secao 6.1.6 | [USER_STORIES.md](../../USER_STORIES.md) US-600 a US-602

---

## Problema

O modulo de integracao com GitHub esta documentado na arquitetura (`github/`) e no PRD (secao 6.1.6) mas nao foi implementado no backend. As User Stories sao todas classificadas como Should Have.

O campo `github_username` ja existe no `dev_profiles`, mas nao ha endpoints para listar, importar ou sincronizar repositorios.

---

## Escopo

### Endpoints a implementar (conforme API_CONTRACT.md secao 7)

| Endpoint | Descricao | US |
|---|---|---|
| `GET /dev/github/repositories` | Listar repos publicos do username | US-601 |
| `POST /dev/github/import` | Importar repos selecionados como projetos | US-601 |
| `POST /dev/github/sync` | Sincronizar repos ja importados | US-602 |

### Regras

- Usar API publica do GitHub (sem OAuth no MVP)
- Importar: nome, descricao, linguagem, stars, URL
- Projetos importados com `source: github` e `github_repo_id`
- Sincronizacao atualiza dados de projetos com `source: github`
- Validar que `github_username` existe via API

---

## Implementacao sugerida

1. Criar `github/` module com controller e service
2. Usar `HttpModule` do NestJS para chamadas a API do GitHub
3. Rate limiting: API publica do GitHub permite 60 req/hora por IP
4. Tratar erros da API (404 username, 502 timeout)
5. Marcar repos deletados no GitHub como sinalizados

---

## Criterios de aceite

- [ ] Dev pode listar repos publicos do seu GitHub
- [ ] Dev pode importar repos selecionados como projetos
- [ ] Repos importados marcados com `source: github`
- [ ] Nao importa repo ja existente (duplicata por `github_repo_id`)
- [ ] Sincronizacao atualiza dados de repos ja importados
- [ ] Retorna 404 se perfil sem `github_username`
- [ ] Retorna 502 se API do GitHub falhar

---

## Arquivos impactados

- `backend/src/github/` *(novo modulo)*
  - `github.module.ts`
  - `github.controller.ts`
  - `github.service.ts`
  - `dto/import-repositories.dto.ts`
- `backend/src/app.module.ts` (registrar modulo)
- `backend/src/config/github.config.ts` (configuracao de API)
