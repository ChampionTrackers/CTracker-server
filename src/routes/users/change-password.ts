import { prisma } from '@/lib/prisma';
import { compareHash, generateHash } from '@/utils/hash';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { NotFoundError } from '../_errors/NotFound';
import { verifyJwt } from '@/middlewares/verifyJWT';

export async function changePassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/password/change',
    {
      onRequest: (request, reply) => verifyJwt(request, reply),
      schema: {
        summary: 'Change your password',
        tags: ['Auth'],
        security: [{ JWT: [] }],
        body: z.object({
          password: z.string().min(8),
          newPassword: z.string().min(8),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { password, newPassword } = request.body;

      const userPassword = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          password: true,
        },
      });

      if (userPassword === null) {
        throw new NotFoundError('User not found');
      }

      const comparePassword = await compareHash(password, userPassword.password);

      if (!comparePassword) {
        throw new NotFoundError('Invalid password');
      }

      const hashedPassword = await generateHash(newPassword);

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          password: hashedPassword,
        },
      });

      reply.status(204).send();
    }
  );
}
