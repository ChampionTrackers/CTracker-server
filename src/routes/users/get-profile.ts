import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { NotFoundError } from '../_errors/NotFound'
import { verifyJwt } from '@/middlewares/verifyJWT'

export async function getProfile(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '/users',
        {
            onRequest: [verifyJwt],
            schema: {
                summary: 'Get your profile',
                tags: ['User'],
                security: [{ JWT: [] }],
                response: {
                    200: z.object({
                            email: z.string().email(),
                            name: z.string(),
                            nickname: z.string(),
                            picture: z.string().url().nullable(),
                            score: z.number().int(),
                    }),
                },
            },
            
        },
        async (request, reply) => {
            const { id } = request.user

            const user = await prisma.user.findUnique({
                select: {
                    email: true,
                    name: true,
                    nickname: true,
                    picture: true,
                    score: true,
                },
                where: {
                    id,
                }
            })

            if (user === null) {
                throw new NotFoundError("User not found")
            }

            return reply.send({
                email: user.email,
                name: user.name,
                nickname: user.nickname,
                picture: user.picture,
                score: user.score
            })
        }
    )
}
