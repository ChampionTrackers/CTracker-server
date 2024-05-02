import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/middlewares/verifyJWT";
import { generateHash } from "@/utils/hash";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

export async function editUser(app: FastifyInstance){
  app.withTypeProvider<ZodTypeProvider>().patch("/users", {
    onRequest: (request, reply) => verifyJwt(request, reply),
    schema: {
      summary: "Update your profile",
      tags: ["User"],
      security: [{ JWT: [] }],
      body: z.object({
        email: z.string().email().optional(),
        name: z.string().min(3).max(50).optional(),
        nickname: z.string().min(3).max(20).optional(),
        password: z.string().min(8).optional(),
        picture: z.string().url().optional(),
      }),
      response: {
        200: z.null()
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id;
    const user = request.body;
    
    if(user.password){
      user.password = await generateHash(user.password);
    }
    
    const createUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        ...user
      }
    })

    return reply.status(204).send();
    
  })
}