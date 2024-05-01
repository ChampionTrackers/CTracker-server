import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/BadRequest'
import { verifyJwt } from '@/middlewares/verifyJWT'
import { NotFoundError } from '../_errors/NotFound'

export async function createChampionship(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/championships',
        {
            onRequest: (request, reply) => verifyJwt(request, reply),
            schema: {
                summary: 'Create a championship',
                tags: ['Championship'],
                security: [{JWT: []}],
                body: z.object({
                    name: z.string().min(3).max(40),
                    picture: z.string().url().nullable(),
                    description: z.string().min(3),
                    type: z.enum(['PHYSICAL', 'VIRTUAL']),
                    game: z.string().min(3),
                }),
                response: {
                    201: z.object({
                        championshipId: z.number().int(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const userId = request.user.id
            const { name, picture, description, type, game } = request.body

            const user = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            })

            if (user === null)
                throw new NotFoundError("This user doesn't exist")

            const championship = await prisma.championship.create({
                data: {
                    userId,
                    name,
                    picture,
                    description,
                    type,
                    game,
                    status: 'ACTIVE',
                },
            })

            return reply.status(201).send({ championshipId: championship.id })
        }
    )
}
