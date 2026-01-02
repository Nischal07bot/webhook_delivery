import { NextRequest,NextResponse } from 'next/server';
import { prisma } from "@repo/db";
import { cookies } from "next/headers";
export async function POST(request: NextRequest){
    const sessionid=(await cookies()).get("session")?.value;
    if(!sessionid){
        return NextResponse.json({
            message:"No session cookie found"
        },
        {status:401}
        );
    }
    await prisma.session.deleteMany({
        where:{id:sessionid}
    })
    const response= NextResponse.json({message:"Logout successful",ok:true});
    response.cookies.delete("session");
    return response;
}