import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/userRouter';
import cors from 'cors';
import Env from './configurations/Env';
import Token from './security/token';
import Status from './configurations/Status';

require('dotenv/config');

const server = express();

server.use(cors());
server.use(express.json());

// Check if user is authenticated
server.use((req, res, next) => {
  if (!Token.isAuthenticated(req.url, req.header)) {
    res.status(Status.UNAUTHORIZED);
    return;
  }

  next();
})

server.use('/user', userRouter);
server.get('/', (req, res) => {
  res.send("Hello world");
})

server.listen(3000);

let dbConnect = Env.DB_CONNECTION;
mongoose.connect(dbConnect, () => {
  console.log("Connected to MongoDB...");
});

console.log("Server running...");