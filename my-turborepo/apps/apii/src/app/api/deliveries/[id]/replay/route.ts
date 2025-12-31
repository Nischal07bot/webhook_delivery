import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@repo/db";
import { DeliveryStatus } from "@repo/db";
import { deliveryQueue } from "@repo/queue";
import { reqproject } from "@repo/auth";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: deliveryId } = await params;
    const project=await reqproject(request);
    if(!deliveryId){
        return NextResponse.json(
            {error:"Delivery ID missing"},
            {status:400}
        )
    }
    const delivery=await prisma.delivery.findUnique({
        where:{
            id:deliveryId
        },
        include:{
            event:true,
        }
    })
    if(!delivery || delivery.event.projectId !== project.id){
        return NextResponse.json(
            {error:"Delivery not found"},
            {status:404}
        )
    }
    if(delivery.status!=="DEAD"){
        return NextResponse.json(
            {error:"Only DEAD deliveries can be replayed"},
            {status:400}
        )
    }
    await prisma.delivery.update({
        where:{
            id:delivery.id
        },
        data:{
            status:DeliveryStatus.PENDING,
            attempt:1,
            error:null
        }
    })
    await deliveryQueue.add(
        "deliver-webhook",
        {
            deliveryId:delivery.id
        });
    return NextResponse.json({message:"Delivery replayed",deliveryId},{status:200});
}