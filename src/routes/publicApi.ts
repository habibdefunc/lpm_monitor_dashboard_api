import express from "express"
import {UserController} from "../controller/userController"

export const publicRouter = express.Router()

publicRouter.post("/api/users/login", UserController.login)
