import prisma from "@repo/db";
import { JWT_SECRET } from "@repo/secure";
import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

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
    if(!decoded){
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



