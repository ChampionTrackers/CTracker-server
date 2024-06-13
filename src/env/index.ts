import 'dotenv/config'
import z from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().int().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('⚠️ Environment variables are not valid: ', _env.error.format())
  throw new Error('Environment variables are not valid.')
}

export const env = _env.data
