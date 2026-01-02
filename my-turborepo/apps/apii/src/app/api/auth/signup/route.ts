import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@repo/db"

export async function POST(request: NextRequest){
    const {email,password} =await request.json();

    if(!email || !password){
        return NextResponse.json({
            message:"Email and password are required",
        },
        {status:400}
        );
    }
    const existingUser =await prisma.user.findUnique({
        where:{email}
    })
    if(existingUser){
        return NextResponse.json({
            message:"User already exists"
        },
        {status:400}
        );
    }

    const newUser =await prisma.user.create({
        data:{
            email:email,
            password:password,

        }
    })

    
    
}
