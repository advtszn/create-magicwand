import pino from "pino";
import pinoHttp, { type HttpLogger } from "pino-http";
import { Service } from "typedi";

@Service()
export class Logger {
  private logParent!: pino.Logger;
  private generalLog!: pino.Logger;
  private httpLog!: HttpLogger;

  async init() {
    this.logParent = pino({
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    });
    this.generalLog = this.logParent.child({ type: "general" });
    this.httpLog = pinoHttp({
      logger: this.logParent.child({ type: "http" }),
      genReqId: (req, res) => {
        const requestId = (req as any).requestId;
        res.setHeader("X-Request-Id", requestId);
        return requestId;
      },
    });
  }

  get general() {
    return this.generalLog;
  }

  get http() {
    return this.httpLog;
  }
}
