type UserPayload = {
    id: number
    email: string,
    nickname: string
}
declare module '@fastify/jwt' {
    interface FastifyJWT {
        user: UserPayload
    }
}
