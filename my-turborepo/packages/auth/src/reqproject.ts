import { prisma } from "@repo/db";

export async function reqproject(request: Request){ 
    const body=request.headers.get("authorization");

    if(!body || !body.startsWith("Bearer ")){
        throw new Error("Unauthorized: Missing or invalid authorization header");
    }
    const apiKey=body.split(" ")[1];

    const project=await prisma.project.findUnique({
        where:{
            apiKey:apiKey
        }
    })
    if(!project){
        throw new Error("Unauthorized: Invalid API key");
    }
    return project;
}