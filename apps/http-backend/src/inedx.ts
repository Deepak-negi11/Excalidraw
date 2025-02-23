import prisma from "@repo/db";
import { hashPassword, JWT_SECRET, RoomSchema, signinSchema, signupSchema } from "@repo/secure";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";

// Extend the Request interface to include UserId
declare module "express-serve-static-core" {
    interface Request {
        UserId?: string; // Use the appropriate type for UserId
    }
}

const app = express();
app.use(express.json());

app.post("/signup", async (req:Request, res:Response) => {
   try{
    const body = signupSchema.parse(req.body);
    if(!body){
        res.json({message: "Invalid Request"});
    }
    const {email , password , username} = body;
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({     
        data: {
            email,
            password: hashedPassword,
            username
        }   
    });
    if(!user){
        res.json({message: "User Creation Failed"});
    }
    res.json({message: "User Created Successfully"});
   }catch(error){
    res.json({message: "Internal Server Error"});
   }
});

app.post("/signin", async (req:Request, res:Response) =>{
    try{
        const body = signinSchema.parse(req.body);
        if(!body){
                res.status(400).json({
                message:"Invaid data"
            })
        }
        const{email , password} = body
        const User = await prisma.user.findUnique({where:{email} })
        if(!User){
            res.status(401).json({
                message:"Can't find the User"
            })
            return ;
        }

        const token = jwt.sign({
            userId :User.id 
        },JWT_SECRET)
    }catch(error){
        res.status(500).json({
            message:"Server crashed "     
        })
    }
    
})

app.post("/room", authMiddleware, async (req: Request, res: Response) => {
    const data = RoomSchema.parse(req.body);

    if (!data) {
        return res.json({ message: "incorrect inputs" });
    }

    const userId = req.UserId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    await prisma.room.create({
        data: {
            slug: data.slug,
            name: data.name,
            adminId: userId,
        },
    });

    res.json({ message: "Room created successfully" });
});

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on Port 3000 ${PORT}`);
});
