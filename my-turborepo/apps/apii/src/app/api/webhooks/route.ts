import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { DeliveryStatus } from "@repo/db"
import crypto from "crypto"
import { reqproject } from "@repo/auth";

export async function POST(request: NextRequest){
        const body =await request.json();
        const project=await reqproject(request);
        if (!body.url) 
        {
            return NextResponse.json(
            { error: "projectId and url required" },
            { status: 400 }
            );
        }
        const secret="whsec_"+crypto.randomBytes(24).toString("hex");
        const webhook=await prisma.webhook.create({
            data:{
                projectId:project.id,
                url:body.url,
                secret:secret,
                isActive:true
            }
        });
        return NextResponse.json({
            id:webhook.id,
            url:webhook.url,
            secret:webhook.secret
        })
}

export async function GET(request: NextRequest){
    const project=await reqproject(request);
    const projectId=project.id;
    if(!projectId){
        return NextResponse.json(
            {
                error:"projectId query param missing"
            },{
                status:400
            }
        )
    }
    const webhooks=await prisma.webhook.findMany({
        where:{
            projectId:projectId
        }
    })
    return NextResponse.json(webhooks)
}