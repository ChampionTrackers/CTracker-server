import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/BadRequest'

export async function createChampionship(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/championships',
        {
            schema: {
                summary: 'Create a championship',
                tags: ['Championship'],
                body: z.object({
                    userId: z.number().int(),
                    name: z.string().min(3),
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
            const { userId, name, picture, description, type, game } =
                request.body

            const user = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            })

            if (user === null)
                throw new BadRequestError("This user doesn't exist")

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
