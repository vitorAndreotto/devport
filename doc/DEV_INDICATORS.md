# Indicadores do Desenvolvedor — Dev Port

> Versao: 1.0
> Data: 2026-04-17
> Status: Draft
> Referencia: [PRD.md](PRD.md) secao 6.6 | [DATA_MODEL.md](DATA_MODEL.md)

---

## Visao Geral

Conjunto de metricas e indicadores que o desenvolvedor visualiza no seu dashboard. Divididos em **pessoais** (calculados para o dev logado) e **gerais** (agregados da plataforma).

**Fontes de dados:** `match_scores`, `jobs`, `job_skills`, `dev_skills`, `dev_profiles`, `experiences`, `job_applications`, `skill_tree`, `cities`

---

## Cache Redis (modelo granular)

Todos os indicadores sao cacheados no Redis. O modelo e **hibrido** — usa **HASH** para metricas relacionadas de uma mesma entidade (skill, senioridade, modalidade) e **JSON STRING** para listas/rankings.

### Convencao de chaves

```
indicator:{escopo}:{entidade}:{id}:{aspecto}
```

| Escopo | Significado |
|---|---|
| `global` | Metricas agregadas do mercado (independem do dev) |
| `dev:{dev_id}` | Metricas pessoais do dev |

### Por que HASH em vez de N strings?

Em vez de ter 4-8 chaves separadas para metricas relacionadas:
```
indicator:global:skill:abc:devs:beginner
indicator:global:skill:abc:devs:intermediate
indicator:global:skill:abc:devs:advanced
indicator:global:skill:abc:devs:expert
indicator:global:skill:abc:devs:total
```

Usamos **1 HASH com fields**:
```
indicator:global:skill:abc:devs  HASH {
  total, beginner, intermediate, advanced, expert,
  avg_years
}
```

**Beneficios:**
- 1 `HGETALL` retorna tudo — menos round-trips
- Update atomico via `HSET` multiplo
- Memoria mais compacta (Redis ziplist encoding pra HASHes pequenos)
- TTL unica para o conjunto (todas as metricas dessa skill expiram juntas)

### Mapa completo de chaves

#### Globais (mercado)

| Chave | Tipo | Fields / Conteudo | TTL |
|---|---|---|---|
| `indicator:global:skill:{skill_id}:devs` | HASH | `total`, `beginner`, `intermediate`, `advanced`, `expert`, `avg_years` | 6h |
| `indicator:global:skill:{skill_id}:jobs` | HASH | `total`, `required`, `expected`, `differential`, `min_level_beginner`, `min_level_intermediate`, `min_level_advanced`, `min_level_expert`, `avg_min_level` | 6h |
| `indicator:global:seniority:{seniority}:jobs` | HASH | `count`, `clt_avg_min`, `clt_avg_max`, `pj_avg_min`, `pj_avg_max` | 6h |
| `indicator:global:work_mode:{mode}:jobs` | HASH | `count`, `pct` | 6h |
| `indicator:global:ranking:top_skills:{kind}` | JSON | Array de `{skill_id, demand}` (10 itens). `kind`: `overall`, `required`, `expected`, `differential` | 6h |

#### Pessoais (prefixo `indicator:dev:{dev_id}:`)

| Chave (sufixo) | Tipo | Fields / Conteudo | TTL |
|---|---|---|---|
| `score` | HASH | `avg_general`, `avg_skills`, `avg_experience`, `avg_modality`, `avg_salary`, `total_matches`, `weakest`, `weakest_value` | 3h |
| `score:seniority:{seniority}` | HASH | mesmos fields, agregados por senioridade | 3h |
| `score:distribution` | HASH | `0-19`, `20-39`, `40-59`, `60-79`, `80-100` | 3h |
| `skills:top` | JSON | Top skills do dev com popularidade | 3h |
| `skills:gap` | JSON | Skills required que o dev nao tem | 3h |
| `skills:differentials` | JSON | Skills onde `is_differential = true` | 3h |
| `skills:to_improve` | JSON | Skills onde `above_market = false` | 3h |
| `applications` | HASH | `total`, `pending`, `accepted`, `rejected`, `withdrawn`, `acceptance_rate` | 30min |
| `profile:completeness` | HASH | `score`, `missing_count` | 12h |
| `profile:completeness:sections` | JSON | Detalhes das secoes (`name`, `label`, `weight`, `done`) | 12h |

### TTL diferenciado

| Categoria | TTL | Justificativa |
|---|---|---|
| `indicator:global:*` | 6h | Mercado muda devagar; recalculo proativo via batch |
| `indicator:dev:*:score:*` | 3h | Alinhado com o batch matching |
| `indicator:dev:*:skills:*` | 3h | Idem |
| `indicator:dev:*:profile:*` | 12h | Perfil muda raramente; invalidar no save |
| `indicator:dev:*:applications` | 30min | Sensivel a mudancas (aplicar/aceitar) |

### Invalidacao

| Evento | Chaves invalidadas |
|---|---|
| Dev edita skills | `indicator:dev:{id}:skills:*` + `indicator:global:skill:{skill_id}:devs` |
| Dev aplica/retira candidatura | `indicator:dev:{id}:applications` |
| Empresa cria/edita vaga | `indicator:global:skill:{skill_id}:jobs` (skills da vaga) + `indicator:global:seniority:{sen}:jobs` + rankings |
| Batch matching termina pra um dev | `indicator:dev:{id}:score:*` |
| Dev edita perfil | `indicator:dev:{id}:profile:*` |

### Formato dos valores no HASH

Todos os fields sao armazenados como **string** (Redis converte ao escrever). Numeros sao parseados de volta no read:

```
HGETALL indicator:global:skill:abc:devs
1) "total"          2) "35421"
3) "beginner"       4) "1245"
5) "intermediate"   6) "8923"
7) "advanced"       8) "19847"
9) "expert"        10) "5406"
11) "avg_years"    12) "3.4"
```

### Padrao de leitura no service

```typescript
// 1. Tenta ler do cache
const cached = await this.redis.hgetall(key);
if (cached && Object.keys(cached).length > 0) {
  return this.parseHash(cached);
}

// 2. Calcula
const value = await this.compute();

// 3. Persiste com pipeline
await this.redis.multi()
  .hset(key, value)
  .expire(key, ttl)
  .exec();

return value;
```

---

## 1. Salario

### 1.1 Media salarial por senioridade e modelo (Geral)

Mediana e media das faixas salariais das vagas abertas, agrupadas por senioridade (`intern`, `junior`, `mid`, `senior`, `lead`, `specialist`) e modelo de contratacao (`clt`, `pj`).

**Query base:**
```sql
SELECT seniority,
  AVG(salary_clt_min) as avg_clt_min, AVG(salary_clt_max) as avg_clt_max,
  AVG(salary_pj_min) as avg_pj_min, AVG(salary_pj_max) as avg_pj_max
FROM jobs WHERE status = 'open'
GROUP BY seniority
```

**Exibicao:** Tabela ou grafico de barras por senioridade.

### 1.2 Posicao do dev na faixa salarial (Pessoal)

Onde o intervalo salarial do dev se posiciona em relacao a distribuicao de vagas da mesma senioridade.

**Calculo:**
- Percentil do `salary_clt_min` do dev dentro das faixas CLT das vagas (para a senioridade estimada do dev)
- Idem para PJ se o dev informou faixa PJ

**Exibicao:** Barra com marcador mostrando "Voce esta no percentil X".

### 1.3 Gap salarial (Pessoal)

Diferenca entre a pretensao do dev e a media das vagas compativeis (score > 20).

**Calculo:**
```
gap = media(job.salary_*_max das vagas compativeis) - dev.salary_*_max
```

**Exibicao:** Valor positivo = "O mercado paga X acima da sua pretensao" / negativo = "Sua pretensao esta X acima da media do mercado".

### 1.4 % das vagas que pagam acima da pretensao (Pessoal)

Percentual das vagas abertas (mesmo modelo de contratacao) onde `job.salary_*_max >= dev.salary_*_min`.

---

## 2. Localizacao e Modalidade

### 2.1 Vagas por faixa de raio (Pessoal)

Quantidade de vagas abertas (onsite/hybrid) agrupadas por distancia do dev: 0-10 km, 10-20 km, 20-30 km, 30-40 km, 40-50 km, 50+ km.

**Calculo:** Haversine entre `cities.latitude/longitude` do dev e de cada vaga presencial/hibrida.

**Exibicao:** Grafico de barras horizontal.

### 2.2 Distribuicao de modalidades (Geral)

Percentual das vagas abertas por modalidade: remote, hybrid, onsite.

**Query base:**
```sql
SELECT work_mode, COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as pct
FROM jobs WHERE status = 'open'
GROUP BY work_mode
```

**Exibicao:** Donut chart ou 3 badges com %.

### 2.3 Modalidades das vagas compativeis (Pessoal)

Distribuicao de modalidades apenas nas vagas com match > 20 para o dev.

### 2.4 Top 5 cidades com mais vagas para o perfil (Pessoal)

Cidades com maior quantidade de vagas compativeis (score > 20), ordenadas por contagem.

---

## 3. Score de Match

### 3.1 Media do score geral (Pessoal)

Media aritmetica de `match_scores.score` para o dev.

### 3.2 Medias dos sub-scores (Pessoal)

| Sub-score | Coluna |
|---|---|
| Skills | `match_scores.skill_score` |
| Experiencia | `match_scores.experience_score` |
| Modalidade | `match_scores.modality_score` |
| Salario | `match_scores.salary_score` |

**Exibicao:** Radar chart (spider) com os 4 eixos.

### 3.3 Distribuicao por faixa de score (Pessoal)

Quantidade de vagas agrupadas por faixa: 0-20, 20-40, 40-60, 60-80, 80-100.

**Exibicao:** Histograma horizontal.

### 3.4 Sub-score mais fraco — "Onde melhorar" (Pessoal)

O sub-score com menor media. Acompanhado de sugestao acionavel:

| Sub-score fraco | Sugestao |
|---|---|
| Skills | "Adicione skills em alta demanda: [top 3 skills gap]" |
| Experiencia | "Vagas pedem em media X anos. Voce tem Y." |
| Modalidade | "X% das vagas sao remotas. Considere aceitar remoto." |
| Salario | "Sua pretensao esta acima de X% das vagas." |

### 3.5 Evolucao do score medio ao longo do tempo (Pessoal)

Media do score agrupada por semana/mes (baseado em `calculated_at`).

**Exibicao:** Line chart com tendencia.

---

## 4. Skills

### 4.1 Top 5 skills mais pedidas (Geral)

Skills com maior contagem em `job_skills` de vagas abertas, com a media da senioridade exigida.

**Query base:**
```sql
SELECT st.name, st.category, COUNT(*) as demand,
  ROUND(AVG(CASE js.min_level
    WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2
    WHEN 'advanced' THEN 3 WHEN 'expert' THEN 4 END), 1) as avg_level
FROM job_skills js
JOIN jobs j ON j.id = js.job_id AND j.status = 'open'
JOIN skill_tree st ON st.id = js.skill_id
GROUP BY st.id, st.name, st.category
ORDER BY demand DESC
LIMIT 5
```

### 4.2 Popularidade das skills do dev (Pessoal)

Para cada skill do dev: em quantas % das vagas abertas ela aparece como exigencia.

**Exibicao:** Lista ordenada por popularidade, com badge de % e icone de tendencia.

### 4.3 Skills gap — demanda alta que o dev nao tem (Pessoal)

Top 5 skills mais pedidas nas vagas que o dev **NAO** possui.

**Calculo:**
```sql
SELECT st.name, COUNT(*) as demand
FROM job_skills js
JOIN jobs j ON j.id = js.job_id AND j.status = 'open'
JOIN skill_tree st ON st.id = js.skill_id
WHERE js.skill_id NOT IN (SELECT skill_id FROM dev_skills WHERE dev_profile_id = :devId)
GROUP BY st.id, st.name
ORDER BY demand DESC
LIMIT 5
```

**Exibicao:** Cards com "Skills em alta que voce nao tem" + botao "Adicionar ao perfil".

### 4.4 Nivel do dev vs nivel exigido (Pessoal)

Para cada skill do dev que tambem e exigida por vagas: comparacao do nivel do dev com a media do nivel minimo exigido.

| Situacao | Indicador |
|---|---|
| Dev acima da media | "Voce supera o exigido" |
| Dev na media | "Alinhado com o mercado" |
| Dev abaixo da media | "Mercado pede nivel mais alto" |

### 4.5 Cobertura de categorias (Pessoal)

Percentual das categorias de skills pedidas pelas vagas compativeis que o dev cobre.

**Categorias:** `language`, `framework`, `database`, `devops`, `tool`, `methodology`, `soft_skill`, `other`

**Exibicao:** Barra de progresso por categoria. Ex: "Frameworks: 3/5 cobertos (60%)".

### 4.7 Insights de Skills (Geral + Pessoal)

Endpoint dedicado: `GET /dev/indicators/skills`

Combina top skills por requirement com o nivel medio do mercado (vagas) e o nivel medio dos devs que possuem cada skill, permitindo identificar oportunidades de aprimoramento ou diferencial.

**Indicadores gerais por requirement (`required`, `expected`, `differential`):**

Top 10 skills mais pedidas em vagas abertas. Para cada uma:

| Campo | Descricao |
|---|---|
| `demand` | Quantas vagas pedem essa skill (com esse requirement) |
| `market_avg_level` | Nivel medio exigido pelas vagas (1-4) |
| `dev_avg_level` | Nivel medio dos devs que ja possuem essa skill (1-4) |

**Indicadores pessoais:**

`my_required_analysis` — Para cada skill `required` mais pedida que o dev possui:

| Campo | Descricao |
|---|---|
| `my_level` | Nivel do dev nessa skill |
| `market_avg_level` | Nivel medio exigido pelas vagas |
| `dev_avg_level` | Nivel medio dos demais devs |
| `above_market` | `my_level > market_avg_level` |
| `above_dev_avg` | `my_level > dev_avg_level` |
| `is_differential` | Ambos acima → real diferencial |

**Casos de uso:**
- "Onde preciso melhorar?" → skills com `above_market: false`
- "Quais sao meus diferenciais reais?" → skills com `is_differential: true`

`my_required_gap` — Top 10 skills `required` mais pedidas que o dev **NAO** possui (oportunidades de aprendizado).

**Cache Redis:**
- `indicator:skills-top-by-requirement` (geral, 6h)
- `indicator:skills-dev-avg-level` (geral, 6h)
- `dev:{dev_id}:skills-insights` (pessoal, 3h)

---

### 4.8 Gaps das Top Vagas do Dev (Pessoal)

Substitui o antigo "Skills para melhorar" baseado em todas as vagas do mercado. Agora foca apenas nas **vagas onde o dev tem maior chance** (score >= 60), elencando skills que sao gargalo:

- **Gap forte** (`gap_type: 'strong'`): a top vaga pede mas o dev **NAO** tem a skill
- **Gap medio** (`gap_type: 'medium'`): o dev tem a skill mas com **nivel abaixo** do exigido pelas top vagas

**Logica:**
1. Selecionar as top vagas do dev (score >= 60, top 50)
2. Listar todas as skills exigidas nessas vagas com contagem de aparicoes
3. Para cada skill: comparar com o que o dev possui
4. Ordenar por: gaps fortes primeiro (mais impacto), depois por aparicoes nas top vagas

**Resposta:**

| Campo | Descricao |
|---|---|
| `skill_id`, `name`, `category` | Dados da skill |
| `appearances` | Quantas das top vagas do dev pedem essa skill |
| `avg_required_level` | Nivel medio exigido (1-4) |
| `required_label` | Label do nivel medio exigido |
| `my_level` | Nivel atual do dev (null se nao tem) |
| `my_level_num` | Idem em numero (null se nao tem) |
| `gap_type` | `'strong'` ou `'medium'` |
| `best_match_score` | Maior score de match entre as vagas que pedem essa skill |

**Caso de uso:** "Quais skills devo focar para fechar minhas melhores oportunidades?"

**Cache Redis:** `indicator:dev:{dev_id}:skills:top_matches_gaps` (JSON, 3h)

---

### 4.6 Skills sem demanda (Pessoal)

Skills do dev que nenhuma vaga aberta pede. Nao necessariamente ruins — pode indicar nichos ou skills desatualizadas.

**Exibicao:** Lista discreta com label "Sem demanda no momento".

---

## 5. Candidaturas

### 5.1 Resumo de candidaturas (Pessoal)

| Metrica | Calculo |
|---|---|
| Total | COUNT(*) |
| Pendentes | COUNT(status = 'pending') |
| Aceitas | COUNT(status = 'accepted') |
| Rejeitadas | COUNT(status = 'rejected') |
| Retiradas | COUNT(status = 'withdrawn') |

**Exibicao:** 4 cards com numeros.

### 5.2 Taxa de aceite (Pessoal)

```
taxa = accepted / (accepted + rejected) * 100
```

Exclui pending e withdrawn do denominador.

### 5.3 Score medio: aceitas vs rejeitadas (Pessoal)

Compara a media do match score das candidaturas aceitas vs rejeitadas.

**Insight:** "Suas candidaturas aceitas tinham score medio de 72. As rejeitadas, 34."

### 5.4 Tempo medio de resposta (Pessoal)

Media de `updated_at - created_at` para candidaturas com status final (accepted/rejected).

---

## 6. Experiencia e Carreira

### 6.1 Anos totais vs media da senioridade (Pessoal)

Soma total de meses de experiencia do dev vs media da plataforma para a mesma faixa de senioridade.

### 6.2 Tempo medio por empresa (Pessoal)

Media de duracao das experiencias do dev.

### 6.3 Diversidade de stack (Pessoal)

Quantidade de categorias distintas de skills associadas as experiencias do dev.

---

## 7. Competitividade

### 7.1 Ranking nas candidaturas (Pessoal)

Para cada vaga que o dev se candidatou: posicao dele no ranking de match score entre todos os candidatos da mesma vaga.

**Exibicao:** "Voce esta em #3 de 12 candidatos nesta vaga."

### 7.2 Concorrentes com stack similar (Geral)

Quantidade de devs na plataforma que compartilham >= 70% das skills do dev.

### 7.3 Devs salvos (Pessoal)

Quantidade de vezes que empresas salvaram o dev em shortlists. *(Disponivel quando modulo saved_developers for implementado.)*

---

## 8. Perfil

### 8.1 Completude do perfil (Pessoal)

Percentual de secoes preenchidas com peso:

| Secao | Peso | Condicao |
|---|---|---|
| Bio + titulo + avatar | 10% | Todos preenchidos |
| Skills | 20% | >= 5 skills |
| Experiencias | 20% | >= 1 experiencia |
| Formacao | 10% | >= 1 formacao |
| Projetos | 10% | >= 1 projeto |
| Pretensao salarial | 15% | CLT ou PJ preenchido |
| Localizacao | 10% | city_id preenchido |
| Links | 5% | >= 1 link |

**Exibicao:** Barra de progresso circular com % e lista de "Falta preencher: [secao]".

### 8.2 Impacto de completar secoes (Pessoal)

Estimativa de melhoria no match se o dev preencher secoes faltantes.

**Heuristica:**
- Sem salario → "Preencher pretensao salarial pode melhorar seu match em ate 15% (peso do criterio salario)"
- Sem localizacao → "Informar cidade pode melhorar 10% (criterio modalidade)"

---

## Priorizacao

### Alta (MVP do dashboard)
- 3.1 Media do score geral
- 3.2 Medias dos sub-scores (radar chart)
- 3.4 Sub-score mais fraco + sugestao
- 4.3 Skills gap (top 5)
- 4.2 Popularidade das skills do dev
- 5.1 Resumo de candidaturas
- 8.1 Completude do perfil

### Media
- 1.1 Media salarial por senioridade
- 1.2 Posicao do dev na faixa
- 2.2 Distribuicao de modalidades
- 3.3 Distribuicao por faixa de score
- 4.1 Top 5 skills mais pedidas
- 4.4 Nivel do dev vs exigido
- 5.2 Taxa de aceite

### Baixa
- 1.3 Gap salarial
- 1.4 % vagas acima da pretensao
- 2.1 Vagas por faixa de raio
- 2.4 Top 5 cidades
- 3.5 Evolucao temporal
- 4.5 Cobertura de categorias
- 4.6 Skills sem demanda
- 5.3 Score aceitas vs rejeitadas
- 5.4 Tempo medio de resposta
- 6.* Experiencia e carreira
- 7.* Competitividade
- 8.2 Impacto de completar secoes
