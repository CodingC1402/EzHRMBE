import { Connection } from "./connection";
import { NextFunction, Request, Response } from "express";
import { handleError } from "../utils/responseError";

export namespace controller {
  /**
   * Create a function that will call the fn function inside a 
   * try finally block to open and close connection automatically
   * @param fn the function that will be called *HAS TO BE ASYNC*
   * @returns will return a promise of what the fn return
   */
  export function createFunction<TReturn = void, TParam = {}, TResBody = {}, TReqBody = {}, TReqQuery = {}>(
    fn: (
      req: Request<TParam, TResBody, TReqBody, TReqQuery>,
      res: Response<TResBody>,
      next: NextFunction
    ) => Promise<TReturn>
  ) {
    return async function (
      req: Request<TParam, TResBody, TReqBody, TReqQuery>,
      res: Response<TResBody>,
      next: NextFunction
    ) {
      try {
        await Connection.openConnection();
        return await fn(req, res, next);
      } catch (e) {
        handleError(res, e as Error);
        return null;
      } finally {
        await Connection.closeConnection();
      }
    };
  }
}
