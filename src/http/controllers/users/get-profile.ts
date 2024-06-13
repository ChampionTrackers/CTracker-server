import { verifyJwt } from '@/http/middlewares/verifyJWT'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { NotFoundError } from '../_errors/NotFound'

export async function getProfile(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/profile',
    {
      onRequest: [verifyJwt],
      schema: {
        summary: 'Get your profile',
        tags: ['Auth'],
        security: [{ JWT: [] }],
        response: {
          200: z.object({
            email: z.string().email(),
            name: z.string(),
            nickname: z.string(),
            picture: z.string().url().nullable(),
            score: z.number().int(),
            balance: z.number().int(),
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
          balance: true,
        },
        where: {
          id,
        },
      })

      if (user === null) {
        throw new NotFoundError('User not found')
      }

      return reply.send({
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        picture: user.picture,
        score: user.score,
        balance: user.balance,
      })
    },
  )
}
