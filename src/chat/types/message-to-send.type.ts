import { SignedMessage } from '.'

export type MessageToSend = {
  socketId: string
  signedMessage: SignedMessage
}
