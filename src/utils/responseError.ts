import express from 'express';

export default function responseMessage(res: express.Response, message: string, status: number): void {
  res.status(status).json({message: message});
}