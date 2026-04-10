# PRD — Dev Port (MVP)

> Product Requirements Document
> Versão: 1.0
> Data: 2026-04-09
> Status: Draft

---

## 1. Visão do Produto

O **Dev Port** é uma plataforma onde desenvolvedores criam perfis profissionais completos, reunindo experiência, skills, formação e projetos em um só lugar — com integração ao GitHub.

**Metáfora central:** um porto digital onde cada dev "ancora" seu perfil e compartilha sua jornada.

---

## 2. Problema

Desenvolvedores não têm um espaço unificado e focado para apresentar sua trajetória profissional de forma estruturada. LinkedIn é genérico, GitHub mostra só código, e portfólios pessoais exigem manutenção constante.

---

## 3. Público-alvo

- Desenvolvedores de software (júnior a sênior)
- Estudantes de tecnologia montando seu primeiro portfólio
- Recrutadores que buscam perfis técnicos

---

## 4. Objetivos do MVP

| Objetivo | Métrica de sucesso |
|---|---|
| Dev consegue criar e publicar seu perfil completo | Perfil com todas as seções preenchidas |
| Dev importa projetos do GitHub | Repositórios listados automaticamente no perfil |
| Visitante encontra devs por nome ou skill | Busca retorna resultados relevantes |

---

## 5. Escopo do MVP

### 5.1 Módulos

#### 5.1.1 Perfil (`profile`)
Dados centrais do desenvolvedor.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome completo | string | Sim |
| Título/Cargo atual | string | Sim |
| Bio / Resumo profissional | text | Sim |
| Avatar (URL) | string | Não |
| E-mail de contato | string | Sim |
| Localização | string | Não |
| Links externos (GitHub, LinkedIn, site) | json/array | Não |

**Regras:**
- Cada usuário possui exatamente 1 perfil
- O perfil é público por padrão
- Bio limitada a 500 caracteres

---

#### 5.1.2 Skills (`skills`)
Habilidades técnicas e comportamentais.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome | string | Sim |
| Tipo | enum: `hard`, `soft` | Sim |
| Nível | enum: `beginner`, `intermediate`, `advanced` | Não |

**Regras:**
- Uma skill pertence a um perfil (N:1)
- Não permitir skills duplicadas no mesmo perfil
- Limite sugerido: 30 skills por perfil

---

#### 5.1.3 Formação (`education`)
Histórico acadêmico e certificações.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Instituição | string | Sim |
| Curso / Certificação | string | Sim |
| Tipo | enum (ver tabela abaixo) | Sim |
| Carga horária (horas) | integer | Condicional* |
| Data início | date | Não |
| Data conclusão | date | Não |
| Em andamento | boolean | Não |

**Tipos de formação:**

| Valor | Label |
|---|---|
| `technical` | Técnico |
| `graduation` | Graduação |
| `master` | Mestrado |
| `doctorate` | Doutorado |
| `postdoc` | Pós-Doutorado |
| `mba` | MBA |
| `course` | Curso |
| `certification` | Certificação |

**Regras:**
- Ordenação padrão: mais recente primeiro
- Se "em andamento" = true, data conclusão deve ser nula
- *Carga horária é obrigatória apenas quando tipo = `course`
- Para os demais tipos, carga horária é opcional

---

#### 5.1.4 Experiência (`experience`)
Histórico profissional.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Empresa | string | Sim |
| Cargo | string | Sim |
| Descrição | text | Não |
| Data início | date | Sim |
| Data fim | date | Não |
| Atual | boolean | Não |

**Regras:**
- Ordenação padrão: mais recente primeiro
- Se "atual" = true, data fim deve ser nula

---

#### 5.1.5 Projetos (`projects`)
Projetos cadastrados manualmente.

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome | string | Sim |
| Descrição | text | Sim |
| Tecnologias | json/array | Não |
| URL do repositório | string | Não |
| URL de demonstração | string | Não |
| Imagem (URL) | string | Não |

**Regras:**
- Um projeto pertence a um perfil (N:1)
- Projetos importados do GitHub são marcados com flag `source: github`

---

#### 5.1.6 Integração GitHub (`github`)
Conexão básica com a API do GitHub.

| Funcionalidade | Descrição |
|---|---|
| Conectar conta | Usuário informa username do GitHub |
| Importar repositórios | Lista repos públicos e permite selecionar quais importar |
| Sincronizar | Atualiza dados dos repos já importados |

**Regras:**
- Utilizar a API pública do GitHub (sem OAuth no MVP)
- Importar: nome, descrição, linguagem, stars, URL
- Repos importados viram registros no módulo Projetos

---

#### 5.1.7 Busca (`search`)
Descoberta de desenvolvedores.

| Funcionalidade | Descrição |
|---|---|
| Busca por nome | Pesquisa textual no nome do dev |
| Busca por skill | Filtra devs que possuem determinada skill |
| Listagem | Página com cards dos perfis encontrados |

**Regras:**
- Busca case-insensitive
- Resultados paginados (12 por página)

---

### 5.2 Fora do escopo (MVP)

- Autenticação com OAuth (GitHub/Google)
- Score/ranking de desenvolvedores
- Dashboard de atividades
- Sistema de recomendações
- Match com vagas
- Upload de arquivos/imagens (usar URLs)

---

## 6. Requisitos Não-Funcionais

| Requisito | Especificação |
|---|---|
| Stack | Laravel (PHP) |
| Banco de dados | PostgreSQL |
| Arquitetura | MVC com camada de Services |
| API | RESTful (JSON) |
| Identidade visual | Tema náutico (azul escuro, azul médio, tons neutros) |

---

## 7. Entidades e Relacionamentos (visão de produto)

```
User (1) ── (1) Profile
Profile (1) ── (N) Skill
Profile (1) ── (N) Education
Profile (1) ── (N) Experience
Profile (1) ── (N) Project
```

---

## 8. Priorização (MoSCoW)

### Must Have
- CRUD de Perfil
- CRUD de Skills
- CRUD de Formação
- CRUD de Experiência
- CRUD de Projetos
- Visualização pública do perfil

### Should Have
- Integração GitHub (importar repos)
- Busca por nome e skill

### Could Have
- Níveis de skill
- Filtros avançados na busca

### Won't Have (neste MVP)
- OAuth
- Score automático
- Upload de arquivos

---

## 9. Roadmap de Entregas (sugestão)

| Fase | Entrega | Módulos |
|---|---|---|
| 1 | Fundação | Perfil + Skills |
| 2 | Histórico | Formação + Experiência |
| 3 | Projetos | Projetos + GitHub |
| 4 | Descoberta | Busca + Listagem |
| 5 | Polish | UI náutica + Refinamentos |

---

## 10. Glossário

| Termo | Significado |
|---|---|
| Porto | A plataforma Dev Port |
| Perfil / Navio | Página do desenvolvedor |
| Jornada / Rotas | Experiências profissionais |
| Cargas / Entregas | Projetos |
| Equipamentos | Skills técnicas |

> O tema náutico é aplicado na UI. A modelagem de dados usa nomenclatura técnica direta.
