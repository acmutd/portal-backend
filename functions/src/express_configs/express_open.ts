import express from "express";
import cors from "cors";
import * as bodyParser from "body-parser";

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

export default app;
