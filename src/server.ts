import { app } from "./app"

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.listen({ port, host: '0.0.0.0' }).then(() => {
    console.log(`HTTP Server Running at http://localhost:${port} 🚀`)
})