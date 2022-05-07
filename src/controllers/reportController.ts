import { Request, Response } from "express";
import Status from '../configurations/status';
import { handleError } from "../utils/responseError";
import { addDateRangeFilterAggregate, addDateRangeFilter } from "../utils/queryHelpers"
import { PenaltyModel } from "../models/penaltiesModel";
import { EmployeeModel } from "../models/employeeModel";
import { ReportModel } from "../models/reportModel";
import { LeavesModel } from "../models/leavesModel";
import { BasePenaltyTypes } from "../models/rulesModel";
import { DateTime } from "luxon";
import mongoose from "mongoose";

export default class ReportController {
    public static async getAllReportsByCompanyID(req: Request<{ compid: string }>, res: Response) {
        try {
            let query = ReportModel.find({
                companyID: req.params.compid
            });
            if (req.query.startDate && req.query.endDate && !req.query.month) {
                query = addDateRangeFilter(req, query, "compileDate");
            } else if (!req.query.startDate && !req.query.endDate && req.query.month) {
                query.where({
                    $expr: {
                        $eq: [ { $month: "$compileDate" }, req.query.month ]
                    }
                });
            } else {
                throw new Error("Request query params can only contain either ( startDate, endDate ) or month");
            }
            
            let reports = await query;
            res.status(Status.OK).json(reports);
        } catch (error) { handleError(res, error as Error); }
    }
    
    public static async compileReport(
        req: Request<{ compid: string }, {}, { startDate: string, endDate: string }>,
        res: Response
    ) {
        try {
            let employees = await EmployeeModel.find({
                companyID: new mongoose.Types.ObjectId(req.params.compid)
            });
            let employeeIDs = employees.map((e) => new mongoose.Types.ObjectId(e.id));

            let penAggr = PenaltyModel.aggregate([
                { $match: 
                    { 
                        employeeID: { $in: employeeIDs },
                        type: { $in: Object.values(BasePenaltyTypes) }
                    } 
                }
            ]);
            if (req.body.startDate && req.body.endDate) {
                penAggr = addDateRangeFilterAggregate(
                    req.body.startDate,
                    req.body.endDate,
                    penAggr,
                    "occurredAt"
                );
            }
            else {
                penAggr.match({
                    $expr: {
                        $eq: [
                            { $month: "$occurredAt" },
                            DateTime.now().month
                        ]
                    }
                });
            }
            penAggr.group({
                _id: "$type",
                totalOccurrences: { $count: {} }
            });
            let pens = await penAggr;
            console.log(pens);

            let start = DateTime.fromISO(req.body.startDate)
            let end = DateTime.fromISO(req.body.endDate);
            let leaves: number;
            if (start.isValid && end.isValid) {
                leaves = await LeavesModel.count({
                    employeeID: { $in: employeeIDs },
                    startDate: {
                        $gte: start,
                        $lte: end
                    }
                })
            } else {
                leaves =  await LeavesModel.count({
                    $and: [
                        { employeeID: { $in: employeeIDs } },
                        { $expr: {
                            $eq: [ { $month: "$startDate" }, DateTime.now().month ]
                        } }
                    ]
                });
            }
            
            let newHires = employees.filter((e) => {
                if (req.body.startDate && req.body.endDate) {
                    let empStart = DateTime
                            .fromJSDate(e.startDate)
                            .startOf("day");
                    return start.startOf("day") <= empStart
                            && empStart <= end.startOf("day");
                } else {
                    return e.startDate.getMonth() === new Date().getMonth();
                }
            });
            let resigned = employees.filter((e) => {
                if (!e.resignDate) return false;
                else {
                    if (req.body.startDate && req.body.endDate) {
                        let resign = DateTime
                            .fromJSDate(e.resignDate)
                            .startOf("day");
                        return start.startOf("day") <= resign
                                    && resign <= end.startOf("day");
                    } else {
                        return e.resignDate.getMonth() === new Date().getMonth();
                    }
                }
            });
            let currentStaff = employees.filter((e) => {
                return !e.resignDate 
                        || ((start.isValid && end.isValid) ? 
                                DateTime
                                .fromJSDate(e.resignDate)
                                .startOf("day") > end.startOf("day") : false);
            });

            let late = pens.find((p) => p._id === BasePenaltyTypes.Late);
            let absent = pens.find((p) => p._id === BasePenaltyTypes.Absent);
            let report = new ReportModel({
                late: late ? late.totalOccurrences : 0,
                absent: absent ? absent.totalOccurrences : 0,
                leaves: leaves,
                newHires: newHires.length,
                resignations: resigned.length,
                totalStaff: currentStaff.length,
                companyID: new mongoose.Types.ObjectId(req.params.compid),
                compileDate: (start.isValid && end.isValid) ? start : DateTime.now()
            });

            await report.save();
            res.status(Status.OK).json(report);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async deleteReport(req: Request<{ id: string }>, res: Response) {
        try {
            let deleted = await ReportModel.findByIdAndDelete(
                req.params.id
            );
            res.status(Status.OK).json(deleted);
        } catch (error) { handleError(res, error as Error); }
    }
}