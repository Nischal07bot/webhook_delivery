import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@repo/db"

export async function POST(request: NextRequest){
    try {
        const body =await request.json();

        if(!body.type || !body.payload){
            return NextResponse.json(
                {error:"Invalid event"},
                {status: 400}
            )
        }
        console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
        await prisma.project.upsert({
             where: { id: body.projectId },
             update: {},
             create: {
               id: body.projectId,
               name: "Auto-created project (dev)",
               apiKey: `key_${body.projectId}_${Date.now()}`
          } 
  });
        const event = await prisma.event.create({
            data:{
                projectId:body.projectId,
                type:body.type,
                payload:body.payload,
                idempotencyKey:body.idempotencyKey
            }
        })
        //queueing logic here 
        return NextResponse.json({
            eventId:event.id,
            status:"stored"
        })
    } catch (error: any) {
        
        throw error;
    }
}