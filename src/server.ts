import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Env from "./configurations/env";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Connection } from "./database/connection";
import { SESSION_EXPIRE_SPAN } from "./configurations/security";
import getPathFromVersion from "./utils/pathFromVersion";
import { ApiVersion } from "./configurations/apiVersions";
import dailyTask from "./tasks/dailyClockTask";
import authenticateRouter from "./routes/authenticateRouter";
import employeesRouter from "./routes/employeesRouter";
import leavesRouter from "./routes/leavesRouter";
import clockInsRouter from "./routes/clockInRouter";
import penaltyRouter from "./routes/penaltyRouter";
import holidaysRouter from "./routes/holidaysRouter";
import salaryRouter from "./routes/salaryRouter";
import reportRouter from "./routes/reportRouter";

require("dotenv/config");

const server = express();

// Server setups
server.use(cors({ credentials: true, origin: "http://localhost:3000" }));
server.use(express.json());
server.use(
  session({
    secret: Env.TOKEN_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: Env.DB_CONNECTION,
      collectionName: "connectSessions",
    }),
    cookie: {
      secure: false,
      maxAge: SESSION_EXPIRE_SPAN,
      sameSite: "strict",
    },
  })
);

//Routers
server.use(authenticateRouter);
server.use(getPathFromVersion("/employees", ApiVersion.v1), employeesRouter);
server.use(getPathFromVersion("/leaves", ApiVersion.v1), leavesRouter);
server.use(getPathFromVersion("/clock-ins", ApiVersion.v1), clockInsRouter);
server.use(getPathFromVersion("/penalties", ApiVersion.v1), penaltyRouter);
server.use(getPathFromVersion("/holidays", ApiVersion.v1), holidaysRouter);
server.use(getPathFromVersion("/salaries", ApiVersion.v1), salaryRouter);
server.use(getPathFromVersion("/reports", ApiVersion.v1), reportRouter);
server.get("/", (req, res) => {
  res.send("Hello world");
});

// Server PORT
server.listen(42069);
Connection.openConnection().then(() => {
  dailyTask.start();
  console.log("Daily task started.");
  console.log("Server running...");
});
