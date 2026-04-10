# User Stories — Dev Port (MVP)

> Versão: 1.0
> Data: 2026-04-09
> Status: Draft
> Referência: [PRD.md](PRD.md)

---

## Convenções

- **Formato:** Como [persona], quero [ação], para [benefício]
- **Prioridade:** 🔴 Must | 🟡 Should | 🟢 Could
- **Critérios de aceite:** condições verificáveis para considerar a story "done"

---

## 1. Perfil (`profile`)

### US-101 — Criar perfil 🔴
**Como** desenvolvedor, **quero** criar meu perfil informando meus dados profissionais, **para** ter uma página pública que represente minha trajetória.

**Critérios de aceite:**
- [ ] Usuário preenche: nome completo, título/cargo, bio, e-mail de contato
- [ ] Campos opcionais: avatar (URL), localização, links externos
- [ ] Bio aceita no máximo 500 caracteres
- [ ] Cada usuário possui apenas 1 perfil
- [ ] Após criação, o perfil fica acessível publicamente

---

### US-102 — Editar perfil 🔴
**Como** desenvolvedor, **quero** editar as informações do meu perfil, **para** manter meus dados atualizados.

**Critérios de aceite:**
- [ ] Todos os campos do perfil são editáveis
- [ ] Validações são aplicadas na edição (mesmas regras da criação)
- [ ] Alterações são salvas e refletidas imediatamente na página pública

---

### US-103 — Visualizar perfil público 🔴
**Como** visitante, **quero** acessar o perfil de um desenvolvedor, **para** conhecer sua trajetória profissional completa.

**Critérios de aceite:**
- [ ] Página exibe todas as seções: dados pessoais, skills, formação, experiência e projetos
- [ ] Perfil acessível sem necessidade de autenticação
- [ ] Seções sem dados preenchidos não são exibidas

---

### US-104 — Gerenciar links externos 🔴
**Como** desenvolvedor, **quero** adicionar links para meu GitHub, LinkedIn e site pessoal, **para** que visitantes possam me encontrar em outras plataformas.

**Critérios de aceite:**
- [ ] Permite adicionar múltiplos links (URL + label)
- [ ] Links são exibidos no perfil público
- [ ] URLs são validadas no formato

---

## 2. Skills (`skills`)

### US-201 — Adicionar skill 🔴
**Como** desenvolvedor, **quero** cadastrar minhas habilidades, **para** que visitantes saibam minhas competências técnicas e comportamentais.

**Critérios de aceite:**
- [ ] Informar: nome da skill, tipo (`hard` ou `soft`)
- [ ] Opcionalmente informar nível: `beginner`, `intermediate`, `advanced`
- [ ] Não permite skill duplicada (mesmo nome) no mesmo perfil
- [ ] Limite de 30 skills por perfil

---

### US-202 — Editar skill 🔴
**Como** desenvolvedor, **quero** editar uma skill cadastrada, **para** corrigir ou atualizar suas informações.

**Critérios de aceite:**
- [ ] Todos os campos da skill são editáveis
- [ ] Validação de duplicidade é mantida na edição
- [ ] Alterações refletidas imediatamente no perfil público

---

### US-203 — Remover skill 🔴
**Como** desenvolvedor, **quero** remover uma skill do meu perfil, **para** manter apenas habilidades relevantes.

**Critérios de aceite:**
- [ ] Skill é removida do perfil após confirmação
- [ ] Remoção refletida imediatamente no perfil público

---

### US-204 — Visualizar skills separadas por tipo 🟢
**Como** visitante, **quero** ver as skills do desenvolvedor separadas entre hard e soft skills, **para** entender rapidamente seu perfil técnico e comportamental.

**Critérios de aceite:**
- [ ] Skills exibidas em dois grupos distintos no perfil público
- [ ] Cada skill mostra o nível (quando informado)

---

## 3. Formação (`education`)

### US-301 — Adicionar formação 🔴
**Como** desenvolvedor, **quero** cadastrar minha formação acadêmica, **para** exibir meu histórico educacional.

**Critérios de aceite:**
- [ ] Informar: instituição, curso/certificação, tipo
- [ ] Tipos aceitos: `technical`, `graduation`, `master`, `doctorate`, `postdoc`, `mba`, `course`, `certification`
- [ ] Campo carga horária é obrigatório quando tipo = `course`
- [ ] Campos opcionais: data início, data conclusão, em andamento
- [ ] Se "em andamento" = true, data conclusão deve ser nula

---

### US-302 — Editar formação 🔴
**Como** desenvolvedor, **quero** editar uma formação cadastrada, **para** corrigir ou atualizar informações.

**Critérios de aceite:**
- [ ] Todos os campos são editáveis
- [ ] Regras de validação mantidas (carga horária obrigatória para curso, etc.)

---

### US-303 — Remover formação 🔴
**Como** desenvolvedor, **quero** remover uma formação do meu perfil, **para** manter meu histórico atualizado.

**Critérios de aceite:**
- [ ] Formação removida após confirmação
- [ ] Remoção refletida no perfil público

---

### US-304 — Exibir formações ordenadas 🔴
**Como** visitante, **quero** ver as formações do desenvolvedor ordenadas da mais recente para a mais antiga, **para** entender sua evolução acadêmica.

**Critérios de aceite:**
- [ ] Ordenação padrão: mais recente primeiro (por data início ou conclusão)
- [ ] Formações "em andamento" aparecem no topo
- [ ] Tipo da formação é exibido com label legível (ex: "Graduação", não "graduation")

---

## 4. Experiência (`experience`)

### US-401 — Adicionar experiência 🔴
**Como** desenvolvedor, **quero** cadastrar minhas experiências profissionais, **para** apresentar meu histórico de trabalho.

**Critérios de aceite:**
- [ ] Informar: empresa, cargo, data início (obrigatórios)
- [ ] Campos opcionais: descrição, data fim, atual
- [ ] Se "atual" = true, data fim deve ser nula

---

### US-402 — Editar experiência 🔴
**Como** desenvolvedor, **quero** editar uma experiência cadastrada, **para** corrigir ou atualizar informações.

**Critérios de aceite:**
- [ ] Todos os campos são editáveis
- [ ] Regras de validação mantidas

---

### US-403 — Remover experiência 🔴
**Como** desenvolvedor, **quero** remover uma experiência do meu perfil, **para** manter meu histórico relevante.

**Critérios de aceite:**
- [ ] Experiência removida após confirmação
- [ ] Remoção refletida no perfil público

---

### US-404 — Exibir experiências ordenadas 🔴
**Como** visitante, **quero** ver as experiências do desenvolvedor ordenadas da mais recente para a mais antiga, **para** entender sua trajetória profissional.

**Critérios de aceite:**
- [ ] Ordenação padrão: mais recente primeiro
- [ ] Experiências com "atual" = true aparecem no topo
- [ ] Período exibido de forma legível (ex: "Jan 2023 — Atual")

---

## 5. Projetos (`projects`)

### US-501 — Adicionar projeto manualmente 🔴
**Como** desenvolvedor, **quero** cadastrar projetos no meu perfil, **para** exibir o que já construí.

**Critérios de aceite:**
- [ ] Informar: nome, descrição (obrigatórios)
- [ ] Campos opcionais: tecnologias, URL do repositório, URL de demonstração, imagem (URL)
- [ ] Projeto criado com `source: manual`

---

### US-502 — Editar projeto 🔴
**Como** desenvolvedor, **quero** editar um projeto cadastrado, **para** atualizar suas informações.

**Critérios de aceite:**
- [ ] Todos os campos são editáveis
- [ ] Projetos importados do GitHub também podem ser editados

---

### US-503 — Remover projeto 🔴
**Como** desenvolvedor, **quero** remover um projeto do meu perfil, **para** manter apenas projetos relevantes.

**Critérios de aceite:**
- [ ] Projeto removido após confirmação
- [ ] Remoção refletida no perfil público

---

## 6. Integração GitHub (`github`)

### US-601 — Conectar conta GitHub 🟡
**Como** desenvolvedor, **quero** informar meu username do GitHub, **para** poder importar meus repositórios.

**Critérios de aceite:**
- [ ] Campo para informar username do GitHub
- [ ] Sistema valida se o username existe via API pública do GitHub
- [ ] Username salvo no perfil

---

### US-602 — Importar repositórios do GitHub 🟡
**Como** desenvolvedor, **quero** importar repositórios do meu GitHub, **para** não precisar cadastrar projetos manualmente.

**Critérios de aceite:**
- [ ] Sistema lista repositórios públicos do username conectado
- [ ] Desenvolvedor seleciona quais repos deseja importar
- [ ] Dados importados: nome, descrição, linguagem principal, stars, URL
- [ ] Repos importados são criados como projetos com `source: github`

---

### US-603 — Sincronizar repositórios importados 🟡
**Como** desenvolvedor, **quero** atualizar os dados dos repositórios já importados, **para** manter as informações sincronizadas com o GitHub.

**Critérios de aceite:**
- [ ] Botão de sincronizar atualiza dados dos repos já importados
- [ ] Novos dados do GitHub sobrescrevem os dados anteriores (exceto edições manuais feitas pelo dev)
- [ ] Repos deletados no GitHub são sinalizados no perfil

---

## 7. Busca (`search`)

### US-701 — Buscar desenvolvedor por nome 🟡
**Como** visitante, **quero** buscar desenvolvedores por nome, **para** encontrar um perfil específico.

**Critérios de aceite:**
- [ ] Campo de busca textual
- [ ] Busca case-insensitive
- [ ] Resultados exibidos em cards com: nome, título, avatar e skills principais
- [ ] Resultados paginados (12 por página)

---

### US-702 — Buscar desenvolvedor por skill 🟡
**Como** visitante, **quero** filtrar desenvolvedores por skill, **para** encontrar profissionais com competências específicas.

**Critérios de aceite:**
- [ ] Filtro por nome da skill
- [ ] Busca case-insensitive
- [ ] Resultados combinam com busca por nome (quando ambos informados)
- [ ] Mesma paginação da busca por nome

---

### US-703 — Listar todos os desenvolvedores 🟡
**Como** visitante, **quero** ver uma listagem de todos os desenvolvedores cadastrados, **para** descobrir novos perfis.

**Critérios de aceite:**
- [ ] Página de listagem com cards dos perfis
- [ ] Paginação de 12 por página
- [ ] Ordenação padrão: mais recente primeiro

---

## Resumo

| Módulo | Stories | Must 🔴 | Should 🟡 | Could 🟢 |
|---|---|---|---|---|
| Perfil | 4 | 4 | 0 | 0 |
| Skills | 4 | 3 | 0 | 1 |
| Formação | 4 | 4 | 0 | 0 |
| Experiência | 4 | 4 | 0 | 0 |
| Projetos | 3 | 3 | 0 | 0 |
| GitHub | 3 | 0 | 3 | 0 |
| Busca | 3 | 0 | 3 | 0 |
| **Total** | **25** | **18** | **6** | **1** |
