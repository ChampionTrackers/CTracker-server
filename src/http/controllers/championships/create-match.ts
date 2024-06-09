import { verifyJwt } from '@/http/middlewares/verifyJWT'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/BadRequest'
import { UnauthorizedError } from '../_errors/Unauthorized'

export async function createMatch(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/championships/:championshipId/matches',
    {
      onRequest: (request, reply) => verifyJwt(request, reply),
      schema: {
        summary: 'Create a match',
        tags: ['Championship'],
        security: [{ JWT: [] }],
        params: z.object({
          championshipId: z.coerce.number().int(),
        }),
        body: z.object({
          homeTeamId: z.number().int(),
          awayTeamId: z.number().int(),
          plannedStartTime: z.string().datetime(),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.id
      const { championshipId } = request.params
      const { homeTeamId, awayTeamId, plannedStartTime } = request.body

      const [championshipExists, homeTeamExists, awayTeamExists] =
        await Promise.all([
          prisma.championship.findUnique({
            where: {
              id: championshipId,
            },
          }),
          prisma.team.findUnique({
            where: {
              id: homeTeamId,
            },
          }),
          prisma.team.findUnique({
            where: {
              id: awayTeamId,
            },
          }),
        ])

      if (!championshipExists) {
        throw new BadRequestError('Championship not found')
      }

      const isOwner = championshipExists.userId === userId
      if (!isOwner) {
        throw new UnauthorizedError(
          'You are not the owner of this championship',
        )
      }

      if (!homeTeamExists) {
        throw new BadRequestError('Home team not found')
      }

      if (!awayTeamExists) {
        throw new BadRequestError('Away team not found')
      }

      const [homeTeamExistsInChampionship, awayTeamExistsInChampionship] =
        await Promise.all([
          prisma.teamChampionship.findFirst({
            where: {
              championshipId,
              teamId: homeTeamId,
            },
          }),
          prisma.teamChampionship.findFirst({
            where: {
              championshipId,
              teamId: awayTeamId,
            },
          }),
        ])

      if (!homeTeamExistsInChampionship) {
        throw new BadRequestError('Home team not in championship')
      }

      if (!awayTeamExistsInChampionship) {
        throw new BadRequestError('Away team not in championship')
      }

      const match = await prisma.match.create({
        data: {
          championshipId,
          plannedStartTime,
        },
      })

      await prisma.teamScore.createMany({
        data: [
          { matchId: match.id, teamId: homeTeamId },
          { matchId: match.id, teamId: awayTeamId },
        ],
      })

      return reply.status(201).send()
    },
  )
}
