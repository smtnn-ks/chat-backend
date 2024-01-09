import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { readFileSync } from 'node:fs'
import * as https from 'node:https'
import * as http from 'node:http'
import { HttpsSocketIoAdapter } from './extended-web-socket-adapter'
import { HttpSocketIOAdapter } from './http-socket-io.adapter'

async function bootstrap() {
  const PORT = process.env.PORT || 6969

  let app: any
  let wsServer: any

  console.log('INFO :: NODE_ENV :', process.env.NODE_ENV)

  if (process.env.NODE_ENV === 'production') {
    const httpsOptions = {
      key: readFileSync(process.env.SSL_KEY_PATH),
      cert: readFileSync(process.env.SSL_CRT_PATH),
      ca: readFileSync(process.env.SSL_CA_PATH),
    }
    app = await NestFactory.create(AppModule, { httpsOptions })
    wsServer = https.createServer(httpsOptions)
    app.useWebSocketAdapter(new HttpsSocketIoAdapter(wsServer))
  } else {
    app = await NestFactory.create(AppModule)
    wsServer = http.createServer()
    app.useWebSocketAdapter(new HttpSocketIOAdapter(wsServer))
  }

  app.enableCors()
  app.useGlobalPipes(new ValidationPipe())

  await app.listen(PORT, () => console.log(`Running on port ${PORT}...`))

  wsServer.listen(5001, () =>
    console.log(`WS server is running on port 5001...`),
  )
}
bootstrap()
