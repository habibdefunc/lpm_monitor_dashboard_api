import express from "express";
import { web } from "./src/application/web";

const app = express();

app.use(web);

export default app;