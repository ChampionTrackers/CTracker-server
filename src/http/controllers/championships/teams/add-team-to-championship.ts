import { verifyJwt } from '@/http/middlewares/verifyJWT'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ConflictError } from '../../_errors/Conflict'
import { NotFoundError } from '../../_errors/NotFound'
import { UnauthorizedError } from '../../_errors/Unauthorized'

export async function addTeamToChampionship(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/championships/:championshipId/teams',
    {
      onRequest: (request, reply) => verifyJwt(request, reply),
      schema: {
        summary: 'Add a team to a championship',
        tags: ['Championship'],
        security: [{ JWT: [] }],
        params: z.object({
          championshipId: z.coerce.number().int(),
        }),
        body: z.object({
          teamId: z.number().int(),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.id
      const { championshipId } = request.params
      const { teamId } = request.body

      const [
        findTeam,
        findChampionship,
        findUserChampionship,
        findTeamInChampionship,
      ] = await Promise.all([
        prisma.team.findUnique({
          where: {
            id: teamId,
          },
        }),
        prisma.championship.findUnique({
          where: {
            id: championshipId,
          },
        }),
        prisma.championship.findUnique({
          where: {
            id: championshipId,
            userId,
          },
        }),
        prisma.teamChampionship.findUnique({
          where: {
            teamId_championshipId: {
              championshipId,
              teamId,
            },
          },
        }),
      ])

      if (!findChampionship) throw new NotFoundError('Championship not found')
      if (!findTeam) throw new NotFoundError('Team not found')
      if (!findUserChampionship)
        throw new UnauthorizedError(
          "You don't have permission to add a team to this championship",
        )
      if (findTeamInChampionship)
        throw new ConflictError('This team is already in this championship')

      await prisma.teamChampionship.create({
        data: {
          teamId,
          championshipId,
        },
      })

      return reply.status(201).send()
    },
  )
}
