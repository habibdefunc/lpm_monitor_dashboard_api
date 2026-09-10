import { Prisma } from "@prisma/client"
import { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import {ResponseError} from "../error/responseError"

export const errorMiddleware = async(error: Error, req: Request, res: Response, next: NextFunction) => {

    if(error instanceof ZodError){
        res.status(400).json({
            errors: `Validation Error : ${JSON.stringify(error)}`
        });
    } else if(error instanceof ResponseError){
        res.status(error.status).json({
            errors: error.message
        })
    } else if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"){
        res.status(409).json({errors: "Username or email already exists"})
    } else if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"){
        res.status(404).json({errors: "User not found"})
    } else{
        res.status(500).json({
            errors: "Internal server error"
        })
    }
    

}
