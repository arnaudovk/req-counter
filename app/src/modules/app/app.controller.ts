import { Controller, Get, Param, Post } from '@nestjs/common';
import { RedisService } from '../redis';

@Controller()
export class AppController {
  constructor(private readonly redisService: RedisService) {}

  // PUT request to increment the count for a specific endpoint
  @Post('*')
  async incrementCount(
    @Param() params: { path: string[] },
  ): Promise<{ message: string }> {
    const endpoint = params.path ? params.path[0] : '/';
    await this.redisService.incrementRequestCount(endpoint);
    return { message: `Request count for ${endpoint} incremented.` };
  }

  @Get('/')
  async getAllCounts() {
    const allCounts = await this.redisService.getAllRequestCounts();
    return { total: allCounts.totalRequests, allCounts: allCounts.result };
  }

  @Get('/ping')
  Ping() {
    return 'Pong';
  }

  @Get(':endpoint')
  async getCount(@Param('endpoint') endpoint: string) {
    const count = await this.redisService.getRequestCount(endpoint);
    return { count };
  }
}
