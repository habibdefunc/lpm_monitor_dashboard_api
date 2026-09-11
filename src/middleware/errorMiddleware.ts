import { Prisma } from "@prisma/client"
import { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import {ResponseError} from "../error/responseError"
import multer from "multer"

export const errorMiddleware = async(error: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        next(error)
        return
    }

    if(error instanceof ZodError){
        res.status(400).json({
            errors: `Validation Error : ${JSON.stringify(error)}`
        });
    } else if(error instanceof ResponseError){
        res.status(error.status).json({
            errors: error.message
        })
    } else if(error instanceof multer.MulterError){
        if (error.code === "LIMIT_FILE_SIZE") {
            res.status(413).json({errors: "Maximum file size is 10 MiB"})
            return
        }
        res.status(400).json({errors: "Invalid upload request"})
    } else if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"){
        res.status(409).json({errors: "Unique value already exists"})
    } else if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"){
        res.status(404).json({errors: "Requested record not found"})
    } else if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003"){
        res.status(req.method === "DELETE" ? 409 : 400).json({
            errors: "Related record is invalid or still in use"
        })
    } else{
        res.status(500).json({
            errors: "Internal server error"
        })
    }
    

}
