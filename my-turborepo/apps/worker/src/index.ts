//here the worker will the process the jobs from the queue and deliver the webhooks
import "dotenv/config";
import { Worker } from "bullmq";
import { createRedisConnection } from "@repo/queue";
import { prisma } from "@repo/db";
import fetch from "node-fetch";
import { DeliveryStatus } from "@repo/db";
import { generatesignature } from "./signature"
console.log("Worker started...");


const worker = new Worker('deliveryQueue', async(job)=>{
    console.log("Processing job:", job.id);
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
        await prisma.delivery.update({
            where:{
                id: delivery.id
            },
            data:{
                status: response.ok ? DeliveryStatus.SUCCESS : DeliveryStatus.FAILED,
                responseCode: response.status,
            }
        })
        if(!response.ok){
            throw new Error(`Failed with status ${response.status}`);
        }
    }
    catch(error:any){
        const islastattempt=job.attemptsMade+1 >= job.opts.attempts!;
        await prisma.delivery.update({
            where:{
                id: delivery.id
            },
            data:{
                status: islastattempt? DeliveryStatus.DEAD : DeliveryStatus.PENDING,
                attempt: job.attemptsMade+1,
                error: error.message,
            }
        });
        throw error;
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