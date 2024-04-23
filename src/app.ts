import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
} from 'fastify-type-provider-zod'
import { errorHandler } from './helpers/error-handler'
import { createChampionship } from './routes/championships/create-championship'
import { createUser } from './routes/users/create-user'
import { getChampionship } from './routes/championships/get-championship'
import { getChampionshipsList } from './routes/championships/get-championships-list'
import { createTeam } from './routes/teams/create-team'
import { getUser } from './routes/users/get-user'
import { getChampionshipTeams } from './routes/championships/get-championship-teams'
import { authenticateWithEmail } from './routes/users/authenticate-with-email'
import { getProfile } from './routes/users/get-profile'
import fjwt, { FastifyJWT } from '@fastify/jwt'
import fCookie from '@fastify/cookie'
import { logout } from './routes/users/logout'

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
    },
    transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
})

app.register(fjwt, { secret: process.env.SECRET_KEY! })
app.addHook('preHandler', (req, res, next) => {
    // here we are
    req.jwt = app.jwt
    return next()
})
// cookies
app.register(fCookie, {
    secret: process.env.SECRET_KEY!,
    hook: 'preHandler',
})
app.decorate(
    'authenticate',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const token = req.cookies.access_token
      if (!token) {
        return reply.status(401).send({ message: 'Authentication required' })
      }
      // here decoded will be a different type by default but we want it to be of user-payload type
      const decoded = req.jwt.verify<FastifyJWT['user']>(token)
      req.user = decoded
    },
  )


app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createUser, { prefix: '/v1' })
// app.register(getUser, { prefix: '/v1' })
app.register(authenticateWithEmail, { prefix: '/v1' })
app.register(getProfile, { prefix: '/v1' })
app.register(logout, { prefix: '/v1' })

app.register(createTeam, { prefix: '/v1' })

app.register(createChampionship, { prefix: '/v1' })
app.register(getChampionship, { prefix: '/v1' })
app.register(getChampionshipsList, { prefix: '/v1' })
app.register(getChampionshipTeams, { prefix: '/v1' })

app.setErrorHandler(errorHandler)

export { app }
