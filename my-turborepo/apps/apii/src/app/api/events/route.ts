import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@repo/db"

export async function POST(request: NextRequest){
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/249e0665-9738-434b-a0fc-21864dee3f55',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:5',message:'POST /api/events called',data:{hasPrisma:!!prisma},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v3',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    try {
        const body =await request.json();

        if(!body.type || !body.payload){
            return NextResponse.json(
                {error:"Invalid event"},
                {status: 400}
            )
        }
        console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/249e0665-9738-434b-a0fc-21864dee3f55',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:18',message:'Before prisma.event.create',data:{hasPrisma:!!prisma,bodyType:body.type},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v3',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        const event = await prisma.event.create({
            data:{
                projectId:body.projectId,
                type:body.type,
                payload:body.payload,
                idempotencyKey:body.idempotencyKey
            }
        })
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/249e0665-9738-434b-a0fc-21864dee3f55',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:29',message:'Event created successfully',data:{eventId:event.id},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v3',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        //queueing logic here 
        return NextResponse.json({
            eventId:event.id,
            status:"stored"
        })
    } catch (error: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/249e0665-9738-434b-a0fc-21864dee3f55',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:37',message:'Error in POST handler',data:{errorName:error?.name,errorMessage:error?.message?.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v3',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        throw error;
    }
}