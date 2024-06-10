import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import ScalarApiReference from '@scalar/fastify-api-reference'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { env } from './env/index'
import { errorHandler } from './helpers/error-handler'
import { createChampionship } from './http/controllers/championships/create-championship'
import { getChampionship } from './http/controllers/championships/get-championship'
import { getChampionshipsList } from './http/controllers/championships/get-championships-list'
import { createMatch } from './http/controllers/championships/matches/create-match'
import { getChampionshipMatches } from './http/controllers/championships/matches/get-championship-matches'
import { addTeamToChampionship } from './http/controllers/championships/teams/add-team-to-championship'
import { getChampionshipTeams } from './http/controllers/championships/teams/get-championship-teams'
import { createGuess } from './http/controllers/guess/create-guess'
import { createTeam } from './http/controllers/teams/create-team'
import { authenticateWithEmail } from './http/controllers/users/authenticate-with-email'
import { changePassword } from './http/controllers/users/change-password'
import { createUser } from './http/controllers/users/create-user'
import { editUser } from './http/controllers/users/edit-user'
import { getProfile } from './http/controllers/users/get-profile'
import { getUser } from './http/controllers/users/get-user'
import { getGuesses } from './http/controllers/guess/get-guesses'

const app = fastify()

app.register(fastifyCors, {
  origin: '*',
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Champions Tracker',
      description:
        'Esta é a documentação da API do Champions Tracker, que fornece funcionalidades para criação de campeonatos, equipes, jogadores e o gerenciamento como um todo. Aqui você encontrará detalhes sobre os endpoints disponíveis, parâmetros aceitos e os formatos de resposta esperados.\n\nUtilize este documento para entender como integrar e interagir com nossa API de maneira eficaz.\n\n### Funcionalidades Principais\n- **Controle de Campeonatos**:  O organizador poderá criar editar e controlar os campeonatos\n- **Controle de Equipes**: Os usuários poderão criar suas próprias equipes para que possam participar dos campeonatos\n- **Visualização de Campeonatos**: Os usuários poderão visualizar os campeonatos, suas informações e as equipes cadastradas',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        JWT: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description:
            'Para acessar as rotas protegidas, você deve enviar o token JWT no cabeçalho da requisição. O token deve ser precedido pela palavra "Bearer".\n**Exemplo:** Bearer TOKEN_JWT_AQUI',
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description:
          'Endpoints relacionados à autenticação e gerenciamento de usuários. Inclui operações como login, registro, recuperação de senha (WIP) e verificação de identidade.',
      },
      {
        name: 'Team',
        description:
          'Endpoints relacionados à gestão de equipes. Inclui operações para criação, atualização, exclusão e listagem de equipes, bem como a gestão de jogadores da equipe.',
      },
      {
        name: 'Championship',
        description:
          'Endpoints relacionados à organização e gerenciamento de campeonatos. Inclui operações para criação, atualização, exclusão e listagem de campeonatos, bem como a gestão de participantes e resultados.',
      },
      {
        name: 'Guess',
        description:
          'Endpoints relacionados à criação e gerenciamento de palpites. Inclui operações para criação, atualização e listagem de palpites.',
      },
    ],
  },
  transform: jsonSchemaTransform,
})

app.register(ScalarApiReference, {
  routePrefix: '/docs',
  configuration: {
    theme: 'bluePlanet',
  },
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createUser, { prefix: '/v1' })
app.register(editUser, { prefix: '/v1' })
app.register(changePassword, { prefix: '/v1' })
app.register(authenticateWithEmail, { prefix: '/v1' })
app.register(getProfile, { prefix: '/v1' })
app.register(getUser, { prefix: '/v1' })

app.register(createTeam, { prefix: '/v1' })

app.register(createChampionship, { prefix: '/v1' })
app.register(getChampionship, { prefix: '/v1' })
app.register(getChampionshipsList, { prefix: '/v1' })
app.register(addTeamToChampionship, { prefix: '/v1' })
app.register(getChampionshipTeams, { prefix: '/v1' })
app.register(getChampionshipMatches, { prefix: '/v1' })
app.register(createMatch, { prefix: '/v1' })

app.register(createGuess, { prefix: '/v1' })
app.register(getGuesses, { prefix: '/v1' })

app.setErrorHandler(errorHandler)

export { app }
