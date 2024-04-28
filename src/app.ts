import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
} from 'fastify-type-provider-zod'
import { errorHandler } from './helpers/error-handler'
import { createChampionship } from './routes/championships/create-championship'
import { getChampionship } from './routes/championships/get-championship'
import { getChampionshipTeams } from './routes/championships/get-championship-teams'
import { getChampionshipsList } from './routes/championships/get-championships-list'
import { createTeam } from './routes/teams/create-team'
import { authenticateWithEmail } from './routes/users/authenticate-with-email'
import { createUser } from './routes/users/create-user'
import { getProfile } from './routes/users/get-profile'
import { addTeamToChampionship } from './routes/championships/add-team-to-championship'
import { env } from './env'
import { editUser } from './routes/users/edit-user'

const app = fastify()

app.register(fastifySwagger, {
    swagger: {
        consumes: ['application/json'],
        produces: ['application/json'],
        info: {
            title: 'Champions Tracker',
            description:
                'Esta é a documentação da API do Champions Tracker, que fornece funcionalidades para criação de campeonatos, equipes, jogadores e o gerenciamento como um todo. Aqui você encontrará detalhes sobre os endpoints disponíveis, parâmetros aceitos e os formatos de resposta esperados.\n\nUtilize este documento para entender como integrar e interagir com nossa API de maneira eficaz.\n\n### Funcionalidades Principais\n- **Controle de Campeonatos**:  O organizador poderá criar editar e controlar os campeonatos\n- **Controle de Equipes**: Os usuários poderão criar suas próprias equipes para que possam participar dos campeonatos\n- **Visualização de Campeonatos**: Os usuários poderão visualizar os campeonatos, suas informações e as equipes cadastradas',
            version: '1.0.0',
        },
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header',
                description: 'Para acessar as rotas protegidas, você deve enviar o token JWT no cabeçalho da requisição. O token deve ser precedido pela palavra "Bearer".\n**Exemplo:** Bearer TOKEN_JWT_AQUI'
            },
        },
    },
    transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
})

app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createUser, { prefix: '/v1' })
// app.register(getUser, { prefix: '/v1' })
app.register(editUser, { prefix: '/v1' })
app.register(authenticateWithEmail, { prefix: '/v1' })
app.register(getProfile, { prefix: '/v1' })

app.register(createTeam, { prefix: '/v1' })

app.register(createChampionship, { prefix: '/v1' })
app.register(addTeamToChampionship, { prefix: '/v1' })
app.register(getChampionship, { prefix: '/v1' })
app.register(getChampionshipsList, { prefix: '/v1' })
app.register(getChampionshipTeams, { prefix: '/v1' })

app.setErrorHandler(errorHandler)

export { app }
