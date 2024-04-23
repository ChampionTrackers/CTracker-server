import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { BadRequestError } from "../_errors/BadRequest";
import { NotFoundError } from "../_errors/NotFound";

export async function getChampionship(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '/championships/:championshipId',
        {
            schema: {
                summary: 'Get a championship',
                tags: ['Championship'],
                params: z.object({
                    championshipId: z.coerce.number().int(),
                }),
                response: {
                    200: z.object({
                        championship: z.object({
                            id: z.number().int(),
                            ownerId: z.number().int(),
                            name: z.string().min(3),
                            picture: z.string().url().nullable(),
                            description: z.string().min(3),
                            type: z.enum(['PHYSICAL', 'VIRTUAL']),
                            createdAt: z.date(),
                            teamsAmount: z.number().int(),
                            game: z.string().min(3)
                        })
                    }),
                },
            },
        },
        async (request, reply) => {
            const { championshipId } = request.params
    
            const findChampionship = await prisma.championship.findUnique({
                where: {
                    id: championshipId
                }
            })

            if (findChampionship === null) throw new BadRequestError("This championship don't exist")
                
            const championship = await prisma.championship.findUnique({
                select: {
                    id: true,
                    userId: true,
                    name: true,
                    picture: true,
                    description: true,
                    status: true,
                    type: true,
                    createdAt: true,
                    game: true,
                    _count: {
                        select: {
                            TeamChampionship: true
                        }
                    },
                },
                where: {
                    id: championshipId,
                }
            })
    
            if (championship === null) {
                throw new NotFoundError("Championship not found")
            }
    
            return reply.send({ 
                championship: {
                    id: championship.id,
                    ownerId: championship.userId,
                    name: championship.name,
                    picture: championship.picture,
                    description: championship.description,
                    type: championship.type,
                    game: championship.game,
                    createdAt: championship.createdAt,
                    teamsAmount: championship._count.TeamChampionship
                }
             })
        }
    );
}