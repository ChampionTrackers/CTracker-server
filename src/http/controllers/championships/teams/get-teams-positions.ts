import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function getTeamsPositions(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/championships/:championshipId/teams/positions',
    {
      schema: {
        summary: 'Get teams positions',
        tags: ['Championship'],
        params: z.object({
          championshipId: z.coerce.number().int(),
        }),
        response: {
          200: z.array(
            z.object({
              teamId: z.number().int(),
              teamName: z.string(),
              wins: z.number().int(),
              losses: z.number().int(),
              draws: z.number().int(),
              points: z.number().int(),
            }),
          ),
        },
      },
    },
    async (request, reply) => {
      const { championshipId } = request.params

      // Busca todas as equipes que participam do campeonato
      const teams = await prisma.team.findMany({
        where: {
          TeamChampionship: {
            some: {
              championshipId,
            },
          },
        },
      })

      // Calcula as estatísticas de cada equipe
      const teamStats = await Promise.all(
        teams.map(async (team) => {
          const matches = await prisma.teamScore.findMany({
            where: {
              teamId: team.id,
              match: {
                championshipId,
              },
            },
            select: {
              teamStatus: true,
            },
          })

          const stats = matches.reduce(
            (acc, match) => {
              if (match.teamStatus === 'WON') {
                acc.wins += 1
              } else if (match.teamStatus === 'LOST') {
                acc.losses += 1
              } else if (match.teamStatus === 'DRAW') {
                acc.draws += 1
              }
              return acc
            },
            { wins: 0, losses: 0, draws: 0 },
          )

          const points = stats.wins * 3 + stats.draws * 1

          return {
            teamId: team.id,
            teamName: team.name,
            wins: stats.wins,
            losses: stats.losses,
            draws: stats.draws,
            points,
          }
        }),
      )

      // Ordena as equipes pelo ranking
      teamStats.sort((a, b) => {
        if (a.points !== b.points) {
          return b.points - a.points
        }
        if (a.wins !== b.wins) {
          return b.wins - a.wins
        }
        if (a.draws !== b.draws) {
          return b.draws - a.draws
        }
        return a.losses - b.losses
      })

      reply.send(teamStats)
    },
  )
}
