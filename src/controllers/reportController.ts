import { Request, Response } from "express";
import Status from '../configurations/status';
import { handleError } from "../utils/responseError";
import { addDateRangeFilterAggregate, addDateRangeFilter } from "../utils/queryHelpers"
import { PenaltyModel } from "../models/penaltiesModel";
import { EmployeeModel } from "../models/employeeModel";
import { ReportModel, IReport } from "../models/reportModel";
import { LeavesModel } from "../models/leavesModel";
import { BasePenaltyTypes } from "../models/rulesModel";
import { DateTime } from "luxon";
import mongoose from "mongoose";

export default class ReportController {
    public static async getAllReportsByCompanyID(req: Request, res: Response) {
        try {
            let query = ReportModel.find({
                companyID: req.session.companyID
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
    
    public static async createReport(
        req: Request<{}, {}, { startDate: string, endDate: string }>,
        res: Response
    ) {
        try {
            if (!req.session.companyID) {
                res
                    .status(Status.UNAUTHORIZED)
                    .json({ message: "Authentication failed." });
                return;
            }
            let rep = await compileReport(req.session.companyID, req.body.startDate, req.body.endDate);

            let report = new ReportModel({ ...rep });
            await report.save();
            res.status(Status.OK).json(report);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async updateReport(req: Request<{ id: string }>, res: Response) {
        try {
            let updated = await updateReport(req.params.id);
            
            res.status(Status.OK).json(updated);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async deleteReport(req: Request<{ id: string }>, res: Response) {
        try {
            let deleted = await ReportModel.findByIdAndDelete(
                req.params.id
            );
            if (!deleted) {
                throw new Error("Cannot find report with specified Id.");
            }
            res.status(Status.OK).json(deleted);
        } catch (error) { handleError(res, error as Error); }
    }
}

export async function updateReport(id: string) : Promise<IReport | null> {
    let existingReport = await ReportModel.findById(id);
    if (!existingReport) {
        throw new Error("Cannot find report with specified Id.");
    }
    let update = await compileReport(
        existingReport.companyID.toString(),
        existingReport.compileDate.toISOString(),
        existingReport.compiledUpTo.toISOString()
    );
    let updatedReport = await ReportModel.findByIdAndUpdate(
        { _id: existingReport.id }, 
        {...update},
        { new: true }
    );
    return updatedReport;
}

export async function compileReport(
    compid: string,
    startDate?: string,
    endDate?: string
): Promise<IReport>
{
    let employees = await EmployeeModel.find({
        companyID: new mongoose.Types.ObjectId(compid)
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

    let s = DateTime.fromISO(startDate as string)
    let e = DateTime.fromISO(endDate as string);
    let start = s.isValid ? s : DateTime.now();
    let end = e.isValid ?
                e : start
                    .plus({ months: 1 })
                    .minus({ days: 1 });

    penAggr = addDateRangeFilterAggregate(
        start,
        end,
        penAggr,
        "occurredAt"
    );
    penAggr.group({
        _id: "$type",
        totalOccurrences: { $count: {} }
    });
    let pens = await penAggr;

    let leaves = await LeavesModel.count({
        employeeID: { $in: employeeIDs },
        startDate: {
            $gte: start,
            $lte: end
        }
    });
    
    let newHires = employees.filter((e) => {
        let empStart = DateTime
                    .fromJSDate(e.startDate)
                    .startOf("day");
            return start.startOf("day") <= empStart
                    && empStart <= end.startOf("day");
    });
    let resigned = employees.filter((e) => {
        if (!e.resignDate) return false;
        else {
            let resign = DateTime
                    .fromJSDate(e.resignDate)
                    .startOf("day");
                return start.startOf("day") <= resign
                            && resign <= end.startOf("day");
        }
    });
    let currentStaff = employees.filter((e) => {
        return !e.resignDate || DateTime
                            .fromJSDate(e.resignDate)
                            .startOf("day") > end.startOf("day");
    });

    let late = pens.find((p) => p._id === BasePenaltyTypes.Late);
    let absent = pens.find((p) => p._id === BasePenaltyTypes.Absent);
    let report: IReport = {
        late: late ? late.totalOccurrences : 0,
        absent: absent ? absent.totalOccurrences : 0,
        leaves: leaves,
        newHires: newHires.length,
        resignations: resigned.length,
        totalStaff: currentStaff.length,
        companyID: new mongoose.Types.ObjectId(compid),
        compileDate: start.toJSDate(),
        compiledUpTo: end.toJSDate()
    };

    return report;
}