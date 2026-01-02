import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@repo/db"
import { hashPassword } from "@/src/lib/encodedec";
import { cookies } from "next/headers";
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

    const hashedpassword= await hashPassword(password);
    const newUser =await prisma.user.create({
        data:{
            email:email,
            password:hashedpassword,

        }
    })

    const session=await prisma.session.create({
        data:{
            userId:newUser.id,
            expiresAt:new Date(Date.now()+ 1000 * 60 * 60 * 24 * 30)
        }
    })
    const response = NextResponse.json({ message: "Signup successful" });
    response.cookies.set("session", String(session.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    });
    return response;
}
