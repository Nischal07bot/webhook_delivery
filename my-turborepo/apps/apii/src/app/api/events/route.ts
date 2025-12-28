import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@repo/db"
import { DeliveryStatus } from "@repo/db";
import { deliveryQueue } from "@repo/queue";
export async function POST(request: NextRequest){
        const body =await request.json();
        const idempotencykey=request.headers.get("idempotency-key");
        if(!idempotencykey)
        {
            return NextResponse.json(
                {error:"Idempotency key missing"},
                {status: 400}
            )
        }
        if(!body.type || !body.payload){
            return NextResponse.json(
                {error:"Invalid event"},
                {status: 400}
            )
        }
        console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
        const endpoints=await prisma.webhook.findMany({
            where:{
                projectId:body.projectId,
                isActive:true
            },
            select:{
                id:true,
            }
        })
    try {
        await prisma.project.upsert({
             where: { id: body.projectId },
             update: {},
             create: {
               id: body.projectId,
               name: "Auto-created project (dev)",
               apiKey: `key_${body.projectId}_${Date.now()}`
          } 
  });
        const event = await prisma.event.create({
            data:{
                projectId:body.projectId,
                type:body.type,
                payload:body.payload,
                idempotencyKey:idempotencykey
            }
        })
        //deliveries bn rhe hai 
        const curr_deliveries=await prisma.delivery.createMany({
            data:
                endpoints.map((endpoint:any) => ({
                    eventId: event.id,
                    webhookId: endpoint.id,
                    status: DeliveryStatus.PENDING,
                }))
        })
        const enqueuedeliveries =await prisma.delivery.findMany({
            where:{
                eventId:event.id
            }
        })
        for(const delivery of enqueuedeliveries)
        {
            await deliveryQueue.add(
                "deliver-webhook",
                {
                    deliveryId:delivery.id
                },
                {
                    jobId:delivery.id
                }
            );
        }
        //queueing logic here 
        return NextResponse.json({
            eventId:event.id,
            status:"stored",
            duplicate:false
        })
    } catch (error: any) {
        //existing event ki batcheet hori hai 
        if(error.code === "P2002")
        {
            const existingevent=await prisma.event.findUnique({
                where:{
                    projectId_idempotencyKey:{
                        projectId:body.projectId,
                        idempotencyKey:idempotencykey
                    }
                }
            })
            //ab deliveries ko dalna jo deliveries m nhi hai 
            const existingDeliveries=await prisma.delivery.findMany({
                where:{
                    eventId:existingevent?.id
                },
                select:{
                    webhookId:true
                }
            })
            const existingWebhookIds=new Set(existingDeliveries.map(d=>d.webhookId));//jo bhi existing hai 
            if (!existingevent?.id) {
                throw new Error("Existing event not found");
            }
            const newEndpoints=endpoints.filter((endpoint:any)=>!existingWebhookIds.has(endpoint.url)).map((
                endpoint:any
            )=>({
                eventId:existingevent.id,
                webhookId:endpoint.url,
                status:DeliveryStatus.PENDING,
                attempt:1
            }))
            if(newEndpoints.length>0)
            {
                const newDeliveries=await prisma.delivery.createMany({
                    data:newEndpoints
                })
                const enqueuedeliveriesduplicate=await prisma.delivery.findMany({
                    where:{
                        eventId:existingevent.id,
                        webhookId:{
                            in:newEndpoints.map((ep:any)=>ep.webhookId)
                        }
                    }
                })        
                for(const delivery of enqueuedeliveriesduplicate)
                {
                    await deliveryQueue.add(
                        "deliver-webhook",
                        {
                            deliveryId:delivery.id
                        },
                        {
                            jobId:delivery.id
                        }
                    );
                }        
            }
            return NextResponse.json({
                eventId:existingevent?.id,
                status:"stored",
                duplicate:true
            })
        }
        console.log("Error creating event:", error);
        throw error;
    }
}
