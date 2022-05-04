import mongoose from "mongoose";
import { Response, Request } from "express";
import { DateTime } from "luxon";
import responseMessage from "./responseError";
import Status from "../configurations/status";

export function addDateRangeFilter(
    req: Request, 
    res: Response, 
    q: mongoose.Query<any, any>,
    timeProp: string
  ): mongoose.Query<any, any> | undefined 
{
    let timezone = "Asia/Ho_Chi_Minh";

    if (req.query.startDate && req.query.endDate) {
        let start = DateTime.fromISO(req.query.startDate as string);
        let end = DateTime.fromISO(req.query.endDate as string);
        if (start.isValid && end.isValid) {
            return q
                    .where(timeProp)
                    .gte(
                        start
                        .set({ hour: 0, minute: 0, second: 0 })
                        .setZone(timezone)
                        .toMillis())
                    .lte(
                        end
                        .set({ hour: 23, minute: 59, second: 59 })
                        .setZone(timezone)
                        .toMillis()
                    );
        }
        else {
            responseMessage(
                res, 
                'Query parameters startDate and endDate must be in ISODate format, e.g. "YYYY-MM-DD[Thh:mm:ss<+->hh:mm]"', 
                Status.BAD_REQUEST
            );
            return;
        }
    }
    else return q;
}