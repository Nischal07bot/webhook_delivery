import { NextRequest,NextResponse } from "next/server";

export async function POST(request: NextRequest){
    const body =await request.json();

    if(!body.type || !body.payload){
        return NextResponse.json(
            {error:"Invalid event"},
            {status: 400}
        )
    }
    return NextResponse.json({
        status:"accepted",
        eventtype:body.type
    });
}