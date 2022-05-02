import { Response } from 'express';
import Status from '../configurations/status';

export default function responseMessage(res: Response, message: string, status: number): void
export default function responseMessage(res: Response, message: string, status: number, mergeObject: Object): void
export default function responseMessage(res: Response, message: string, status: number, mergeObject?: Object): void {
  res.status(status).json({message: message, ...mergeObject});
}

export function handleError(res: Response, error: Error, status?: number) {
  res.status(status ? status : Status.BAD_REQUEST).json({error: error.message});
}