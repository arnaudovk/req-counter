import { Injectable, Logger } from '@nestjs/common';
import { Redis, RedisOptions } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisService.name);

  private options = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    prefix: process.env.REDIS_PREFIX || 'app-development',
    timeout: parseInt(process.env.REDIS_TIMEOUT, 10) || 5000,
  };

  constructor() {
    // Connect to Redis instance (you can replace these with your environment variables)

    const redisPassword = process.env.REDIS_PASSWORD
      ? { password: process.env.REDIS_PASSWORD }
      : {};

    this.redis = new Redis({
      host: this.options.host || 'localhost', // Default Redis host
      port: this.options.port || 6379, // Default Redis port
      ...redisPassword,
    });
  }

  // Increment the counter for a specific endpoint
  async incrementRequestCount(endpoint: string): Promise<void> {
    try {
      await this.redis.incr(`requestCount:${endpoint}`);
      this.logger.log(`Incremented request count for ${endpoint}`);
    } catch (error) {
      this.logger.error(`Failed to increment request count for ${endpoint}`);
    }
  }

  // Get the current counter for a specific endpoint
  async getRequestCount(endpoint: string): Promise<number> {
    try {
      const count = await this.redis.get(`requestCount:${endpoint}`);
      return count ? parseInt(count, 10) : 0; // Return 0 if no count is found
    } catch (error) {
      this.logger.error(`Failed to get request count for ${endpoint}`);
      return 0; // Default to 0 if there's an error
    }
  }

  async getAllRequestCounts(): Promise<{
    result: { [key: string]: number };
    totalRequests: number;
  }> {
    try {
      const keys = await this.redis.keys('requestCount:*');
      const counts = await this.redis.mget(...keys);
      const result: { [key: string]: number } = {};

      let totalRequests = 0;
      keys.forEach((key, index) => {
        const endpoint = key.replace('requestCount:', '');
        result[endpoint] = counts[index] ? parseInt(counts[index], 10) : 0;
        totalRequests += result[endpoint];
      });

      return { result, totalRequests };
    } catch (error) {
      this.logger.error('Failed to get all request counts');
    }
  }
}
