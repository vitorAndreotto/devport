# User Stories — Dev Port

> Versão: 2.0
> Data: 2026-04-11
> Status: Draft
> Referência: [PRD.md](PRD.md)

---

## Convenções

- **Formato:** Como [persona], quero [ação], para [benefício]
- **Prioridade:** 🔴 Must | 🟡 Should | 🟢 Could
- **Critérios de aceite:** condições verificáveis para considerar a story "done"

---

## 1. Autenticação (`auth`)

### US-001 — Registro de dev 🔴
**Como** desenvolvedor, **quero** me registrar na plataforma, **para** criar meu perfil profissional.

**Critérios de aceite:**
- [ ] Informar: nome, e-mail, senha, confirmação de senha
- [ ] Tipo de conta definido como `dev`
- [ ] E-mail deve ser único
- [ ] Senha mínima de 8 caracteres
- [ ] Retorna access token (JWT) e refresh token

---

### US-002 — Registro de empresa 🔴
**Como** representante de empresa, **quero** me registrar na plataforma, **para** publicar vagas e buscar candidatos.

**Critérios de aceite:**
- [ ] Informar: nome, e-mail, senha, confirmação de senha
- [ ] Tipo de conta definido como `company`
- [ ] E-mail deve ser único
- [ ] Retorna access token (JWT) e refresh token

---

### US-003 — Login 🔴
**Como** usuário, **quero** fazer login com e-mail e senha, **para** acessar minha conta.

**Critérios de aceite:**
- [ ] Informar: e-mail, senha
- [ ] Retorna access token + refresh token
- [ ] Credenciais inválidas retornam erro 401

---

### US-004 — Refresh token 🔴
**Como** usuário, **quero** renovar meu token de acesso, **para** manter minha sessão ativa sem refazer login.

**Critérios de aceite:**
- [ ] Enviar refresh token válido
- [ ] Retorna novo access token + novo refresh token
- [ ] Refresh token antigo é invalidado (rotação)
- [ ] Refresh token expirado retorna erro 401

---

### US-005 — Logout 🔴
**Como** usuário, **quero** encerrar minha sessão, **para** proteger minha conta.

**Critérios de aceite:**
- [ ] Refresh token é invalidado
- [ ] Access token não pode mais ser renovado

---

## 2. Perfil do Dev (`dev-profile`)

### US-100 — Criar perfil 🔴
**Como** dev, **quero** criar meu perfil profissional, **para** ter uma página pública que represente minha trajetória.

**Critérios de aceite:**
- [ ] Preencher: nome completo, título/cargo, bio, e-mail de contato
- [ ] Campos opcionais: avatar (URL), localização, modelo preferido, links externos
- [ ] Bio aceita no máximo 500 caracteres
- [ ] Cada dev possui apenas 1 perfil
- [ ] Retorna 409 se perfil já existir

---

### US-101 — Editar perfil 🔴
**Como** dev, **quero** editar meu perfil, **para** manter meus dados atualizados.

**Critérios de aceite:**
- [ ] Todos os campos do perfil são editáveis
- [ ] Validações mantidas na edição
- [ ] Alterações refletidas imediatamente na página pública

---

### US-102 — Visualizar perfil público 🔴
**Como** visitante, **quero** acessar o perfil de um dev, **para** conhecer sua trajetória completa.

**Critérios de aceite:**
- [ ] Exibe: dados pessoais, skills, formação, experiência e projetos
- [ ] Acessível sem autenticação
- [ ] Seções sem dados não são exibidas

---

### US-103 — Gerenciar links externos 🔴
**Como** dev, **quero** adicionar links para GitHub, LinkedIn e site, **para** ser encontrado em outras plataformas.

**Critérios de aceite:**
- [ ] Permite múltiplos links (URL + label)
- [ ] URLs validadas no formato
- [ ] Links exibidos no perfil público

---

## 3. Skills do Dev (`dev-skills`)

### US-200 — Adicionar skill 🔴
**Como** dev, **quero** cadastrar minhas habilidades selecionando da árvore de skills, **para** que visitantes e empresas saibam minhas competências.

**Critérios de aceite:**
- [ ] Selecionar skill da árvore de skills (não texto livre)
- [ ] Informar nível: `beginner`, `intermediate`, `advanced`, `expert` (obrigatório)
- [ ] Opcionalmente informar anos de experiência
- [ ] Não permite skill duplicada no mesmo perfil
- [ ] Limite de 50 skills por perfil

---

### US-201 — Editar skill 🔴
**Como** dev, **quero** editar uma skill, **para** atualizar meu nível ou experiência.

**Critérios de aceite:**
- [ ] Nível e anos de experiência são editáveis
- [ ] Pode trocar a skill (referência à árvore)
- [ ] Validação de duplicidade mantida

---

### US-202 — Remover skill 🔴
**Como** dev, **quero** remover uma skill do meu perfil, **para** manter apenas habilidades relevantes.

**Critérios de aceite:**
- [ ] Skill removida após confirmação
- [ ] Remoção refletida no perfil público

---

### US-203 — Visualizar skills agrupadas 🟢
**Como** visitante, **quero** ver as skills do dev agrupadas por categoria, **para** entender seu perfil técnico rapidamente.

**Critérios de aceite:**
- [ ] Skills agrupadas por categoria da árvore (language, framework, etc.)
- [ ] Cada skill mostra nível e anos de experiência (quando informado)

---

## 4. Formação (`education`)

### US-300 — Adicionar formação 🔴
**Como** dev, **quero** cadastrar minha formação acadêmica, **para** exibir meu histórico educacional.

**Critérios de aceite:**
- [ ] Informar: instituição, curso/certificação, tipo
- [ ] Tipos: `technical`, `graduation`, `master`, `doctorate`, `postdoc`, `mba`, `course`, `certification`
- [ ] Carga horária obrigatória quando tipo = `course`
- [ ] Campos opcionais: data início, data conclusão, em andamento
- [ ] Se "em andamento" = true, data conclusão deve ser nula

---

### US-301 — Editar formação 🔴
**Como** dev, **quero** editar uma formação, **para** corrigir ou atualizar informações.

**Critérios de aceite:**
- [ ] Todos os campos editáveis
- [ ] Regras de validação mantidas

---

### US-302 — Remover formação 🔴
**Como** dev, **quero** remover uma formação, **para** manter meu histórico atualizado.

**Critérios de aceite:**
- [ ] Formação removida após confirmação
- [ ] Remoção refletida no perfil público

---

### US-303 — Exibir formações ordenadas 🔴
**Como** visitante, **quero** ver formações ordenadas da mais recente para a mais antiga.

**Critérios de aceite:**
- [ ] Formações "em andamento" aparecem no topo
- [ ] Ordenação por data início descendente
- [ ] Tipo exibido com label legível (ex: "Graduação")

---

## 5. Experiência (`experience`)

### US-400 — Adicionar experiência 🔴
**Como** dev, **quero** cadastrar minhas experiências profissionais, **para** apresentar meu histórico de trabalho.

**Critérios de aceite:**
- [ ] Informar: empresa, cargo, data início (obrigatórios)
- [ ] Campos opcionais: descrição, data fim, atual
- [ ] Se "atual" = true, data fim deve ser nula

---

### US-401 — Editar experiência 🔴
**Como** dev, **quero** editar uma experiência, **para** corrigir ou atualizar informações.

**Critérios de aceite:**
- [ ] Todos os campos editáveis
- [ ] Regras de validação mantidas

---

### US-402 — Remover experiência 🔴
**Como** dev, **quero** remover uma experiência, **para** manter meu histórico relevante.

**Critérios de aceite:**
- [ ] Experiência removida após confirmação
- [ ] Remoção refletida no perfil público

---

### US-403 — Exibir experiências ordenadas 🔴
**Como** visitante, **quero** ver experiências ordenadas da mais recente para a mais antiga.

**Critérios de aceite:**
- [ ] Experiências com "atual" = true aparecem no topo
- [ ] Ordenação por data início descendente
- [ ] Período exibido de forma legível (ex: "Jan 2023 — Atual")

---

## 6. Projetos (`projects`)

### US-500 — Adicionar projeto 🔴
**Como** dev, **quero** cadastrar projetos no meu perfil, **para** exibir o que já construí.

**Critérios de aceite:**
- [ ] Informar: nome, descrição (obrigatórios)
- [ ] Campos opcionais: tecnologias, URL repositório, URL demo, imagem (URL)
- [ ] Projeto criado com `source: manual`

---

### US-501 — Editar projeto 🔴
**Como** dev, **quero** editar um projeto, **para** atualizar suas informações.

**Critérios de aceite:**
- [ ] Todos os campos editáveis
- [ ] Projetos importados do GitHub também editáveis

---

### US-502 — Remover projeto 🔴
**Como** dev, **quero** remover um projeto, **para** manter apenas projetos relevantes.

**Critérios de aceite:**
- [ ] Projeto removido após confirmação
- [ ] Remoção refletida no perfil público

---

## 7. Integração GitHub (`github`)

### US-600 — Conectar conta GitHub 🟡
**Como** dev, **quero** informar meu username do GitHub, **para** importar meus repositórios.

**Critérios de aceite:**
- [ ] Campo para informar username
- [ ] Sistema valida se username existe via API pública
- [ ] Username salvo no perfil

---

### US-601 — Importar repositórios 🟡
**Como** dev, **quero** importar repos do meu GitHub, **para** não cadastrar projetos manualmente.

**Critérios de aceite:**
- [ ] Sistema lista repos públicos do username
- [ ] Dev seleciona quais importar
- [ ] Dados importados: nome, descrição, linguagem, stars, URL
- [ ] Repos criados com `source: github`

---

### US-602 — Sincronizar repositórios 🟡
**Como** dev, **quero** atualizar dados dos repos importados, **para** manter sincronizado com o GitHub.

**Critérios de aceite:**
- [ ] Atualiza dados de todos os repos com `source: github`
- [ ] Repos deletados no GitHub são sinalizados

---

## 8. Perfil da Empresa (`company-profile`)

### US-700 — Criar perfil da empresa 🔴
**Como** empresa, **quero** criar meu perfil corporativo, **para** apresentar minha organização e publicar vagas.

**Critérios de aceite:**
- [ ] Preencher: nome da empresa, CNPJ, descrição, setor de atuação, tamanho, localização
- [ ] Campos opcionais: logo (URL), site, links
- [ ] CNPJ deve ser único
- [ ] Descrição limitada a 1000 caracteres
- [ ] Cada empresa possui apenas 1 perfil
- [ ] Retorna 409 se perfil já existir

---

### US-701 — Editar perfil da empresa 🔴
**Como** empresa, **quero** editar meu perfil, **para** manter dados atualizados.

**Critérios de aceite:**
- [ ] Todos os campos editáveis
- [ ] Validações mantidas (CNPJ único, etc.)

---

### US-702 — Visualizar perfil público da empresa 🔴
**Como** visitante, **quero** ver o perfil de uma empresa, **para** conhecer a organização e suas vagas ativas.

**Critérios de aceite:**
- [ ] Exibe: dados da empresa + lista de vagas abertas
- [ ] Acessível sem autenticação
- [ ] Faixa salarial **não** é exibida

---

## 9. Vagas (`jobs`)

### US-800 — Publicar vaga 🔴
**Como** empresa, **quero** publicar uma vaga, **para** encontrar candidatos qualificados.

**Critérios de aceite:**
- [ ] Informar: título, descrição, skills necessárias (com nível mínimo), experiência mínima, modelo de contratação, faixa salarial, modalidade
- [ ] Localização obrigatória quando modalidade = `onsite` ou `hybrid`
- [ ] Skills selecionadas da árvore de skills
- [ ] Vaga criada com status `open`
- [ ] Faixa salarial salva mas não exibida publicamente

---

### US-801 — Editar vaga 🔴
**Como** empresa, **quero** editar uma vaga publicada, **para** atualizar requisitos ou informações.

**Critérios de aceite:**
- [ ] Todos os campos editáveis
- [ ] Validações mantidas
- [ ] Alterações refletidas imediatamente

---

### US-802 — Fechar vaga 🔴
**Como** empresa, **quero** fechar uma vaga, **para** indicar que a posição foi preenchida.

**Critérios de aceite:**
- [ ] Status alterado para `closed`
- [ ] Vaga não aparece mais na busca pública
- [ ] Vaga continua visível no painel da empresa

---

### US-803 — Listar minhas vagas 🔴
**Como** empresa, **quero** ver todas as minhas vagas, **para** gerenciá-las.

**Critérios de aceite:**
- [ ] Lista todas as vagas da empresa (abertas e fechadas)
- [ ] Ordenação: abertas primeiro, mais recentes primeiro
- [ ] Exibe faixa salarial (visível apenas para a empresa dona)

---

### US-804 — Visualizar vaga pública 🔴
**Como** visitante, **quero** ver os detalhes de uma vaga, **para** entender os requisitos.

**Critérios de aceite:**
- [ ] Exibe: título, descrição, skills, experiência, modelo, modalidade, localização
- [ ] Exibe nome e dados da empresa
- [ ] Faixa salarial **não** é exibida
- [ ] Se dev logado, exibe score de match

---

## 10. Árvore de Skills (`skill-tree`)

### US-900 — Seed da árvore de skills 🔴
**Como** sistema, **quero** ter uma árvore de skills pré-cadastrada, **para** padronizar as habilidades na plataforma.

**Critérios de aceite:**
- [ ] Skills organizadas em categorias: `language`, `framework`, `database`, `devops`, `tool`, `methodology`, `soft_skill`, `other`
- [ ] Cada skill tem nome, slug (unique) e categoria
- [ ] Skills podem ter pai (hierarquia de até 2 níveis)
- [ ] Seed popula no mínimo 50 skills

---

### US-901 — Listar skills da árvore 🔴
**Como** usuário, **quero** buscar e navegar na árvore de skills, **para** selecionar habilidades relevantes.

**Critérios de aceite:**
- [ ] Endpoint público (sem auth)
- [ ] Filtrável por categoria
- [ ] Filtrável por texto (busca no nome)
- [ ] Retorna hierarquia (pai e filhos)

---

## 11. Matching (`matching`)

### US-1000 — Match dev → vagas 🟡
**Como** dev, **quero** ver vagas ordenadas por compatibilidade com meu perfil, **para** encontrar as melhores oportunidades.

**Critérios de aceite:**
- [ ] Score de 0 a 100 calculado para cada vaga aberta
- [ ] Critérios: skills em comum (60%), experiência (20%), modalidade (10%), localização (10%)
- [ ] Vagas com score < 20 não aparecem
- [ ] Ordenação padrão por score decrescente
- [ ] Score visível ao lado de cada vaga

---

### US-1001 — Match empresa → devs 🟡
**Como** empresa, **quero** ver devs ordenados por compatibilidade com uma vaga específica, **para** encontrar os melhores candidatos.

**Critérios de aceite:**
- [ ] Selecionar vaga de referência
- [ ] Score de 0 a 100 calculado para cada dev
- [ ] Mesmos critérios do match dev → vagas
- [ ] Devs com score < 20 não aparecem
- [ ] Ordenação por score decrescente

---

## 12. Buscas (`search`)

### US-1100 — Buscar vagas 🟡
**Como** dev, **quero** buscar vagas com filtros, **para** encontrar oportunidades relevantes.

**Critérios de aceite:**
- [ ] Filtros: texto, skill, modalidade, modelo, localização
- [ ] Apenas vagas com status `open`
- [ ] Paginação: 12 por página
- [ ] Se dev logado: ordenação padrão por match score
- [ ] Se visitante: ordenação por data de criação

---

### US-1101 — Buscar devs (empresa) 🟡
**Como** empresa, **quero** buscar devs com filtros, **para** encontrar candidatos.

**Critérios de aceite:**
- [ ] Filtros: texto, skill, nível mínimo, localização, vaga de referência
- [ ] Paginação: 12 por página
- [ ] Se vaga informada: ordenação por match score

---

### US-1102 — Buscar devs (público) 🟢
**Como** visitante, **quero** buscar devs por nome ou skill, **para** descobrir perfis.

**Critérios de aceite:**
- [ ] Busca por nome (case-insensitive)
- [ ] Filtro por skill
- [ ] Paginação: 12 por página
- [ ] Resultados em cards com: nome, título, avatar, skills principais

---

## Resumo

| Módulo | Stories | 🔴 Must | 🟡 Should | 🟢 Could |
|---|---|---|---|---|
| Auth | 5 | 5 | 0 | 0 |
| Perfil Dev | 4 | 4 | 0 | 0 |
| Skills Dev | 4 | 3 | 0 | 1 |
| Formação | 4 | 4 | 0 | 0 |
| Experiência | 4 | 4 | 0 | 0 |
| Projetos | 3 | 3 | 0 | 0 |
| GitHub | 3 | 0 | 3 | 0 |
| Perfil Empresa | 3 | 3 | 0 | 0 |
| Vagas | 5 | 5 | 0 | 0 |
| Skill Tree | 2 | 2 | 0 | 0 |
| Matching | 2 | 0 | 2 | 0 |
| Buscas | 3 | 0 | 2 | 1 |
| **Total** | **42** | **33** | **7** | **2** |
