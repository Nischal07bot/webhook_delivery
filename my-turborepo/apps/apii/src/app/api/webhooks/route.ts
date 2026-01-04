import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { DeliveryStatus } from "@repo/db"
import crypto from "crypto"
import { reqproject } from "@repo/auth";
import { requser } from "@repo/auth";

export async function POST(request: NextRequest){
        const body =await request.json();
        const user = await requser(request);
        const projectId=body.projectId;
        if(!user){
            return NextResponse.json({
                error:"Unauthorized"
            },
            {status:401}
            );
        }
        if(!projectId){
            return NextResponse.json({
                error:"projectId required"
            })
        }
        const exists=await prisma.project.findFirst({
            where:{
                id:projectId,
                userId:user.id
            }
        })
        if(!exists){
            return NextResponse.json(
                {error:"Project not found"},
                {status:404}
            )
        }
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
                projectId:projectId,
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
    const user= await requser(request);
    if(!user){
        return NextResponse.json(
            {error:"Unauthorized"},
            {status:401}
        )
    }
    const projectId = request.nextUrl.searchParams.get("projectId");
    if(!projectId){
        return NextResponse.json(
            {
                error:"projectId query param missing"
            },{
                status:400
            }
        )
    }
    const project=await prisma.project.findFirst({
        where:{
            id:projectId,
            userId:user.id
        }
    })
    const webhooks=await prisma.webhook.findMany({
        where:{
            projectId:projectId
        }
    })
    return NextResponse.json(webhooks)
}