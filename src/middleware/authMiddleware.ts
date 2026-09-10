import { Response, NextFunction} from 'express'
import {prismaClient} from "../application/db"
import {UserRequest} from "../type/userRequest"

export const AuthMiddleware = async (req: UserRequest, res: Response, next: NextFunction) => {

    const token = req.get('x-API-TOKEN')

    if(token){
        const user = await prismaClient.user.findFirst({
            where: {
                token: token
            }
        })
        if(user){
        req.user = user
        next()
        return
        }
    }

    res.status(401).json({
        errors: "unauthorized"
    }).end()
}