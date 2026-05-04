# DEBIT-005 — Busca Publica Nao Implementada (Frontend)

> Tipo: Feature
> Prioridade: Media
> Status: Pendente
> Referencia: [PRD.md](../../PRD.md) secao 6.5 | [USER_STORIES.md](../../USER_STORIES.md) US-1100 a US-1102

---

## Problema

As paginas de busca publica de vagas e devs nao estao implementadas no frontend. Embora exista um `PublicJobService` com logica de busca, nao ha componentes de UI para:
- Visitantes buscarem vagas abertas
- Visitantes buscarem devs por nome ou skill
- Devs logados verem vagas ordenadas por score de match
- Empresas buscarem devs com score por vaga de referencia

---

## Escopo

### Paginas a implementar

#### 1. Busca de vagas — `/jobs`

**Filtros:** texto, skill, modalidade, modelo de contratacao, senioridade, municipio
**Ordenacao:** match_score (dev logado) ou data de criacao (visitante)
**Paginacao:** 12 por pagina, cards com: titulo, empresa, skills, modalidade, senioridade

#### 2. Busca de devs (publica) — `/developers`

**Filtros:** nome (case-insensitive), skill
**Paginacao:** 12 por pagina, cards com: nome, titulo, avatar, skills principais

#### 3. Busca de devs (empresa) — `/company/search`

**Filtros:** texto, skill, nivel minimo, municipio, vaga de referencia
**Ordenacao:** score de match (se vaga informada)

---

## Dependencia

- Requer que o modulo de busca do backend esteja implementado (ver [DEBIT-005 Backend](../back/DEBIT-005-search-module.md))

---

## Criterios de aceite

- [ ] Pagina de busca de vagas acessivel publicamente
- [ ] Filtros funcionais com UI de selecao (dropdowns, autocomplete de skill)
- [ ] Paginacao funcional (12 por pagina)
- [ ] Score de match exibido para dev logado
- [ ] Busca publica de devs com filtros
- [ ] Busca de devs para empresa com vaga de referencia
- [ ] Layout responsivo

---

## Arquivos impactados

- `frontend/src/app/features/public/` (busca de vagas e devs)
- `frontend/src/app/features/company/search/` *(novo)*
- `frontend/src/app/core/services/search.service.ts` *(novo)*
