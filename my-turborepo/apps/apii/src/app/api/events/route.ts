import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@repo/db"

export async function POST(request: NextRequest){
    const body =await request.json();
        const idempotencykey=request.headers.get("idempotency-key");
        if(!idempotencykey)
        {
            return NextResponse.json(
                {error:"Idempotency key missing"},
                {status: 400}
            )
        }
        if(!body.type || !body.payload){
            return NextResponse.json(
                {error:"Invalid event"},
                {status: 400}
            )
        }
        console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    try {
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
                idempotencyKey:idempotencykey
            }
        })
        //queueing logic here 
        return NextResponse.json({
            eventId:event.id,
            status:"stored",
            duplicate:false
        })
    } catch (error: any) {
        if(error.code === "P2002")
        {
            const existingevent=await prisma.event.findUnique({
                where:{
                    projectId_idempotencyKey:{
                        projectId:body.projectId,
                        idempotencyKey:idempotencykey
                    }
                }
            })
            return NextResponse.json({
                eventId:existingevent?.id,
                status:"stored",
                duplicate:true
            })
        }
        console.log("Error creating event:", error);
        throw error;
    }
}