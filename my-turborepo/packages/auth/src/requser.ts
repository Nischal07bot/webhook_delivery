import { prisma } from "@repo/db";
import { cookies } from "next/headers";
export async function requser(request: Request){
    const sessionid=(await cookies()).get("session")?.value;
    if(!sessionid){
        throw new Error("Unauthorized: No session cookie found");
    }
    const session=await prisma.session.findUnique({
        where:{id:sessionid},
        include:{user:true}
    })
    const currdate=new Date();
    if(!session || session.expiresAt < currdate){
        throw new Error("Unauthorized: Invalid or expired session");
    }
    return session.user;
}
