import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@repo/db" 
import crypto from "crypto";
import { requser } from "@repo/auth";
export async function POST(request: NextRequest){
    const body=await request.json();
    const user= await requser(request);
    if(!user){
        return NextResponse.json(
            {error:"Unauthorized"},
            {status:401}
        )
    }
    if(!body.name){
        return NextResponse.json(
            {error:"Project name missing"},
            {status:400}
        )
    }
    const api_key="sk_"+crypto.randomBytes(24).toString("hex");
    const project=await prisma.project.create({
        data:{
            name:body.name,
            apiKey:api_key,
            userId:user.id
        }
    })
    return NextResponse.json({
        id:project.id,
        name:project.name,
        apiKey:project.apiKey
    })
}