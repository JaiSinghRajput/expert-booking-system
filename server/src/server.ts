import 'dotenv/config.js'
import http from 'node:http'

import { connectDatabase } from './config/database.js'
import { createApp } from './app.js'
import { ensureSeedData } from './services/store.js'
import { initializeSockets } from './sockets/index.js'

const port = Number(process.env.PORT ?? 5000)

async function bootstrap() {
  await connectDatabase()
  await ensureSeedData()

  const app = createApp()
  const httpServer = http.createServer(app)
  initializeSockets(httpServer)

  httpServer.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error)
  process.exitCode = 1
})
