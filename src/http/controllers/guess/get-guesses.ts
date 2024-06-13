import { verifyJwt } from '@/http/middlewares/verifyJWT'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function getGuesses(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/guesses',
    {
      onRequest: (request, reply) => verifyJwt(request, reply),
      schema: {
        summary: 'Get own guesses',
        tags: ['Guess'],
        security: [{ JWT: [] }],
        response: {
          200: z.array(
            z.object({
              id: z.number().int(),
              teamName: z.string(),
              championship: z.object({
                id: z.number().int(),
                name: z.string(),
              }),
              guessCost: z.number().int(),
              outcome: z.enum(['PENDING', 'WIN', 'LOST', 'DRAW', 'CANCELLED']),
              lootCollected: z.boolean(),
              createdAt: z.date(),
            }),
          ),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.id

      const guesses = await prisma.guess.findMany({
        where: {
          userId,
        },
      })

      const guessesWithChampionshipAndTeam = await Promise.all(
        guesses.map(async (guess) => {
          const teamScore = await prisma.teamScore.findFirst({
            where: {
              id: guess.teamScoreId,
            },
          })

          const [team, match] = await Promise.all([
            prisma.team.findFirst({
              select: {
                name: true,
              },
              where: {
                id: teamScore!.teamId,
              },
            }),

            prisma.match.findFirst({
              where: {
                id: teamScore!.matchId,
              },
            }),
          ])

          const championship = await prisma.championship.findFirst({
            select: {
              id: true,
              name: true,
            },
            where: {
              id: match!.championshipId,
            },
          })

          return {
            id: guess.id,
            teamName: team!.name,
            championship: {
              ...championship!,
            },
            guessCost: guess.guessCost,
            outcome: guess.outcome,
            lootCollected: guess.lootCollected,
            createdAt: guess.createdAt,
          }
        }),
      )

      reply.send(guessesWithChampionshipAndTeam)
    },
  )
}
