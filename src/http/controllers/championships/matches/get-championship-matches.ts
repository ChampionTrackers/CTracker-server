import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../../_errors/BadRequest'

export async function getChampionshipMatches(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/championships/:championshipId/matches',
    {
      schema: {
        summary: 'Get championship matches',
        tags: ['Championship'],
        params: z.object({
          championshipId: z.coerce.number().int(),
        }),
        response: {
          200: z.array(
            z.object({
              id: z.number().int(),
              homeTeam: z.object({
                id: z.number().int(),
                name: z.string(),
                picture: z.string().url().nullable(),
                score: z.number().int(),
              }),
              awayTeam: z.object({
                id: z.number().int(),
                name: z.string(),
                picture: z.string().url().nullable(),
                score: z.number().int(),
              }),
              plannedStartTime: z.string().datetime(),
              createdAt: z.string().datetime(),
              status: z.enum(['SCHEDULED', 'RUNNING', 'COMPLETED']),
            }),
          ),
        },
      },
    },
    async (request, reply) => {
      const { championshipId } = request.params

      if (!championshipId) {
        throw new BadRequestError('Championship not found')
      }

      const matches = await prisma.match.findMany({
        where: {
          championshipId,
        },
      })

      const matchesWithScore = await Promise.all(
        matches.map(async (match) => {
          const teamScores = await prisma.teamScore.findMany({
            where: {
              matchId: match.id,
            },
          })

          const teams = await prisma.team.findMany({
            where: {
              id: {
                in: teamScores.map((teamScore) => teamScore.teamId),
              },
            },
          })

          const homeTeam = teams.find(
            (team) => team.id === teamScores[0].teamId,
          )
          const awayTeam = teams.find(
            (team) => team.id === teamScores[1].teamId,
          )

          return {
            id: match.id,
            homeTeam: {
              id: homeTeam!.id,
              name: homeTeam!.name,
              picture: homeTeam!.picture,
              score: teamScores[0].teamScore,
            },
            awayTeam: {
              id: awayTeam!.id,
              name: awayTeam!.name,
              picture: awayTeam!.picture,
              score: teamScores[1].teamScore,
            },
            plannedStartTime: match.plannedStartTime.toISOString(),
            createdAt: match.createdAt.toISOString(),
            status: match.status,
          }
        }),
      )

      if (!matchesWithScore) {
        throw new BadRequestError('Matches not found')
      }

      return reply.send(matchesWithScore)
    },
  )
}
