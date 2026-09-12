import { Response, NextFunction } from 'express'
import { prismaClient } from "../application/db"
import { UserRequest } from "../type/userRequest"

export const AuthMiddleware = async (req: UserRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.get('X-API-TOKEN')
        if (!token) {
            res.status(401).json({ errors: "unauthorized" }).end()
            return
        }

        const user = await prismaClient.user.findFirst({
            where: { token: token }
        })

        if (!user) {
            res.status(401).json({ errors: "unauthorized" }).end()
            return
        }

        if (user.role !== "ADMIN" && user.role !== "STAF") {
            res.status(403).json({ errors: "Role must be ADMIN or STAF" }).end()
            return
        }

        req.user = user
        next()
    } catch (error) {
        next(error)
    }
}
