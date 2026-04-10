import "reflect-metadata";
import { Container } from "typedi";
import { Env } from "~/infrastructure/config/env.config";
import { Logger } from "~/infrastructure/logger/logger.infrastructure";
import { Server } from "~/interfaces/http/server";

const logger = Container.get(Logger);
await logger.init();

const env = Container.get(Env);
await env.init();

const server = Container.get(Server);
await server.init();
