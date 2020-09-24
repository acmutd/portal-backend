import express from "express";
import cors from "cors";
import * as bodyParser from "body-parser";
import * as functions from "firebase-functions";
import * as Sentry from "@sentry/node";

if (functions.config()?.sentry?.dns) Sentry.init({ dsn: functions.config().sentry.dns });

const app = express();
app.use(Sentry.Handlers.requestHandler());
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

export default app;
