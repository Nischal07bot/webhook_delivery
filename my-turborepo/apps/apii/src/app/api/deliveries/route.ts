import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@repo/db";
import { DeliveryStatus } from "@repo/db";
import { reqproject } from "@repo/auth";

export async function GET(request: NextRequest){
    try {
        const project=await reqproject(request);
        const status = request.nextUrl.searchParams.get("status");
        
        const where: any = {
            event: {
                projectId: project.id
            }
        };
        
        if (status && Object.values(DeliveryStatus).includes(status as DeliveryStatus)) {
            where.status = status as DeliveryStatus;
        }
        
        const deliveries=await prisma.delivery.findMany({
            where,
            include:{
                event:true,
                webhook:true,
            },
            orderBy:{
                createdAt:"desc"
            },
            take: 100 // Limit to 100 most recent
        });
        return NextResponse.json({deliveries});
    } catch (error: any) {
        return NextResponse.json(
            {error: error.message || "Unauthorized"},
            {status: 401}
        );
    }
}

