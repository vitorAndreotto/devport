# DEBIT-001 — Inconsistencias na Documentacao

> Tipo: Docs
> Prioridade: Baixa
> Status: ✅ Resolvido (2026-05-03)

---

## Problema

Existem divergencias entre os documentos do projeto que podem causar confusao durante o desenvolvimento.

---

## Inconsistencias detectadas

### 1. Pesos do matching divergem entre documentos

| Criterio | PRD (secao 6.4.5) | RESUME.md | Implementacao |
|---|---|---|---|
| Skills | 50% | 60% | 50% |
| Experiencia | 25% | 20% | 25% |
| Modalidade + Localizacao | 10% | 10% | 10% |
| Faixa salarial | 15% | 10% | 15% |

**RESUME.md esta desatualizado.** A implementacao segue o PRD corretamente.

### 2. Headers de secao do PRD divergem da formula final

No PRD, os headers das subsecoes de matching mostram pesos diferentes da formula final:
- Secao 6.4.1 diz "Skills (40%)" mas a formula usa 50%
- Secao 6.4.2 diz "Experiencia (20%)" mas a formula usa 25%
- Secao 6.4.4 diz "Faixa Salarial (30%)" mas a formula usa 15%

A **formula final (secao 6.4.5) e a fonte da verdade** e esta correta: `50/25/10/15`.

### 3. work_mode vs work_modes no perfil do dev

| Documento | Campo |
|---|---|
| API_CONTRACT.md (secao 2.1) | `work_mode` (singular, enum unico) |
| DATA_MODEL.md (secao 2.4) | `work_modes` (plural, jsonb array) |
| PRD (secao 6.1.1) | `modalidades preferidas` (array, multipla selecao) |

O PRD e DATA_MODEL concordam (array de multiplas modalidades). O API_CONTRACT mostra `work_mode` singular que nao condiz com a modelagem de multipla selecao.

### 4. User Stories desatualizadas

O resumo no USER_STORIES.md conta 61 stories, mas o total real conforme as historias listadas pode diferir apos as adicoes da v2 (candidaturas, devs salvos, unidades).

---

## Correcoes sugeridas

1. Atualizar RESUME.md com os pesos corretos do matching (50/25/10/15)
2. Corrigir headers das subsecoes 6.4.1, 6.4.2, 6.4.4 do PRD para refletir os pesos da formula
3. Padronizar API_CONTRACT.md para usar `work_modes` (plural, array) no perfil do dev
4. Revalidar contagem de User Stories no resumo

---

## Criterios de aceite

- [x] RESUME.md com pesos de matching corretos (50/25/10/15)
- [x] Headers de subsecao do PRD alinhados com a formula final (6.4.1 → 50%, 6.4.2 → 25%, 6.4.4 ja 15%)
- [x] API_CONTRACT.md usando `work_modes` (array) consistente com DATA_MODEL
- [x] Contagem de User Stories validada (real: 57 — Must 47, Should 8, Could 2; Experiencia 4→5)

---

## Confirmacao no backend

| Tema | Implementacao atual | Documentacao corrigida |
|---|---|---|
| Pesos do matching | `SCORE_WEIGHTS` em [domain/constants.ts](../../../backend/src/matching/domain/constants.ts) = `{skills: 0.50, experience: 0.25, modality: 0.10, salary: 0.15}` | RESUME.md + PRD 6.4.1/6.4.2 |
| `work_modes` no perfil | [dev-profile.entity.ts](../../../backend/src/dev-profile/dev-profile.entity.ts) → `@Column({ name: 'work_modes', type: 'jsonb', nullable: true }) workModes: string[] \| null` | API_CONTRACT secao 2.1 |
