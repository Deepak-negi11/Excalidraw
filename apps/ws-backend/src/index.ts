import prisma from "@repo/db";
import { JWT_SECRET } from "@repo/secure";
import jwt, { JwtPayload } from "jsonwebtoken";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

function isJwtPayload(decoded: string | JwtPayload): decoded is JwtPayload {
    return typeof decoded === "object" && "id" in decoded;
}

wss.on("connection", async (ws , request) => {
    const url = request.url;
    if(!url){
        ws.close();
        return;
    }
    const params = new URLSearchParams(url.split("?")[1]);
    const token = params.get("token");
    if(!token){
        ws.close();
        return;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!isJwtPayload(decoded)) {
        ws.close();
        return;
    }
    const user = await prisma.user.findUnique({
        where: {
            id: decoded.id ,
        },
    });
    if(!user){
        ws.close();
        return;
    }
});



