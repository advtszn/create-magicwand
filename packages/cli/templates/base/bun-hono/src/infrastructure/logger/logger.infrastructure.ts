import pino from "pino";
import { Service } from "typedi";

@Service()
export class Logger {
  private logParent!: pino.Logger;
  private generalLog!: pino.Logger;
  private httpLog!: pino.Logger;

  async init(level: pino.Level = "info") {
    this.logParent = pino({
      level,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    });
    this.generalLog = this.logParent.child({ type: "general" });
    this.httpLog = this.logParent.child({ type: "http" });
  }

  get general() {
    return this.generalLog;
  }

  get http() {
    return this.httpLog;
  }
}
