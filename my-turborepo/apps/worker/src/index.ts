//here the worker will the process the jobs from the queue and deliver the webhooks
import { Worker } from "bullmq";
import { createRedisConnection } from "@repo/queue";
import { prisma } from "@repo/db";
import fetch from "node-fetch";


