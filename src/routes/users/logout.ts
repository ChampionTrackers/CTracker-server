import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

export async function logout(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().delete("/logout", {
        preHandler: [app.authenticate],
        schema: {
            summary: "Logout an user",
            tags: ["User"],
            response: {
                200: z.object({
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        reply.clearCookie('access_token')
        reply.send({message: 'Logged out'})
    })
}