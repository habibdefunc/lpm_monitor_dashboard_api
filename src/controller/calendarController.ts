import {Request, Response, NextFunction} from "express"
import {UserRequest} from "../type/userRequest"
import {CalendarService} from "../service/calendarService"

export class CalendarController {
    static async get(req: UserRequest, res: Response, next: NextFunction){
        try{
            const response = await CalendarService.get(req.user!, req.query)
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }
}
