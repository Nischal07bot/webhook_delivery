import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@repo/db";
import { DeliveryStatus } from "@repo/db";
import { reqproject } from "@repo/auth";

export async function POST(request: NextRequest){
    const body=await request.json();
    const project=await reqproject(request);
    const deaddeliveries=await prisma.delivery.findMany({
        where:{
            status:DeliveryStatus.DEAD,
            event:{
                projectId:project.id
            }
        },
        include:{
            event:true,
            webhook:true,
        },
        orderBy:{
            createdAt:"desc"
        }
    });
    return NextResponse.json({deaddeliveries});
}
