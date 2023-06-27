import express, { Request, Response } from 'express';
import cors from 'cors';
import { db } from './database/knex';
import { User, UserDB } from './types';

const app = express();
app.use(express.json());
app.use(cors());

app.listen(3003,()=>{
    console.log("server rodando na porta 3003");
    
});

app.get("/users", async (req: Request, res:Response)=>{
    try {
        const userData: UserDB[] = await db("users")
const response: User[] = userData.map((user)=>{
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        createdAt: user.created_at
    }
})

        res.status(200).send(response)
        
    } catch (error:any) {
        res.status(400).send(error.message)
    }
})