import { prisma } from '@/lib/prisma';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { NotFoundError } from '../_errors/NotFound';

export async function getChampionshipsList(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/championships',
    {
      schema: {
        summary: 'Get championships list',
        tags: ['Championship'],
        querystring: z.object({
          query: z.string().nullish(),
          pageIndex: z.string().nullish().default('0').transform(Number),
        }),
        response: {
          200: z.array(
            z.object({
              id: z.number().int(),
              name: z.string().min(3),
              picture: z.string().url().nullable(),
              type: z.enum(['PHYSICAL', 'VIRTUAL']),
              game: z.string(),
              createdAt: z.date(),
              teamsAmount: z.number().int(),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      const { query, pageIndex } = request.query;

      const championships = await prisma.championship.findMany({
        select: {
          id: true,
          name: true,
          picture: true,
          description: true,
          status: true,
          type: true,
          createdAt: true,
          game: true,
          _count: {
            select: {
              TeamChampionship: true,
            },
          },
        },
        where: query
          ? {
              name: {
                contains: query,
              },
            }
          : {},
        skip: pageIndex * 10,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reply.send(
        championships.map((championship) => {
          return {
            id: championship.id,
            name: championship.name,
            picture: championship.picture,
            type: championship.type,
            game: championship.game,
            createdAt: championship.createdAt,
            teamsAmount: championship._count.TeamChampionship,
          };
        })
      );
    }
  );
}
