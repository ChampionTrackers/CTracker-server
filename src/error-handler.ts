import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

type FastifyErrorHandler = FastifyInstance['errorHandler'];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
    if (error instanceof ZodError){
        return reply.status(400).send({
            message: `Error during validation`,
            errors: error.flatten().fieldErrors
        })
    }

    const statusCode = error.statusCode ?? 500
    const message = error.statusCode ? error.message : 'Internal Server Error'
    
    return reply.status(statusCode).send({ message });
};