import { verifyJwt } from '@/http/middlewares/verifyJWT'
import { prisma } from '@/lib/prisma'
import { compareHash } from '@/utils/hash'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ConflictError } from '../_errors/Conflict'
import { NotFoundError } from '../_errors/NotFound'
import { UnauthorizedError } from '../_errors/Unauthorized'

export async function editUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/users',
    {
      onRequest: (request, reply) => verifyJwt(request, reply),
      schema: {
        summary: 'Update your profile',
        tags: ['Auth'],
        security: [{ JWT: [] }],
        body: z.object({
          data: z.object({
            email: z.string().email().optional(),
            name: z.string().min(3).max(50).optional(),
            nickname: z
              .string()
              .min(3)
              .max(20)
              .refine(
                (string) => !string.includes(' '),
                'Nickname should not have spaces',
              )
              .optional(),
            picture: z.string().url().optional(),
          }),
          password: z.string().min(8),
        }),
        response: {
          200: z.null(),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.id
      const data = request.body.data
      const password = request.body.password

      const userPassword = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          password: true,
        },
      })

      if (userPassword === null) {
        throw new NotFoundError('User not found')
      }

      const passwordCompare = await compareHash(password, userPassword.password)

      if (!passwordCompare) {
        throw new UnauthorizedError('Wrong Password')
      }

      if (data.nickname) {
        const findNickname = await prisma.user.findUnique({
          where: {
            nickname: data.nickname,
          },
        })

        if (findNickname) {
          throw new ConflictError('Nickname already exists')
        }
      }

      if (data.email) {
        const findEmail = await prisma.user.findUnique({
          where: {
            email: data.email,
          },
        })

        if (findEmail) {
          throw new ConflictError('Email already exists')
        }
      }

      await prisma.user.update({
        where: {
          id: userId,
        },
        data,
      })

      return reply.status(204).send()
    },
  )
}
