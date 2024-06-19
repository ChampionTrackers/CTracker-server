import { verifyJwt } from '@/http/middlewares/verifyJWT'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../../_errors/BadRequest'
import { NotFoundError } from '../../_errors/NotFound'
import { UnauthorizedError } from '../../_errors/Unauthorized'

export async function updateMatchStatus(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/championships/:championshipId/matches/:matchId/status',
    {
      onRequest: (request, reply) => verifyJwt(request, reply),
      schema: {
        summary: 'Update match status',
        tags: ['Championship'],
        security: [{ JWT: [] }],
        params: z.object({
          championshipId: z.coerce.number().int(),
          matchId: z.coerce.number().int(),
        }),
        body: z.object({
          status: z.enum(['SCHEDULED', 'RUNNING', 'COMPLETED']),
        }),
        response: {
          200: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { championshipId, matchId } = request.params
      const { status } = request.body
      const userId = request.user.id

      const [championship, match] = await Promise.all([
        prisma.championship.findUnique({
          where: {
            id: championshipId,
          },
        }),
        prisma.match.findUnique({
          where: {
            id: matchId,
          },
        }),
      ])

      if (!championship) throw new NotFoundError('Championship not found')
      if (!match) throw new NotFoundError('Match not found')
      if (match.status === 'COMPLETED')
        throw new BadRequestError('Cannot update status of a completed match')

      const isOwner = championship.userId === userId
      if (!isOwner)
        throw new UnauthorizedError(
          'You are not the owner of this championship',
        )

      const teamScores = await prisma.teamScore.findMany({
        where: {
          matchId,
        },
      })

      await prisma.match.update({
        where: {
          id: matchId,
        },
        data: {
          status,
        },
      })

      if (status === 'COMPLETED') {
        const highestScore = Math.max(
          ...teamScores.map((teamScore) => teamScore.teamScore),
        )
        const highestScoreTeamScores = teamScores.filter(
          (teamScore) => teamScore.teamScore === highestScore,
        )
        const winGuesses = await prisma.guess.findMany({
          where: {
            teamScoreId: {
              in: highestScoreTeamScores.map((teamScore) => teamScore.id),
            },
          },
        })

        const winningTeams = highestScoreTeamScores.map(
          (teamScore) => teamScore.teamId,
        )

        const lostGuesses = await prisma.guess.findMany({
          where: {
            teamScoreId: {
              in: teamScores.map((teamScore) => teamScore.id),
              notIn: highestScoreTeamScores.map((teamScore) => teamScore.id),
            },
          },
        })

        const winningTeamChampionships = await prisma.teamChampionship.findMany(
          {
            where: {
              teamId: {
                in: winningTeams,
              },
              championshipId,
            },
          },
        )

        const losingTeams = teamScores
          .filter((teamScore) => !winningTeams.includes(teamScore.teamId))
          .map((teamScore) => teamScore.teamId)
        const losingTeamChampionships = await prisma.teamChampionship.findMany({
          where: {
            teamId: {
              in: losingTeams,
            },
            championshipId,
          },
        })

        if (highestScoreTeamScores.length !== 1) {
          await Promise.all([
            prisma.guess.updateMany({
              where: {
                id: {
                  in: winGuesses.map((guess) => guess.id),
                },
              },
              data: {
                outcome: 'DRAW',
              },
            }),

            winGuesses.map(async (guess) => {
              await prisma.user.update({
                where: {
                  id: guess.userId,
                },
                data: {
                  balance: {
                    increment: (guess.guessCost * 2) / 2,
                  },
                },
              })
            }),

            winningTeamChampionships.map(async (teamChampionship) => {
              await prisma.teamChampionship.update({
                where: {
                  teamId_championshipId: {
                    teamId: teamChampionship.teamId,
                    championshipId: teamChampionship.championshipId,
                  },
                },
                data: {
                  draw: {
                    increment: 1,
                  },
                },
              })
            }),

            winningTeams.map(async (teamId) => {
              await prisma.teamScore.update({
                where: {
                  matchId_teamId: {
                    matchId,
                    teamId,
                  },
                },
                data: {
                  teamStatus: 'DRAW',
                },
              })
            }),
          ])

          return reply.send()
        }

        await Promise.all([
          prisma.guess.updateMany({
            where: {
              id: {
                in: winGuesses.map((guess) => guess.id),
              },
            },
            data: {
              outcome: 'WIN',
            },
          }),

          prisma.guess.updateMany({
            where: {
              id: {
                in: lostGuesses.map((guess) => guess.id),
              },
            },
            data: {
              outcome: 'LOST',
            },
          }),

          winGuesses.map(async (guess) => {
            await prisma.user.update({
              where: {
                id: guess.userId,
              },
              data: {
                balance: {
                  increment: guess.guessCost * 2,
                },
              },
            })
          }),

          winningTeamChampionships.map(async (teamChampionship) => {
            await prisma.teamChampionship.update({
              where: {
                teamId_championshipId: {
                  teamId: teamChampionship.teamId,
                  championshipId: teamChampionship.championshipId,
                },
              },
              data: {
                victory: {
                  increment: 1,
                },
              },
            })
          }),

          winningTeams.map(async (teamId) => {
            await prisma.teamScore.update({
              where: {
                matchId_teamId: {
                  matchId,
                  teamId,
                },
              },
              data: {
                teamStatus: 'WON',
              },
            })
          }),

          losingTeamChampionships.map(async (teamChampionship) => {
            await prisma.teamChampionship.update({
              where: {
                teamId_championshipId: {
                  teamId: teamChampionship.teamId,
                  championshipId: teamChampionship.championshipId,
                },
              },
              data: {
                defeat: {
                  increment: 1,
                },
              },
            })
          }),

          losingTeams.map(async (teamId) => {
            await prisma.teamScore.update({
              where: {
                matchId_teamId: {
                  matchId,
                  teamId,
                },
              },
              data: {
                teamStatus: 'LOST',
              },
            })
          }),
        ])

        return reply.send()
      }
    },
  )
}
