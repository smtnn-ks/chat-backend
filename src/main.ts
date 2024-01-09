import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { readFileSync } from 'node:fs'
import * as https from 'node:https'
import * as http from 'node:http'
import { HttpsSocketIoAdapter, HttpSocketIOAdapter } from './adapters'

async function bootstrap() {
  const REST_PORT = process.env.REST_PORT || 6969
  const WS_PORT = process.env.WS_PORT || 6666

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

  await app.listen(REST_PORT, () =>
    console.log(`INFO :: REST server is running on port ${REST_PORT}...`),
  )

  wsServer.listen(WS_PORT, () =>
    console.log(`INFO :: WS server is running on port ${WS_PORT}...`),
  )
}
bootstrap()
