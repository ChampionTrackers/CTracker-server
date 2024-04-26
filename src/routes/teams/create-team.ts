import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/BadRequest'

export async function createTeam(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/teams',
        {
            schema: {
                summary: 'Create a team',
                tags: ['Team'],
                body: z.object({
                    userId: z.number().int(),
                    name: z.string().min(3).max(30),
                    picture: z.string().url().nullable(),
                    description: z.string(),
                    maxPlayers: z.number().int(),
                }),
                response: {
                    201: z.object({
                        teamId: z.number().int(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { userId, name, picture, description, maxPlayers } =
                request.body

            const user = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            })

            if (user === null)
                throw new BadRequestError("This user doesn't exist")

            const team = await prisma.team.create({
                data: {
                    userId,
                    name,
                    picture,
                    description,
                    maxPlayers,
                },
            })

            return reply.status(201).send({ teamId: team.id })
        }
    )
}
