
<h1 align="center"> 
	CTracker Backend
</h1>

[![Insomnia Badge](https://img.shields.io/badge/Try_On_Insomnia-5849be?style=for-the-badge&logo=Insomnia&logoColor=white)](./.github/Insomnia.json)

## ⚙️ Requisitos

### 🔨 Requisitos Funcionais

- [x] O usuário deve poder se cadastrar
- [x] O usuário deve poder se autenticar
- [x] O usuário deve poder visualizar a lista de campeonatos
- [x] O usuário deve poder visualizar o campeonato
- [x] O usuário deve poder visualizar o seu perfil
- [x] O usuário deve poder visualizar as equipes do campeonato
- [ ] O usuário deve poder visualizar as partidas que ocorreram do campeonato
- [ ] O usuário deve poder visualizar o histórico de pontos das equipes
- [ ] O usuário deve conseguir realizar um palpite
- [ ] O usuário deve conseguir visualizar seus palpites
- [ ] O usuário deve conseguir visualizar a pontuação dos seus palpites

- [x] O organizador deve poder criar um campeonato
- [x] O organizador deve poder criar uma equipe
- [ ] O organizador deve poder criar um jogador
- [ ] O organizador deve poder adicionar jogadores nas suas equipes
- [x] O organizador deve poder adicionar equipes no campeonato
- [x] O organizador deve poder criar partidas
- [ ] O organizador deve poder alterar o resultado das partidas

### 📋 Regras de Negócio

- [ ] O organizador só pode inscrever jogadores em equipes com vagas disponíveis
- [ ] O organizador só pode inscrever equipes no campeonatos com vagas disponíveis

---

## 🚀 Como executar o projeto

Antes de começar, você vai precisar ter instalado em sua máquina as seguintes ferramentas:
[Git](https://git-scm.com), [Node.js](https://nodejs.org/en/). 
Além disto é bom ter um editor para trabalhar com o código como [VSCode](https://code.visualstudio.com/)

```bash

# Clone este repositório
$ git clone https://github.com/ChampionTrackers/CTracker-server.git

# Acesse a pasta do projeto no terminal
$ cd CTracker-server

# Instale as dependências
$ npm install

# Execute a aplicação em modo de desenvolvimento
$ npm run dev

# O servidor inciará na porta:3333 - acesse http://localhost:3333 

```

Subindo o banco de dados utilizando docker

```bash
docker run -d \
  --name my-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ctracker \
  -p 5432:5432 \
  postgres:alpine
```

URL de conexão com o banco de dados

```bash
DATABASE_URL="postgresql://postgres:dev@localhost:5432/ctracker?schema=public"
```

<!-- ## 🛠 Tecnologias

As seguintes ferramentas foram usadas na construção do projeto: -->

