import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { UnauthorizedError } from "../_errors/Unauthorized";
import { compareHash } from "@/utils/hash";

export async function authenticateWithEmail(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post("/login", {
        schema: {
            summary: "Authenticate an user with Email",
            tags: ["User"],
            body: z.object({
                email: z.string().email(),
                password: z.string(),
            }),
            response: {
                200: z.object({
                    token: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const { email, password } = request.body

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (user === null) throw new UnauthorizedError("Invalid Credentials")
        
        const passwordCompare = await compareHash(password, user.password)

        if (!passwordCompare) throw new UnauthorizedError("Invalid Credentials")

        const token = app.jwt.sign({ id: user.id })

        reply.setCookie('access_token', token, {
            path: '/',
            httpOnly: true,
            secure: true,
        })

        reply.status(200).send({ token })
    })
}