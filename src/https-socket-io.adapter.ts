import { IoAdapter } from '@nestjs/platform-socket.io'
import * as io from 'socket.io'
import * as https from 'node:https'

export class HttpsSocketIoAdapter extends IoAdapter {
  protected ioServer: io.Server

  constructor(protected server: https.Server) {
    super()

    const options = {
      cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    }

    this.ioServer = new io.Server(server, options)
  }

  create() {
    console.log(
      'websocket gateway port argument is ignored by ExtendedSocketIoAdapter, use the same port of http instead',
    )
    return this.ioServer
  }
}
