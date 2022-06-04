import { IClockIn, ClockInModel } from "../models/clockInModel";
import { PenaltyModel } from "../models/penaltiesModel";
import { Request, Response } from "express";
import Status from '../configurations/status';
import responseMessage from "../utils/responseError";
import { handleError } from "../utils/responseError";
import { EmployeeModel } from "../models/employeeModel";
import { UserModel } from "../models/userModel";
import { addDateRangeFilter, addDateRangeFilterAggregate } from "../utils/queryHelpers"
import mongoose from "mongoose";
import { DateTime } from "luxon";

export default class ClockInController {

    public static async getAllEmployeesWithClockIn(req: Request, res: Response) {
        try {
            let result = await EmployeeModel.aggregate([
                { $match: {
                    $and: [
                        { companyID: new mongoose.Types.ObjectId(req.session.companyID) },
                        { $or: [
                            { resignDate: { $exists: false } },
                            { resignDate: { $gt: DateTime.now().endOf('day') } }
                        ] }
                    ]
                } },
                { $lookup: {
                    from: "clockins",
                    let: { eid: "$_id" },
                    pipeline: [
                        { $match: {
                            $and: [
                                { $expr: { $eq: [ "$employeeID", "$$eid" ] } },
                                { clockedIn:
                                    { $gte: 
                                        DateTime
                                            .now()
                                            .startOf('day') 
                                    }
                                }
                            ]
                        } }
                    ],
                    as: "clockIn"
                } },
                { $unwind: {
                    path: "$clockIn",
                    preserveNullAndEmptyArrays: true
                } }
            ]);

            res.status(Status.OK).json(result);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getAccumulatedWorkHoursByEmployeeID(req: Request<{empid: string}>, res: Response) {
        try {
            let aggre = ClockInModel.aggregate([
                { $match: 
                    { employeeID: new mongoose
                                    .Types
                                    .ObjectId(req.params.empid) } 
                }
            ]);
            let result = addDateRangeFilterAggregate(req.query.startDate, req.query.endDate, aggre, "clockedIn");
            if (result) aggre = result;
            else return;

            aggre.group({
                _id: "$employeeID",
                totalNormalWorkHours: { $sum: "$normalWorkHours" },
                totalOtWorkHours: { $sum: "$otWorkHours" }
            });
            let totalHours = await aggre;
            res.status(Status.OK).json(totalHours);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getAllClockInsByCompanyID(req: Request, res: Response) {
        try {
            let employeeIDs = await EmployeeModel.find({
                companyID: req.session.companyID
            }, '_id');

            let query = ClockInModel.find({
                employeeID: {
                    $in: employeeIDs
                }
            });
            query = addDateRangeFilter(req, query, "clockedIn");
    
            let clockIns = await query;
            res.status(Status.OK).json(clockIns);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getAllClockInsByEmployeeWorkID(
        req: Request<{ workid: string }>, 
        res: Response
    ) {
        try {
            let employeeID = await EmployeeModel.findOne({
                workID: req.params.workid,
                companyID: req.session.companyID
            }, '_id');

            let query = ClockInModel.find({
                employeeID: employeeID
            });
            query = addDateRangeFilter(req, query, "clockedIn");
    
            let clockIns = await query;
            res.status(Status.OK).json(clockIns);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getAllClockInsByEmployeeID(req: Request<{empid: string}>, res: Response) {
        try {
            let query = ClockInModel.find({
                employeeID: req.params.empid
            });
            query = addDateRangeFilter(req, query, "clockedIn");

            let clockIns = await query;
            res.status(Status.OK).json(clockIns);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async createClockIn(req: Request<{}, {}, {employeeID: string}>, res: Response) {
        try {
            let employee = await EmployeeModel.findOne({ 
                $and: [
                    { _id: req.body.employeeID },
                    { $or: [
                        { resignDate: { $exists: false } },
                        { resignDate: { $gt: DateTime.now().endOf('day') } }
                    ] }
                ]
            });
            if (!employee) {
                responseMessage(res, 'Employee with such ID not found or has resigned.', Status.NOT_FOUND);
                return;
            }

            let existing = await ClockInModel.findOne({
                clockedIn: {
                    $gt: DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                },
                employeeID: req.body.employeeID
            });
            if (existing) {
                responseMessage(res, 'Employee has already clocked in today.', Status.CONFLICT, {existingClockIn: existing});
                return;
            }

            let user = await UserModel.findOne({ 'company._id': employee.companyID });
            if (!user) {
                responseMessage(res, 'User not found for given employee.', Status.NOT_FOUND);
                return;
            }

            let rules = user.company.rule;
            let late = new Date().getTime() - new Date().setHours(
                rules.startWork.getHours(), 
                rules.startWork.getMinutes(), 
                rules.startWork.getSeconds()
            ) - rules.allowedLateTime.getUTCHours()*60*60*1000 
            - rules.allowedLateTime.getUTCMinutes()*60*1000 
            - rules.allowedLateTime.getUTCSeconds()*1000 > 0 ? true : false;

            let clockIn = new ClockInModel({
                clockedIn: new Date(),
                late: late,
                employeeID: req.body.employeeID,
            });
            await clockIn.save();
    
            if (late) {
                let penalty = new PenaltyModel({
                    type: 'Late',
                    employeeID: req.body.employeeID,
                    occurredAt: clockIn.clockedIn,
                });
                await penalty.save();
            }
            res.status(Status.CREATED).json(clockIn);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async updateClockIn(req: Request<{empid: string}, {}, {clockIn: IClockIn, userID: string}>, res: Response) {
        if (!req.body.clockIn.clockedOut) {
            responseMessage(
                res, 
                'Clock out time is required.', 
                Status.BAD_REQUEST
            );
            return;
        }

        try {
            let user = await UserModel.findOne({
                _id: req.body.userID
            });
            if (!user) {
                responseMessage(
                    res, 
                    'User with such ID not found', 
                    Status.NOT_FOUND
                );
                return;
            }

            let rules = user.company.rule;
            let clockIn = await ClockInModel.findOne({
                clockedIn: {
                    $gt: new Date(new Date().setHours(0,0,0,0))
                },
                employeeID: req.params.empid
            });
    
            if (!clockIn) {
                responseMessage(
                    res, 
                    'Requested clock in not found', 
                    Status.NOT_FOUND
                );
                return;
            }
            if (clockIn.clockedOut) {
                responseMessage(
                    res, 
                    'Clock out time for employee already recorded.', 
                    Status.FOUND, 
                    { clockIn: clockIn }
                );
                return;
            }

            let end = new Date(rules.endWork);
            let start = new Date(rules.startWork);
            let endWorkToday = new Date();
            let startWorkToday = new Date();
            endWorkToday.setHours(
                end.getHours(), 
                end.getMinutes(), 
                end.getSeconds()
            );
            startWorkToday.setHours(
                start.getHours(),
                start.getMinutes(),
                start.getSeconds()
            );

            let clockedStart = Math.max(
                startWorkToday.getTime(), 
                new Date(req.body.clockIn.clockedIn).getTime()
            );
            let otWorkTimeSigned = new Date(req.body.clockIn.clockedOut).getTime() - endWorkToday.getTime();
            let normalWorkHours = (
                endWorkToday.getTime()
                + (otWorkTimeSigned > 0 ? 0 : otWorkTimeSigned) 
                - clockedStart) / 3600000;

            let updated = await ClockInModel
                .findOneAndUpdate({
                    clockedIn: {
                        $gt: new Date(new Date().setHours(0,0,0,0))
                    },
                    employeeID: req.params.empid
                }, {
                    clockedOut: req.body.clockIn.clockedOut,
                    normalWorkHours: normalWorkHours > 0 ? normalWorkHours : 0,
                    otWorkHours: otWorkTimeSigned > 0 ? otWorkTimeSigned / 3600000 : 0 
                }, { new: true });

            res.status(Status.OK).json(updated);
        } catch (error) { handleError(res, error as Error); return; }
    }

    public static async deleteClockIn(req: Request<{id: string}>, res: Response) {
        try {
            let clockIn = await ClockInModel.findById(req.params.id);
            if (!clockIn) {
                throw new Error("Cannot find clock-in with specified Id.");
            }
            await ClockInModel.deleteOne({
                _id: clockIn.id
            });
    
            if (clockIn.late) {
                await PenaltyModel.deleteOne({
                    type: 'Late',
                    occurredAt: clockIn.clockedIn,
                    employeeID: clockIn.employeeID
                });
            }
    
            res.status(Status.OK).json(clockIn);
        } catch (error) { handleError(res, error as Error); }
    }
}