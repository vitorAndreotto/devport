# PRD — Dev Port

> Product Requirements Document
> Versão: 2.0
> Data: 2026-04-11
> Status: Draft

---

## 1. Visão do Produto

O **Dev Port** é uma plataforma de recrutamento tech onde desenvolvedores constroem perfis profissionais completos e empresas publicam vagas — com um sistema de matching inteligente que conecta os dois lados.

**Metáfora central:** um porto digital onde devs "ancoram" seus perfis e empresas "atracam" suas vagas. O sistema de matching funciona como uma bússola que aponta as melhores conexões.

---

## 2. Problema

| Lado | Dor |
|---|---|
| **Devs** | Não têm um espaço unificado para apresentar habilidades de forma estruturada. Perdem tempo aplicando para vagas que não combinam com seu perfil. |
| **Empresas** | Dificuldade em encontrar candidatos que realmente se encaixam nas necessidades técnicas. Filtrar currículos genéricos é demorado e ineficiente. |

---

## 3. Público-alvo

- Desenvolvedores de software (júnior a sênior) buscando visibilidade e vagas
- Estudantes de tecnologia montando seu primeiro portfólio
- Empresas de tecnologia buscando candidatos qualificados
- Recrutadores técnicos que precisam de filtros precisos

---

## 4. Objetivos do MVP

| Objetivo | Métrica de sucesso |
|---|---|
| Dev cria perfil completo | Perfil com todas as seções preenchidas |
| Dev importa projetos do GitHub | Repositórios listados automaticamente |
| Empresa publica vagas | Vaga criada com skills, modelo e localização |
| Match dev↔vaga funcional | Score de compatibilidade calculado e exibido |
| Dev encontra vagas com fit | Busca retorna vagas ordenadas por compatibilidade |
| Empresa encontra devs com fit | Busca retorna devs ordenados por compatibilidade |

---

## 5. Tipos de Usuário

### 5.1 Desenvolvedor (`dev`)

Pessoa física que monta seu perfil profissional e busca vagas.

**Pode:**
- Criar e gerenciar perfil, skills, formação, experiência e projetos
- Conectar GitHub e importar repositórios
- Buscar e visualizar vagas
- Ver score de compatibilidade com vagas
- Buscar outros devs
- Candidatar-se a vagas abertas
- Retirar candidatura
- Listar suas candidaturas e acompanhar status
- Definir situação profissional (`looking` ou `employed`)

**Não pode:**
- Publicar vagas
- Ver faixa salarial das vagas
- Ver perfil de empresa internamente (apenas público)

---

### 5.2 Empresa (`company`)

Pessoa jurídica que publica vagas e busca candidatos.

**Pode:**
- Criar e gerenciar perfil da empresa
- Publicar, editar, fechar e reabrir vagas
- Buscar devs por skills e compatibilidade com suas vagas
- Ver score de compatibilidade dos devs com suas vagas
- Definir faixa salarial (visível apenas internamente)
- Ver candidatos de suas vagas e aceitar/rejeitar candidaturas
- Salvar devs em shortlist vinculada a vagas específicas (registro interno)

**Não pode:**
- Criar perfil de dev
- Ver dados privados de devs

---

## 6. Escopo do MVP

### 6.1 Módulos do Dev

#### 6.1.1 Perfil do Dev (`dev-profile`)

Dados centrais do desenvolvedor.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Handle (identificador único) | string | Sim |
| Nome completo | string | Sim |
| Título/Cargo atual | string | Sim |
| Bio / Resumo profissional | text | Sim |
| Avatar (URL) | string | Não |
| E-mail de contato | string | Sim |
| Localização | string | Não |
| Modalidades preferidas | array de enum: `onsite`, `hybrid`, `remote` (múltipla seleção) | Não |
| Situação profissional | enum: `looking`, `employed` | Não |
| Pretensão salarial mínima | decimal | Não |
| Pretensão salarial máxima | decimal | Não |
| Links externos (GitHub, LinkedIn, site) | json/array | Não |

**Regras:**
- Cada usuário dev possui exatamente 1 perfil
- O perfil é público por padrão
- Bio limitada a 500 caracteres
- Handle é único, usado na URL pública (`/developers/vitorsantos`), aceita apenas letras minúsculas, números e hífens, entre 3 e 40 caracteres
- Situação profissional é informativa (visível no perfil público). Serve como alerta para empresas — devs empregados podem representar um empecilho na contratação
- Pretensão salarial **nunca** é exibida publicamente nem para empresas — usada apenas internamente para cálculo de compatibilidade salarial com vagas

---

#### 6.1.2 Skills do Dev (`dev-skills`)

Habilidades técnicas e comportamentais vinculadas à árvore de skills.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Skill (referência à árvore) | FK → skill_tree | Sim |
| Nível | enum: `beginner`, `intermediate`, `advanced`, `expert` | Sim |
| Anos de experiência | integer | Não |

**Regras:**
- Skills são selecionadas da árvore de skills (não texto livre)
- Não permitir skill duplicada no mesmo perfil
- Limite: 50 skills por perfil
- Nível é obrigatório (diferente da v1)

---

#### 6.1.3 Formação (`education`)

Sem alterações em relação à v1.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Instituição | string | Sim |
| Curso / Certificação | string | Sim |
| Tipo | enum (ver PRD v1) | Sim |
| Carga horária (horas) | integer | Condicional* |
| Data início | date | Não |
| Data conclusão | date | Não |
| Em andamento | boolean | Não |

**Tipos:** `technical`, `graduation`, `master`, `doctorate`, `postdoc`, `mba`, `course`, `certification`

**Regras:**
- Ordenação: mais recente primeiro
- Se "em andamento" = true, data conclusão deve ser nula
- *Carga horária obrigatória quando tipo = `course`

---

#### 6.1.4 Experiência (`experience`)

Sem alterações em relação à v1.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Empresa | string | Sim |
| Cargo | string | Sim |
| Descrição | text | Não |
| Data início | date | Sim |
| Data fim | date | Não |
| Atual | boolean | Não |

**Regras:**
- Ordenação: mais recente primeiro
- Se "atual" = true, data fim deve ser nula

---

#### 6.1.5 Projetos (`projects`)

Sem alterações em relação à v1.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome | string | Sim |
| Descrição | text | Sim |
| Tecnologias | json/array | Não |
| URL do repositório | string | Não |
| URL de demonstração | string | Não |
| Imagem (URL) | string | Não |

**Regras:**
- Projetos importados do GitHub marcados com `source: github`

---

#### 6.1.6 Integração GitHub (`github`)

Sem alterações em relação à v1.

| Funcionalidade | Descrição |
|---|---|
| Conectar conta | Dev informa username do GitHub |
| Importar repositórios | Lista repos públicos, permite selecionar |
| Sincronizar | Atualiza dados dos repos já importados |

**Regras:**
- API pública do GitHub (sem OAuth no MVP)
- Importar: nome, descrição, linguagem, stars, URL

---

### 6.2 Módulos da Empresa

#### 6.2.1 Perfil da Empresa (`company-profile`)

| Campo | Tipo | Obrigatório |
|---|---|---|
| Handle (identificador único) | string | Sim |
| Nome da empresa | string | Sim |
| CNPJ | string | Sim |
| Descrição / Sobre | text | Sim |
| Logo (URL) | string | Não |
| Site | string | Não |
| Setor de atuação | string | Sim |
| Tamanho | enum: `startup`, `small`, `medium`, `large`, `enterprise` | Sim |
| Município (sede) | FK → cities | Não |
| CEP | string | Não |
| Rua / Logradouro | string | Não |
| Bairro | string | Não |
| Número | string | Não |
| Complemento | string | Não |
| Links (LinkedIn, site de carreiras) | json/array | Não |

**Regras:**
- Cada usuário empresa possui exatamente 1 perfil
- Handle é único, usado na URL pública (`/companies/techcorp`), mesmas regras do handle de dev
- CNPJ deve ser único (sem duplicatas)
- Descrição limitada a 1000 caracteres
- Endere��o da sede é opcional (todos os campos)

---

#### 6.2.1.1 Unidades da Empresa (`company-units`)

Endereços de filiais/unidades adicionais da empresa.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome da unidade | string | Sim |
| Município | FK → cities | Sim |
| CEP | string | Sim |
| Rua / Logradouro | string | Sim |
| Bairro | string | Sim |
| Número | string | Sim |
| Complemento | string | Não |

**Regras:**
- Uma empresa pode ter múltiplas unidades
- Se uma unidade for criada, todos os campos de endereço são obrigatórios (exceto complemento)
- Unidades são gerenciadas pela empresa (CRUD)
- Unidades são exibidas no perfil público da empresa

---

#### 6.2.2 Vagas (`jobs`)

| Campo | Tipo | Obrigatório |
|---|---|---|
| Título da vaga | string | Sim |
| Descrição | text | Sim |
| Senioridade | enum: `intern`, `junior`, `mid`, `senior`, `lead`, `specialist` | Sim |
| Skills (com nível mínimo e exigência) | array de { skill_id, min_level, requirement } | Sim |
| Experiência mínima (anos) | integer | Sim |
| Modelo de contratação | enum: `clt`, `pj`, `clt_pj` | Sim |
| Faixa salarial mínima | decimal | Sim |
| Faixa salarial máxima | decimal | Sim |
| Exibir salário | boolean | Sim (default: false) |
| Benefícios | array de strings | Não |
| Modalidade | enum: `onsite`, `hybrid`, `remote` | Sim |
| Unidade de referência | FK → company_units (nullable) | Não |
| Município | FK → cities | Condicional* |
| CEP | string | Condicional* |
| Rua / Logradouro | string | Condicional* |
| Bairro | string | Condicional* |
| Número | string | Condicional* |
| Complemento | string | Não |
| Status | enum: `open`, `closed` | Sim |

**Regras:**
- *Endereço completo obrigatório quando modalidade = `onsite` ou `hybrid` (city_id, zip_code, street, neighborhood, number)
- Vaga pode referenciar uma unidade (`company_unit_id`) ou a sede (null) para pré-preencher o endereço no frontend
- O endereço da vaga é independente — preenchido automaticamente mas editável livremente
- Faixa salarial controlada por `show_salary`: se `true`, visível publicamente; se `false`, apenas para a empresa
- Benefícios são texto livre (array de strings), exibidos no perfil público da vaga
- Skills da vaga são referências à árvore de skills, cada uma com tipo de exigência:
  - `required` — obrigatória (eliminatória)
  - `expected` — esperada (candidato ideal)
  - `differential` — diferencial (destaque, não eliminatória)
- Uma empresa pode ter múltiplas vagas ativas
- Ordenação: vagas abertas primeiro, mais recentes primeiro
- Vaga fechada não aparece na busca pública
- Empresa pode reabrir vaga fechada (status volta para `open`)

---

#### 6.2.3 Candidaturas (`job-applications`)

Sistema de candidatura de devs a vagas.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Dev (referência ao perfil) | FK → dev_profiles | Sim |
| Vaga (referência à vaga) | FK → jobs | Sim |
| Status | enum: `pending`, `accepted`, `rejected`, `withdrawn` | Sim |

**Regras:**
- Dev só pode se candidatar a vagas com status `open`
- Não permite candidatura duplicada (mesmo dev + mesma vaga)
- Candidatura criada com status `pending`
- Dev pode retirar candidatura (status → `withdrawn`)
- Empresa pode aceitar (`accepted`) ou rejeitar (`rejected`) candidatura
- Dev tem acesso à listagem de suas candidaturas com status atualizado
- Empresa vê lista de candidatos por vaga
- Situação profissional do dev (`employment_status`) é visível para a empresa ao consultar candidatos — serve como alerta informativo

---

#### 6.2.4 Devs Salvos (`saved-developers`)

Shortlist interna da empresa para registros por vaga.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Empresa (referência ao perfil) | FK → company_profiles | Sim |
| Dev (referência ao perfil) | FK → dev_profiles | Sim |
| Vaga (referência à vaga) | FK → jobs | Sim |

**Regras:**
- Empresa salva um dev vinculado a uma vaga específica (registro interno)
- Não é candidatura oficial — apenas marcação para controle da empresa
- Não permite duplicata (mesmo dev + mesma vaga)
- Empresa pode listar e remover devs salvos por vaga
- Dev não é notificado e não sabe que foi salvo

---

### 6.3 Árvore de Skills (`skill-tree`)

Catálogo hierárquico e padronizado de habilidades.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome | string | Sim |
| Slug | string (unique) | Sim |
| Categoria | enum: `language`, `framework`, `database`, `devops`, `tool`, `methodology`, `soft_skill`, `other` | Sim |
| Pai (referência a outra skill) | FK → skill_tree (nullable) | Não |

**Exemplos de hierarquia:**
```
language
├── JavaScript
│   ├── TypeScript
├── Python
├── Java

framework
├── Angular
├── React
├── NestJS
├── Spring Boot

database
├── PostgreSQL
├── MongoDB
├── Redis

devops
├── Docker
├── Kubernetes
├── AWS

soft_skill
├── Comunicação
├── Liderança
├── Trabalho em equipe
```

**Regras:**
- Skills são pré-cadastradas (seed) e gerenciadas por admin
- Devs selecionam skills da árvore (não digitam texto livre)
- Vagas referenciam skills da mesma árvore
- Hierarquia de no máximo 2 níveis (categoria → skill → sub-skill)
- Slug é gerado automaticamente a partir do nome

---

### 6.4 Sistema de Matching (`matching`)

Algoritmo de compatibilidade entre devs e vagas. Score de **0 a 100**.

| Critério | Peso | Descrição |
|---|---|---|
| Skills | 50% | Compatibilidade técnica ponderada por exigência e nível |
| Experiência | 25% | Tempo de experiência vs mínimo da vaga |
| Modalidade + Localização | 10% | Preferência de trabalho e proximidade geográfica |
| Faixa salarial | 15% | Compatibilidade entre pretensão do dev e faixa da vaga |

---

#### 6.4.1 Skills (40%)

Cada skill da vaga gera um sub-score baseado em:
1. **O dev possui a skill?** — se não, sub-score = 0
2. **Qual o nível do dev vs o nível exigido?** — tabela de compatibilidade abaixo

**Tabela de compatibilidade de nível (% do sub-score da skill):**

| Dev \ Vaga exige → | Beginner | Intermediate | Advanced | Expert |
|---|---|---|---|---|
| **Beginner** | 100% | 70% | 50% | 30% |
| **Intermediate** | 120% | 100% | 70% | 50% |
| **Advanced** | 150% | 120% | 100% | 70% |
| **Expert** | 150% | 150% | 120% | 100% |

> Valores acima de 100% indicam que o dev supera o requisito — bonificação.
> O sub-score é **capped em 100** (não ultrapassa 100 por skill).

**Ponderação por tipo de exigência:**
- `required` → peso **3**
- `expected` → peso **2**
- `differential` → peso **1**

**Fórmula:**
```
skill_score = Σ (sub_score_i × peso_i) / Σ (100 × peso_i) × 100
```

**Exemplo:** Vaga pede TypeScript (expert, required), React (advanced, expected), Docker (intermediate, differential).
- Dev tem TypeScript advanced → 70% × peso 3 = 210
- Dev tem React advanced → 100% × peso 2 = 200
- Dev não tem Docker → 0% × peso 1 = 0
- Máximo possível: (100×3) + (100×2) + (100×1) = 600
- Score: (210 + 200 + 0) / 600 × 100 = **68.3**

---

#### 6.4.2 Experiência (20%)

Calculada a partir da **soma total de tempo das experiências profissionais** do dev (tabela `experiences`).

```
total_anos = Σ (end_date - start_date) para cada experience
           (is_current usa a data atual como end_date)

Se total_anos >= min_experience_years da vaga → score = 100
Se total_anos < min_experience_years → score = (total_anos / min_experience_years) × 100
```

**Exemplo:** Vaga pede 5 anos, dev tem 3.5 → score = 70.

---

#### 6.4.3 Modalidade + Localização (10%)

Dividido em duas partes de **50% cada**:

**Parte A — Modalidade (50% do critério):**

O dev possui um array de modalidades preferidas (`work_modes`): ex. `["remote", "hybrid"]`.

- Modalidade da vaga **está** no array do dev → **100%**
- Modalidade da vaga **não está** no array do dev → **0%**
- Dev sem preferência (array vazio ou null) → **100%** (aceita qualquer)

**Parte B — Localização (50% do critério):**

- Vaga é **remote** → **100%** (localização não se aplica)
- Vaga é **onsite/hybrid**:
  - Mesma cidade (city_id) → **100%**
  - Mesmo estado → **50%**
  - Estado diferente → **0%**
  - Dev sem cidade cadastrada → **50%**

**Score final do critério:**
```
score = (modalidade_part × 0.5) + (localização_part × 0.5)
```

---

#### 6.4.4 Faixa Salarial (30%)

Compara a pretensão do dev (`salary_min`/`salary_max`) com a faixa da vaga (`salary_min`/`salary_max`).

**Casos:**

| Situação | Score |
|---|---|
| Dev não informou pretensão | 50% (neutro) |
| Faixas se sobrepõem parcialmente | % de sobreposição |
| Faixa do dev está dentro da faixa da vaga | 100% a 110% (bonus proporcional) |
| Faixa do dev está totalmente fora (acima) | 0% |
| Faixa do dev está totalmente fora (abaixo) | 100% a 110% (bonus: vaga paga mais que o dev pede) |

> **Score máximo: 110%.** Dev que pede menos do que a vaga paga recebe bonificação (cap 110%), pois é um candidato "acessível" para a empresa.

**Fórmula:**
```
overlap_start = MAX(dev_min, job_min)
overlap_end = MIN(dev_max, job_max)

Se overlap_start > overlap_end → sem sobreposição
  Se dev_min > job_max → score = 0 (dev quer mais do que a vaga paga)
  Se dev_max < job_min → score = MIN(110, 100 + bonus)
    bonus = MIN(10, ((job_min - dev_max) / dev_max) × 100)
Senão:
  overlap = overlap_end - overlap_start
  range = MAX(dev_max, job_max) - MIN(dev_min, job_min)
  base_score = (overlap / range) × 100
  Se faixa do dev inteira dentro da faixa da vaga:
    bonus = MIN(10, ((job_max - dev_max) / dev_max) × 50)
    score = MIN(110, base_score + bonus)
  Senão:
    score = base_score
```

---

#### 6.4.5 Score Final

```
score = (skills × 0.50) + (experiencia × 0.25) + (modalidade_localizacao × 0.10) + (salario × 0.15)
```

**Arredondado para inteiro.** Score de 0 a 100.

---

#### 6.4.6 Match Empresa → Dev

Quando uma empresa busca devs para uma vaga, cada dev recebe o **mesmo score** calculado contra aquela vaga.

**Regras gerais:**
- Score com cache em 2 camadas: Redis (hot, TTL 24h) + PostgreSQL (persistente, tabela `match_scores`)
- Recalcula apenas quando hash dos dados do dev ou da vaga muda
- Resultados ordenados por score decrescente
- Score < 20 não aparece nos resultados
- Dev vê o score ao lado de cada vaga
- Empresa vê o score ao lado de cada dev
- Sub-scores individuais (skills, experiência, modalidade, salário) armazenados para transparência

---

### 6.5 Buscas

#### 6.5.1 Busca de Vagas (para devs)

| Filtro | Tipo | Descrição |
|---|---|---|
| Texto | string | Busca no título e descrição |
| Skill | skill_id | Filtra vagas que exigem determinada skill |
| Modalidade | enum | `onsite`, `hybrid`, `remote` |
| Modelo | enum | `clt`, `pj`, `clt_pj` |
| Senioridade | enum | `intern`, `junior`, `mid`, `senior`, `lead`, `specialist` |
| Município | city_id | Filtra vagas por município |
| Ordenação | enum | `match_score`, `recent`, `experience_asc` |

**Regras:**
- Default: ordenar por `match_score` (se dev logado) ou `recent` (se visitante)
- Paginação: 12 por página
- Apenas vagas com status `open`

#### 6.5.2 Busca de Devs (para empresas)

| Filtro | Tipo | Descrição |
|---|---|---|
| Texto | string | Busca no nome do dev |
| Skill | skill_id | Filtra devs que possuem determinada skill |
| Nível mínimo | enum | Nível mínimo na skill filtrada |
| Município | city_id | Filtra devs por município |
| Vaga de referência | job_id | Calcula score contra uma vaga específica |

**Regras:**
- Se `job_id` informado: ordena por score de match
- Paginação: 12 por página

#### 6.5.3 Busca de Devs (pública)

Mantém a busca existente da v1 — qualquer visitante busca devs por nome ou skill.

---

## 7. Fora do Escopo (MVP)

- Autenticação com OAuth (GitHub/Google)
- Chat/mensageria entre dev e empresa
- ~~Candidatura formal a vagas (apply)~~ — agora no escopo
- Notificações (e-mail, push)
- Score automático baseado em GitHub
- Dashboard de analytics
- Upload de arquivos/imagens (usar URLs)
- Painel administrativo para gerenciar skill tree (seed manual)
- Faixa salarial visível para devs
- Ranking/gamificação de devs

---

## 8. Requisitos Não-Funcionais

| Requisito | Especificação |
|---|---|
| Backend | NestJS (Node.js / TypeScript) |
| Frontend | Angular (TypeScript) |
| Banco de dados | PostgreSQL |
| Cache / Sessão | Redis |
| API | RESTful (JSON) |
| Autenticação | JWT (access + refresh token) |
| Identidade visual | Tema náutico (azul escuro, azul médio, tons neutros) |

---

## 9. Entidades e Relacionamentos (visão de produto)

```
User (1) ── (1) DevProfile        ← se role = dev
User (1) ── (1) CompanyProfile    ← se role = company

DevProfile (1) ── (N) DevSkill
DevProfile (1) ── (N) Education
DevProfile (1) ── (N) Experience
DevProfile (1) ── (N) Project

CompanyProfile (1) ── (N) CompanyUnit  ← unidades/filiais
CompanyProfile (1) ── (N) Job
Job (N) ── (N) SkillTree          ← skills exigidas (com nível mínimo)
Job (1) ── (N) JobApplication     ← candidaturas recebidas
Job (1) ── (N) SavedDeveloper     ← devs salvos pela empresa

DevProfile (1) ── (N) JobApplication  ← candidaturas do dev
DevProfile (1) ── (N) SavedDeveloper  ← dev salvo por empresas

DevSkill (N) ── (1) SkillTree     ← skill selecionada da árvore
SkillTree (N) ── (0..1) SkillTree ← hierarquia pai/filho
```

---

## 10. Priorização (MoSCoW)

### Must Have
- Registro/login com dois tipos de usuário (dev e empresa)
- CRUD de Perfil do Dev (com situação profissional)
- CRUD de Skills do Dev (vinculadas à árvore)
- CRUD de Formação
- CRUD de Experiência
- CRUD de Projetos
- CRUD de Perfil da Empresa
- CRUD de Vagas (com reabrir vaga)
- Candidaturas (dev aplica/retira, empresa aceita/rejeita)
- Devs salvos (shortlist interna da empresa por vaga)
- Árvore de skills (seed)
- Visualização pública de perfis (dev e empresa)

### Should Have
- Sistema de matching (score dev↔vaga)
- Busca de vagas com filtros e ordenação por match
- Busca de devs por empresa com score
- Integração GitHub (importar repos)

### Could Have
- Busca pública de devs (por nome/skill)
- Filtros avançados na busca de vagas
- Sub-skills na árvore (2º nível)

### Won't Have (neste MVP)
- OAuth
- Chat/mensageria
- Notificações
- Upload de arquivos
- Painel admin

---

## 11. Roadmap de Entregas (sugestão)

| Fase | Entrega | Módulos |
|---|---|---|
| 1 | Fundação | Auth (JWT) + Perfil Dev + Skills (árvore) |
| 2 | Histórico | Formação + Experiência + Projetos + GitHub |
| 3 | Empresas | Perfil Empresa + Vagas |
| 4 | Matching | Score dev↔vaga + Buscas com match |
| 5 | Descoberta | Buscas públicas + Filtros |
| 6 | Frontend | Angular — Landing + Painel Dev + Painel Empresa |
| 7 | Polish | UI náutica + Refinamentos |

---

## 12. Glossário

| Termo | Significado |
|---|---|
| Porto | A plataforma Dev Port |
| Perfil / Navio | Página do desenvolvedor |
| Atracadouro | Perfil da empresa |
| Jornada / Rotas | Experiências profissionais |
| Cargas / Entregas | Projetos |
| Equipamentos | Skills técnicas |
| Bússola | Sistema de matching |
| Vagas / Âncoras | Oportunidades publicadas por empresas |

> O tema náutico é aplicado na UI. A modelagem de dados usa nomenclatura técnica direta.
