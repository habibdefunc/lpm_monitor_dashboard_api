import { Response, NextFunction } from "express"
import { UserRequest } from "../type/userRequest"

export const AdminMiddleware = (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "ADMIN") {
        res.status(403).json({
            errors: "Only ADMIN can access this resource"
        })
        return
    }
    next()
}
