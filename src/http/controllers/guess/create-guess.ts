import { verifyJwt } from '@/http/middlewares/verifyJWT'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/BadRequest'
import { NotFoundError } from '../_errors/NotFound'

export async function createGuess(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/guesses',
    {
      onRequest: (request, reply) => verifyJwt(request, reply),
      schema: {
        summary: 'Create a guess',
        tags: ['Guess'],
        security: [{ JWT: [] }],
        body: z.object({
          matchId: z.number().int(),
          teamId: z.number().int(),
          guessCost: z.number().int(),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.id
      const { matchId, teamId, guessCost } = request.body

      const [match, team, user] = await Promise.all([
        prisma.match.findUnique({
          where: {
            id: matchId,
          },
        }),

        prisma.team.findUnique({
          where: {
            id: teamId,
          },
        }),
        prisma.user.findUnique({
          where: {
            id: userId,
          },
        }),
      ])

      if (!match) {
        throw new NotFoundError('Match not found')
      }

      if (!team) {
        throw new NotFoundError('Team not found')
      }

      const teamScore = await prisma.teamScore.findFirst({
        where: {
          matchId,
          teamId,
        },
      })

      if (!teamScore) {
        throw new NotFoundError('Team score not found')
      }

      const matchTeamScores = await prisma.teamScore.findMany({
        where: {
          matchId,
        },
      })

      await Promise.all(
        matchTeamScores.map(async (matchTeamScore) => {
          const guessExists = await prisma.guess.findFirst({
            where: {
              userId,
              teamScoreId: matchTeamScore.id,
            },
          })

          if (guessExists) {
            throw new BadRequestError('Guess on this match already exists')
          }
        }),
      )

      if (user!.balance < guessCost) {
        throw new BadRequestError('Insufficient balance')
      }

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          balance: {
            decrement: guessCost,
          },
        },
      })

      await prisma.guess.create({
        data: {
          userId,
          teamScoreId: teamScore.id,
          guessCost,
        },
      })

      reply.status(201).send()
    },
  )
}
