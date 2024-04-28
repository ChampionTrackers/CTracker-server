import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../lib/prisma'
import { generateHash } from '../../utils/hash'
import { BadRequestError } from '../_errors/BadRequest'
import { ConflictError } from '../_errors/Conflict'

export async function createUser(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/signup',
        {
            schema: {
                summary: 'Create an user',
                tags: ['Auth'],
                body: z.object({
                    email: z.string().email(),
                    password: z.string().min(8),
                    name: z.string().min(3).max(50),
                    nickname: z.string().min(3).max(20),
                    picture: z.string().url().nullable(),
                }),
                response: {
                    201: z.object({
                        userId: z.number(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { email, password, name, nickname, picture } = request.body

            const [findEmail, findNickname] = await Promise.all([
                prisma.user.findUnique({
                    where: {
                        email,
                    },
                }),
                prisma.user.findUnique({
                    where: {
                        nickname,
                    },
                }),
            ])

            if (findEmail !== null) throw new ConflictError('Email already exists')
            if (findNickname !== null)
                throw new ConflictError('Nickname already exists')

            const hash = await generateHash(password)
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hash,
                    name,
                    nickname,
                    picture,
                },
            })

            return reply.status(201).send({ userId: user.id })
        }
    )
}
