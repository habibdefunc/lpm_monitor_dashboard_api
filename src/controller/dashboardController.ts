import {Request, Response, NextFunction} from "express"
import {UserRequest} from "../type/userRequest"
import {DashboardService} from "../service/dashboardService"

export class DashboardController {
    static async get(req: UserRequest, res: Response, next: NextFunction){
        try{
            const response = await DashboardService.get(req.user!, req.query)
            res.status(200).json({data: response})
        }
        catch (e){
            next(e)
        }
    }
}
