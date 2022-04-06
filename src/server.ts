import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Env from './configurations/env';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import authenticateRouter from './routes/authenticateRouter';
import { SESSION_EXPIRE_SPAN } from './configurations/security';
import bcrypt from 'bcrypt';

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
server.get('/', (req, res) => {
  res.send('Hello world');
});

server.listen(42069);

// DB connection
let dbConnect = Env.DB_CONNECTION;
mongoose.connect(dbConnect, () => {
  console.log('Connected to MongoDB...');
});

console.log('Server running...');