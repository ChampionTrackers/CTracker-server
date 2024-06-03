import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { NotFoundError } from '../_errors/NotFound'

export async function getUser(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '/users/:userId',
        {
            schema: {
                summary: 'Get an user',
                tags: ['Auth'],
                params: z.object({
                    userId: z.coerce.number().int(),
                }),
                response: {
                    200: z.object({
                        user: z.object({
                            nickname: z.string(),
                            picture: z.string().url().nullable(),
                            score: z.number().int(),
                        })
                    }),
                },
            },
        },
        async (request, reply) => {
            const { userId } = request.params

            const user = await prisma.user.findUnique({
                select: {
                    nickname: true,
                    picture: true,
                    score: true,
                },
                where: {
                    id: userId,
                }
            })

            if (user === null) {
                throw new NotFoundError("User not found")
            }

            return reply.send({ user: {
                nickname: user.nickname,
                picture: user.picture,
                score: user.score
            } })
        }
    )
}