import express from 'express';

export default function responseError(res: express.Response, error: Error, status: number): void {
  res.status(status).json({message: error.message});
}