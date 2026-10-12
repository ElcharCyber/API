const redis = require('redis');

class CacheService {
  constructor() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = Number(process.env.REDIS_PORT) || 6379;
    const password = process.env.REDIS_PASSWORD || undefined;

    this._client = redis.createClient({
      socket: {
        host,
        port,
      },
      password,
    });

    this._client.on('error', (error) => {
      console.error('Redis Client Error:', error.message);
    });

    this._client.connect().catch((err) => {
      console.error('Could not connect to Redis:', err.message);
    });
  }

  async set(key, value, expirationInSeconds = 3600) {
    try {
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      await this._client.set(key, data, {
        EX: expirationInSeconds,
      });
    } catch (error) {
      console.error(`Failed to set cache for key ${key}:`, error.message);
    }
  }

  async get(key) {
    try {
      const result = await this._client.get(key);
      if (result === null) return null;
      try {
        return JSON.parse(result);
      } catch {
        return result;
      }
    } catch (error) {
      console.error(`Failed to get cache for key ${key}:`, error.message);
      return null;
    }
  }

  async delete(key) {
    try {
      await this._client.del(key);
    } catch (error) {
      console.error(`Failed to delete cache for key ${key}:`, error.message);
    }
  }

  async deleteByPattern(pattern) {
    try {
      const keys = await this._client.keys(pattern);
      if (keys.length > 0) {
        await this._client.del(keys);
      }
    } catch (error) {
      console.error(`Failed to delete cache pattern ${pattern}:`, error.message);
    }
  }
}

module.exports = CacheService;
