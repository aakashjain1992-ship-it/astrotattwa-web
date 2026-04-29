import Redis from 'ioredis'

let _redis: Redis | null = null

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: false,
    })
    _redis.on('error', (err) => {
      console.error('[Redis] error:', err.message)
    })
  }
  return _redis
}
