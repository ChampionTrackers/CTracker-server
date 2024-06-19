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
            highestGuess: z.number().int(),
            totalEarnings: z.number().int(),
            totalLosses: z.number().int(),
            lastTeamGuessedAt: z.string(),
            totalGuesses: z.number().int(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.user

      const [
        user,
        highestGuess,
        totalEarnings,
        totalLosses,
        totalGuesses,
        lastGuess,
      ] = await Promise.all([
        prisma.user.findUnique({
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
        }),
        prisma.guess.findFirst({
          select: {
            guessCost: true,
          },
          where: {
            userId: id,
          },
          orderBy: {
            guessCost: 'desc',
          },
        }),
        prisma.guess.aggregate({
          _sum: {
            guessCost: true,
          },
          where: {
            userId: id,
            outcome: 'WIN',
          },
        }),
        prisma.guess.aggregate({
          _sum: {
            guessCost: true,
          },
          where: {
            userId: id,
            outcome: 'LOST',
          },
        }),
        prisma.guess.count({
          where: {
            userId: id,
          },
        }),
        prisma.guess.findFirst({
          where: {
            userId: id,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
      ])

      const lastTeamGuessedAt = await prisma.team.findFirst({
        where: {
          TeamScore: {
            some: {
              id: lastGuess?.teamScoreId,
            },
          },
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
        highestGuess: highestGuess?.guessCost ?? 0,
        totalEarnings: totalEarnings._sum.guessCost ?? 0,
        totalLosses: totalLosses._sum.guessCost ?? 0,
        lastTeamGuessedAt: lastTeamGuessedAt?.name ?? 'Never',
        totalGuesses,
      })
    },
  )
}
