import {AdminMiddleware} from "../middleware/adminMiddleware"
import express from "express"
import {UserController} from "../controller/userController"
import {AuthMiddleware} from "../middleware/authMiddleware"

export const apiRouter = express.Router()
apiRouter.use(AuthMiddleware)


apiRouter.post("/api/users", AdminMiddleware, UserController.register)
apiRouter.get("/api/users/current", UserController.get)
apiRouter.patch("/api/users/current", UserController.update)
apiRouter.delete("/api/users/current", UserController.logout)
apiRouter.delete("/api/users/:id", AdminMiddleware, UserController.delete)
apiRouter.get("/api/users", AdminMiddleware, UserController.getAll)
apiRouter.get("/api/users/:id", AdminMiddleware, UserController.getById)
apiRouter.patch("/api/users/:id", AdminMiddleware, UserController.updateById)
