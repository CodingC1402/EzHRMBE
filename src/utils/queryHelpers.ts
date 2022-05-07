import mongoose from "mongoose";
import { Response, Request } from "express";
import { DateTime } from "luxon";
import responseMessage from "./responseError";
import Status from "../configurations/status";

export function addDateRangeFilter(
    req: Request, 
    q: mongoose.Query<any, any>,
    timeProp: string
  ): mongoose.Query<any, any> 
{
    if (req.query.startDate && req.query.endDate) {
        let start = DateTime.fromISO(req.query.startDate as string);
        let end = DateTime.fromISO(req.query.endDate as string);
        console.log(end.set({ hour: 23, minute: 59, second: 59 }).toISO());
        if (start.isValid && end.isValid) {
            return q.where({
                [timeProp]: {
                    $gte: start.set({ hour: 0, minute: 0, second: 0 }),
                    $lte: end.set({ hour: 23, minute: 59, second: 59 })
                }
            })
        }
        else {
            throw new Error('Parameters startDate and endDate must be in ISODate format, e.g. "YYYY-MM-DD[Thh:mm:ss<+->hh:mm]"');
        }
    }
    else return q;
}
export function addDateRangeFilterAggregate(
    startDate: any,
    endDate: any, 
    aggre: mongoose.Aggregate<any>,
    timeProp: string
  ): mongoose.Aggregate<any> 
{
    if (startDate && endDate) {
        let start = DateTime.fromISO(startDate)
        let end = DateTime.fromISO(endDate);
        if (start.isValid && end.isValid) {
            return aggre.match({
                [timeProp]: {
                    $gte: start.set({ hour: 0, minute: 0, second: 0 }),
                    $lte: end.set({ hour: 23, minute: 59, second: 59 })
                }
            });
        }
        else {
            throw new Error('Parameters startDate and endDate must be in ISODate format, e.g. "YYYY-MM-DD[Thh:mm:ss<+->hh:mm]"');
        }
    }
    else return aggre;
}