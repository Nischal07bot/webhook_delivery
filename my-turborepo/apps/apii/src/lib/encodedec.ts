import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string>{
    const salt=10;
    const hashpassword= await bcrypt.hash(password,salt);
    return hashpassword;
}

export async function comparePasword(password:string,hashedPassword:string):Promise<boolean>{
    return await bcrypt.compare(password,hashedPassword);
}