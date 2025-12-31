//here the worker will the process the jobs from the queue and deliver the webhooks
import "dotenv/config";
import { Worker } from "bullmq";
import { createRedisConnection } from "@repo/queue";
import { prisma } from "@repo/db";
import fetch from "node-fetch";
import { DeliveryStatus } from "@repo/db";
import { generatesignature } from "./signature"
import { uploadDeliveryLog } from "@repo/infra";
console.log("Worker started...");


const worker = new Worker('deliveryQueue', async(job)=>{
    const start=Date.now();
    console.log("Processing job:", job.id);
    let responseStatus: number | null = null;
    let responseBody: string | null = null;
    let errorMessage: string | null = null;
    let success = false;
    const { deliveryId } = job.data;
    const delivery = await prisma.delivery.findUnique({
        where:{
            id: deliveryId
        },
        include:{
            event:true,
            webhook:true
        }
    })
    
    if(!delivery){
        throw new Error("Delivery not found");
    }
    //try block
    const projectId=delivery.event.projectId;
    try{
        const secret=delivery.webhook.secret;
        const payload=JSON.stringify(delivery.event.payload);
        const {timestamp,signature}=generatesignature(payload,secret);
        const response = await fetch(delivery.webhook.url,{
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "X-Event-Type": delivery.event.type,
            "X-Signature": `t=${timestamp},v1=${signature}`
            },
            body: JSON.stringify(delivery.event.payload)
        });
        
        responseStatus = response.status;
        responseBody = await response.text();
        success = response.ok;

        if(!response.ok){
            throw new Error(`Failed with status ${response.status}`);
        }
    }
    //catch block
    catch(error:any){
        errorMessage=error.message;
    }
    const latency=Date.now()-start;


    const s3Key = await uploadDeliveryLog({
        projectId: projectId,
        eventId: delivery.eventId,
        deliveryId: delivery.id,
        attempt: delivery.attempt,
        payload: {
            request: {
                url: delivery.webhook.url,
                headers: {
                    "Content-Type": "application/json",
                    "X-Event-Type": delivery.event.type,
                    "X-Signature": "redacted" // NEVER store raw secret
                },
                body: delivery.event.payload
            },
            response: {
                status: responseStatus,
                body: responseBody,
                error: errorMessage
            },
            latency,
            timestamp: new Date().toISOString()
        }
    });
    await prisma.deliveryAttempt.create({
        data: {
            deliveryId: delivery.id,
            attempt: delivery.attempt,
            status: success ? "SUCCESS" : "FAILED",
            s3ObjectKey: s3Key,
            latencyMs:latency
        }
    });

    const isLastAttempt = job.attemptsMade + 1 >= job.opts.attempts!;

    await prisma.delivery.update({
        where: { id: delivery.id },
        data: {
            status: success
                ? DeliveryStatus.SUCCESS
                : isLastAttempt
                    ? DeliveryStatus.DEAD
                    : DeliveryStatus.PENDING,
            attempt: job.attemptsMade + 1,
            responseCode: responseStatus,
            error: errorMessage
        }
    });

    if(!success)
    {
        throw new Error(errorMessage ?? "Webhook delivery failed" )
    }

   },
   {
    connection: createRedisConnection
   }

);
worker.on('completed',(job)=>{
    console.log('Job completed:',job.id);
})
worker.on('failed',(job,err)=>{
    console.log(`Job failed: ${job?.id}, error: ${err.message}`);
});