import { StandardCheckoutClient, Env } from 'pg-sdk-node'

function getEnv(): Env {
  return process.env.PHONEPE_ENV === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX
}

let _client: StandardCheckoutClient | null = null

export function getPhonePeClient(): StandardCheckoutClient {
  if (_client) return _client

  const clientId = process.env.PHONEPE_CLIENT_ID
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET
  const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION ?? '1', 10)

  if (!clientId || !clientSecret) {
    throw new Error('PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET must be set')
  }

  _client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, getEnv())
  return _client
}
