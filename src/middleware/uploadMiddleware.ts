import multer from "multer"
import {Response, NextFunction} from "express"
import {UserRequest} from "../type/userRequest"
import {ActivityAccess} from "../service/activityAccess"

export const ActivityUploadAccess = async (req: UserRequest, res: Response, next: NextFunction) => {
    try{
        await ActivityAccess.get(req.user!, Number(req.params.activity_id))
        next()
    }
    catch (e){
        next(e)
    }
}

export const UploadMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
        fields: 0
    }
}).single("file")
