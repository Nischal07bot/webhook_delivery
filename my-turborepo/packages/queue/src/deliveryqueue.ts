import { Queue } from 'bullmq';
import { createRedisConnection } from './connection';

export const deliveryQueue = new Queue('deliveryQueue',{
    connection: createRedisConnection,
    defaultJobOptions: {
    attempts: 5,
    backoff: {//these default jobs sugg by ai not written by me
      type: "exponential",
      delay: 5_000
    },
    removeOnComplete: true,
    removeOnFail: false
}
});

