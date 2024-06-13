import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { NotFoundError } from '../../_errors/NotFound'

export async function getChampionshipTeams(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/championships/:championshipId/teams',
    {
      schema: {
        summary: 'Get championship teams',
        tags: ['Championship'],
        params: z.object({
          championshipId: z.coerce.number().int(),
        }),
        response: {
          200: z.array(
            z.object({
              id: z.number().int(),
              name: z.string(),
              picture: z.string().url().nullable(),
              victory: z.number().int(),
              defeat: z.number().int(),
              draw: z.number().int(),
            }),
          ),
        },
      },
    },
    async (request, reply) => {
      const { championshipId } = request.params

      const findChampionship = await prisma.championship.findUnique({
        where: {
          id: championshipId,
        },
      })

      if (findChampionship === null)
        throw new NotFoundError("This championship don't exist")

      const teams = await prisma.teamChampionship.findMany({
        select: {
          teamId: true,
          victory: true,
          defeat: true,
          draw: true,
          team: {
            select: {
              name: true,
              picture: true,
            },
          },
        },
        where: {
          championshipId,
        },
      })

      if (teams === null) throw new NotFoundError('Teams not found')

      return reply.send(
        teams.map((team) => {
          return {
            id: team.teamId,
            name: team.team.name,
            picture: team.team.picture,
            victory: team.victory,
            defeat: team.defeat,
            draw: team.draw,
          }
        }),
      )
    },
  )
}
