import {AdminMiddleware} from "../middleware/adminMiddleware"
import express from "express"
import {UserController} from "../controller/userController"
import {AuthMiddleware} from "../middleware/authMiddleware"
import {CategoryController} from "../controller/categoryController"
import {ActivityController} from "../controller/activityController"
import {DocumentationController} from "../controller/documentationController"
import {DashboardController} from "../controller/dashboardController"
import {CalendarController} from "../controller/calendarController"
import {ActivityUploadAccess, UploadMiddleware} from "../middleware/uploadMiddleware"

export const apiRouter = express.Router()
apiRouter.use(AuthMiddleware)


apiRouter.post("/api/users", AdminMiddleware, UserController.register)
apiRouter.get("/api/users/current", UserController.get)
apiRouter.patch("/api/users/current", UserController.update)
apiRouter.delete("/api/users/current", UserController.logout)
apiRouter.delete("/api/users/:id", AdminMiddleware, UserController.delete)
apiRouter.get("/api/users/:id/deletion-preview", AdminMiddleware, UserController.deletePreview)
apiRouter.get("/api/users", AdminMiddleware, UserController.getAll)
apiRouter.get("/api/users/:id", AdminMiddleware, UserController.getById)
apiRouter.patch("/api/users/:id", AdminMiddleware, UserController.updateById)

// CATEGORY API
apiRouter.post("/api/categories", AdminMiddleware, CategoryController.create)
apiRouter.get("/api/categories/current", CategoryController.getAll)
apiRouter.get("/api/categories/current/:id", CategoryController.get)
apiRouter.patch("/api/categories/current/:id", AdminMiddleware, CategoryController.update)
apiRouter.delete("/api/categories/current/:id", AdminMiddleware, CategoryController.delete)

// ACTIVITY API
apiRouter.post("/api/activities", ActivityController.create)
apiRouter.get("/api/activities/current", ActivityController.getAll)
apiRouter.get("/api/activities/current/:id", ActivityController.get)
apiRouter.patch("/api/activities/current/:id", ActivityController.update)
apiRouter.patch("/api/activities/current/:id/status", ActivityController.updateStatus)
apiRouter.delete("/api/activities/current/:id", ActivityController.delete)

// DOCUMENTATION API
apiRouter.post("/api/activities/:activity_id/documentations", ActivityUploadAccess, UploadMiddleware, DocumentationController.upload)
apiRouter.get("/api/activities/:activity_id/documentations", DocumentationController.getAll)
apiRouter.get("/api/activities/:activity_id/documentations/:id", DocumentationController.get)
apiRouter.get("/api/activities/:activity_id/documentations/:id/download", DocumentationController.download)
apiRouter.delete("/api/activities/:activity_id/documentations/:id", DocumentationController.delete)

// DASHBOARD AND CALENDAR API
apiRouter.get("/api/dashboard", DashboardController.get)
apiRouter.get("/api/calendar", CalendarController.get)
