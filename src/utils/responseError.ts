import express from 'express';

export default function responseMessage(res: express.Response, message: string, status: number): void
export default function responseMessage(res: express.Response, message: string, status: number, mergeObject: Object): void
export default function responseMessage(res: express.Response, message: string, status: number, mergeObject?: Object): void {
  res.status(status).json({message: message, ...mergeObject});
}