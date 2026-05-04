# DEBIT-005 — Modulo de Busca Nao Implementado (Backend)

> Tipo: Feature
> Prioridade: Media
> Status: Pendente
> Referencia: [PRD.md](../../PRD.md) secao 6.5 | [USER_STORIES.md](../../USER_STORIES.md) US-1100 a US-1102

---

## Problema

O modulo de busca esta documentado na arquitetura (`search/`) e no PRD (secao 6.5) mas nao foi implementado no backend. As buscas sao classificadas como Should Have (US-1100, US-1101) e Could Have (US-1102).

O frontend ja possui um `PublicJobService` com capacidade de busca de vagas, indicando que parte da interface esta preparada, mas o backend nao expoe endpoints de busca dedicados.

---

## Escopo

### Endpoints a implementar

#### 1. Busca de Vagas (para devs) — US-1100

```
GET /search/jobs
```

**Filtros:** texto (titulo/descricao), skill_id, modalidade, modelo de contratacao, senioridade, city_id
**Ordenacao:** `match_score` (dev logado) ou `recent` (visitante)
**Paginacao:** 12 por pagina

#### 2. Busca de Devs (para empresas) — US-1101

```
GET /search/developers
```

**Filtros:** texto (nome), skill_id, nivel minimo, city_id, job_id (referencia para score)
**Ordenacao:** score de match (se job_id informado)
**Paginacao:** 12 por pagina

#### 3. Busca de Devs (publica) — US-1102

```
GET /search/developers/public
```

**Filtros:** nome (case-insensitive), skill_id
**Paginacao:** 12 por pagina

---

## Implementacao sugerida

1. Criar `search/` module com controller e service
2. Usar QueryBuilder do TypeORM para filtros dinamicos
3. Integrar com `MatchingService` para ordenacao por score
4. Busca de texto via `ILIKE` no PostgreSQL
5. DTOs de query com validacao (`@MaxLength()` para prevenir payloads grandes)

---

## Criterios de aceite

- [ ] Busca de vagas com todos os filtros documentados
- [ ] Busca de devs para empresas com score de match
- [ ] Busca publica de devs (sem autenticacao)
- [ ] Paginacao de 12 por pagina
- [ ] Vagas fechadas nao aparecem na busca
- [ ] Score < 20 nao aparece nos resultados (quando aplicavel)

---

## Arquivos impactados

- `backend/src/search/` *(novo modulo)*
  - `search.module.ts`
  - `search.controller.ts`
  - `search.service.ts`
  - `dto/search-jobs-query.dto.ts`
  - `dto/search-devs-query.dto.ts`
- `backend/src/app.module.ts` (registrar modulo)
