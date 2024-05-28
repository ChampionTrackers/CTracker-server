import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'prisma',
    environmentOptions: {
      adapter: 'psql',
      envFile: '.env.test',
      prismaEnvVarName: 'DATABASE_URL', // Optional
      transformMode: 'ssr', // Optional
    }
  }
})