import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'
import { Keys } from 'src/auth/types'

@Injectable()
export class CryptoService {
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
}
