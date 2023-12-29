import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'
import { Keys } from 'src/auth/types'
import { readFileSync } from 'fs'

@Injectable()
export class CryptoService {
  private privateKey: crypto.KeyObject

  constructor() {
    const raw = readFileSync('private.pem')
    this.privateKey = crypto.createPrivateKey(raw)
  }

  hashSync(input: string) {
    const hash = crypto.createHash('sha512')
    hash.update(input)
    return hash.digest('hex')
  }

  hash(input: string) {
    return new Promise<string>((resolve) => {
      resolve(this.hashSync(input))
    })
  }

  compareSync(data: string, encrypted: string) {
    return this.hashSync(data) === encrypted
  }

  async compare(data: string, encrypted: string) {
    return new Promise<boolean>((resolve) => {
      resolve(this.compareSync(data, encrypted))
    })
  }

  generateRsaKeyPair(): Promise<Keys> {
    return new Promise<{ publicKey: string; privateKey: string }>(
      (resolve, reject) => {
        crypto.generateKeyPair(
          'rsa',
          {
            modulusLength: 2048,
            publicKeyEncoding: {
              type: 'spki',
              format: 'pem',
            },
            privateKeyEncoding: {
              type: 'pkcs8',
              format: 'pem',
            },
          },
          (err: Error | null, publicKey: string, privateKey: string) => {
            if (err) reject(err)
            resolve({
              publicKey: publicKey
                .replace('-----BEGIN PUBLIC KEY-----', '')
                .replace('-----END PUBLIC KEY-----', '')
                .replaceAll('\n', ''),
              privateKey: privateKey
                .replace('-----BEGIN PRIVATE KEY-----', '')
                .replace('-----END PRIVATE KEY-----', '')
                .replaceAll('\n', ''),
            })
          },
        )
      },
    )
  }

  async signMessage(message: string): Promise<string> {
    const sign = crypto.createSign('sha512')
    sign.update(message)
    sign.end()
    return sign.sign(this.privateKey, 'base64')
  }

  signMessageSync(message: string): string {
    const sign = crypto.createSign('sha512')
    sign.update(message)
    sign.end()
    return sign.sign(this.privateKey, 'base64')
  }
}
