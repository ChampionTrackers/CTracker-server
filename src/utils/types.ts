type UserPayload = {
    id: number
}
declare module '@fastify/jwt' {
    interface FastifyJWT {
        user: UserPayload
    }
}
