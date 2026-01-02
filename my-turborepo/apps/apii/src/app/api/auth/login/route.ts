import { NextResponse,NextRequest } from "next/server"
import { prisma } from "@repo/db"
import { comparePasword } from "@/src/lib/encodedec"

export async function POST(request: NextRequest){
    const {email,password} = await request.json()
    if(!email || !password){
        return NextResponse.json({
            message:"Email and password are required"
        },
        {status:400}
        );
    }

    const userexists=await prisma.user.findUnique({
        where:{email}
    })
    if(!userexists){
        return NextResponse.json({
            message:"Invalid credentials"
        })

    }

    const isPasswordValid= await comparePasword(password,userexists.password);
    if(!isPasswordValid){
        return NextResponse.json({
            message:"Invalid password"
        })
    }
    const session=await prisma.session.create({
        data:{
            userId:userexists.id,
            expiresAt:new Date(Date.now()+ 1000 * 60 * 60 * 24 * 30)
        }
    })
    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("session", String(session.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    });
    return response;
}