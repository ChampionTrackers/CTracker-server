import { app } from './app'
import { env } from './env/index'

const port = env.PORT

app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`HTTP Server Running at http://localhost:3333 🚀`)
})
