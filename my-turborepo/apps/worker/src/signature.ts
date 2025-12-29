import crypto from "crypto";

export function generatesignature(payload: string, secret: string): {timestamp: number, signature: string} {
    const timestamp=Math.floor(Date.now()/1000);
    const newpayload=`${timestamp}.${payload}`;
    const hmacsignature=crypto.createHmac("sha256",secret).update(newpayload).digest("hex");
    return{
        timestamp,
        signature:hmacsignature
    }
}