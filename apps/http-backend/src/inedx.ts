import prisma from "@repo/db";
import { hashPassword, signupSchema } from "@repo/secure";
import express, { Request, Response } from "express";
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

app.post("/signin",(req , res)=>{
    res.send("Hello World");
})

app.get("/",(req , res )=>{
    res.send("Hello World");
})

app.listen(3000, () => {
    console.log("Server is running on Port 3000");
});
