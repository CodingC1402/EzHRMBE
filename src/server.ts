import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Env from './configurations/env';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { Connection } from './database/connection';
import authenticateRouter from './routes/authenticateRouter';
import { SESSION_EXPIRE_SPAN } from './configurations/security';
import employeesRouter from './routes/employeesRouter';
import getPathFromVersion from './utils/pathFromVersion';
import { ApiVersion } from './configurations/apiVersions';
import leavesRouter from './routes/leavesRouter';
import router from './routes/clockInRouter';
import penaltyRouter from './routes/penaltyRouter';
import dailyTask from './tasks/dailyClockTask';

require('dotenv/config');

const server = express();

// Server setups
server.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
server.use(express.json());
server.use(
  session({
    secret: Env.TOKEN_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: Env.DB_CONNECTION,
      collectionName: 'connectSessions',
    }),
    cookie: {
      secure: false,
      maxAge: SESSION_EXPIRE_SPAN,
      sameSite: 'strict',
    },
  })
);

//Routers
server.use(authenticateRouter);
server.use(getPathFromVersion('/employees', ApiVersion.v1), employeesRouter);
server.use(getPathFromVersion('/leaves', ApiVersion.v1), leavesRouter);
server.use(getPathFromVersion('/clockins', ApiVersion.v1), router);
server.use(getPathFromVersion('/penalties', ApiVersion.v1), penaltyRouter);
server.get('/', (req, res) => {
  res.send('Hello world');
});

// Server PORT
server.listen(42069);
Connection
    .openConnection()
    .then(() => {
      dailyTask.start();
      console.log('Daily task started.');
      console.log('Server running...');
    });