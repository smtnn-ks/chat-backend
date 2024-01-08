import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:https'
import { ExtendedSocketIoAdapter } from './extended-web-socket-adapter'

async function bootstrap() {
  const PORT = process.env.PORT || 6969

  const httpsOptions = {
    key: readFileSync(process.env.SSL_KEY_PATH),
    cert: readFileSync(process.env.SSL_CRT_PATH),
    ca: readFileSync(process.env.SSL_CA_PATH),
  }

  const app = await NestFactory.create(AppModule, { httpsOptions })
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(PORT, () => console.log(`Running on port ${PORT}...`))

  const httpsServer = createServer(httpsOptions)
  app.useWebSocketAdapter(new ExtendedSocketIoAdapter(httpsServer))
  httpsServer.listen(5001, () =>
    console.log(`WS server is running on port 5001...`),
  )
}
bootstrap()
