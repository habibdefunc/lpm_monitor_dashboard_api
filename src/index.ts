import { web } from "./application/web";
import { logger } from "./application/logging";

const port = 3000;

if (process.env.NODE_ENV !== "production") {
  web.listen(port, () => {
    logger.info(`Listening on port ${port}`);
  });
}

export default web;