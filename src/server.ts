import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
} from 'fastify-type-provider-zod'
import { errorHandler } from './error-handler'
import { createChampionship } from './routes/create-championship'
import { createUser } from './routes/create-user'
import { getChampionship } from './routes/get-championship'
import { getChampionshipsList } from './routes/get-championships-list'
import { createTeam } from './routes/create-team'
import { getUser } from './routes/get-user'
import { getChampionshipTeams } from './routes/get-championship-teams'

const app = fastify()

app.register(fastifySwagger, {
    swagger: {
        consumes: ['application/json'],
        produces: ['application/json'],
        info: {
            title: 'Champions Tracker',
            description:
            "Esta é a documentação da API do Champions Tracker, que fornece funcionalidades para criação de campeonatos, equipes, jogadores e o gerenciamento como um todo. Aqui você encontrará detalhes sobre os endpoints disponíveis, parâmetros aceitos e os formatos de resposta esperados.\n\nUtilize este documento para entender como integrar e interagir com nossa API de maneira eficaz.\n\n### Funcionalidades Principais\n- **Controle de Campeonatos**:  O organizador poderá criar editar e controlar os campeonatos\n- **Controle de Equipes**: Os usuários poderão criar suas próprias equipes para que possam participar dos campeonatos\n- **Visualização de Campeonatos**: Os usuários poderão visualizar os campeonatos, suas informações e as equipes cadastradas",
            version: '1.0.0',
        },
    },
    transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createUser, { prefix: '/v1' })
app.register(createTeam, { prefix: '/v1' })
app.register(createChampionship, { prefix: '/v1' })
app.register(getChampionship, { prefix: '/v1' })
app.register(getChampionshipsList, { prefix: '/v1' })
app.register(getUser, { prefix: '/v1' })
app.register(getChampionshipTeams, { prefix: '/v1' })

app.setErrorHandler(errorHandler)

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
    console.log(`HTTP Server Running`)
})
