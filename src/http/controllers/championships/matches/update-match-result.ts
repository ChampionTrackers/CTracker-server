import { verifyJwt } from '@/http/middlewares/verifyJWT'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { NotFoundError } from '../../_errors/NotFound'
import { UnauthorizedError } from '../../_errors/Unauthorized'

export async function updateMatchResult(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/championships/:championshipId/matches/:matchId/score',
    {
      onRequest: (request, reply) => verifyJwt(request, reply),
      schema: {
        summary: 'Update match result',
        tags: ['Championship'],
        security: [{ JWT: [] }],
        params: z.object({
          championshipId: z.coerce.number().int(),
          matchId: z.coerce.number().int(),
        }),
        body: z.object({
          teamId: z.number().int(),
          score: z.number().int(),
        }),
        response: {
          204: z.null(),
        },
      },
    },

    async (request, reply) => {
      const { championshipId, matchId } = request.params
      const { teamId, score } = request.body
      const userId = request.user.id

      const [championship, match] = await Promise.all([
        prisma.championship.findFirst({
          where: {
            id: championshipId,
          },
        }),
        prisma.match.findFirst({
          where: {
            id: matchId,
          },
        }),
      ])

      if (!championship) throw new NotFoundError('Championship not found')
      if (!match) throw new NotFoundError('Match not found')

      const isOwner = championship.userId === userId
      if (!isOwner)
        throw new UnauthorizedError(
          'You are not the owner of this championship',
        )

      const teamScores = await prisma.teamScore.findFirst({
        where: {
          matchId,
          teamId,
        },
      })

      console.log(teamScores)

      if (!teamScores) throw new NotFoundError('Team score not found')

      await prisma.teamScore.update({
        where: {
          id: teamScores.id,
        },
        data: {
          teamScore: score,
        },
      })

      return reply.status(204).send()
    },
  )
}
