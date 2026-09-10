import { publicRouter } from './../routes/publicApi';
import { apiRouter } from './../routes/api';
import express from 'express';
import { errorMiddleware } from '../middleware/errorMiddleware';

export const web = express()

web.use(express.json())
web.use(publicRouter)
web.use(apiRouter)
web.use(errorMiddleware)