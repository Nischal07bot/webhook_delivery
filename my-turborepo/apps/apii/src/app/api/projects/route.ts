import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@repo/db" 
import crypto from "crypto";

export async function POST(request: NextRequest){
    const body=await request.json();
    
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
            apiKey:api_key
        }
    })
    return NextResponse.json({
        id:project.id,
        name:project.name,
        apiKey:project.apiKey
    })
}