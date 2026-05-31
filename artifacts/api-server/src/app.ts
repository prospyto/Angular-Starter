import express, { type Express } from "express";
import cors from "cors";
import type { IncomingMessage, ServerResponse } from "http";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
app.use(
  (pinoHttp as unknown as (opts: object) => (req: IncomingMessage, res: ServerResponse, next: () => void) => void)({
    logger,
    serializers: {
      req(req: IncomingMessage & { id?: unknown; url?: string; method?: string }) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: ServerResponse) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);
export default app;
