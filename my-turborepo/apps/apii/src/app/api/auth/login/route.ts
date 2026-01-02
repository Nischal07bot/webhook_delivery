import { NextResponse,NextRequest } from "next/server"


export async function POST(request: NextRequest){
    const {email,password} = await request.json()

    
}