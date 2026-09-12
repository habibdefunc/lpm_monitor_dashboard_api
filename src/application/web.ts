import { publicRouter } from './../routes/publicApi';
import { apiRouter } from './../routes/api';
import express from 'express';
import { errorMiddleware } from '../middleware/errorMiddleware';
import cors from "cors"

export const web = express()

web.use(cors({
    origin: [
        "http://localhost:5173",
        "https://lpm-monitor-dashboard-web.vercel.app"
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-API-TOKEN"],
    exposedHeaders: ["Content-Disposition"]
}))

web.use(express.json())
web.use(publicRouter)
web.use(apiRouter)
web.use(errorMiddleware)