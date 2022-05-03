import { IClockIn, ClockInModel } from "../models/clockInModel";
import { PenaltyModel } from "../models/penaltiesModel";
import { Request, Response } from "express";
import Status from '../configurations/status';
import responseMessage from "../utils/responseError";
import { EmployeeModel } from "../models/employeeModel";
import { handleError } from "../utils/responseError";
import { UserModel } from "../models/userModel";

export default class ClockInController {

    public static async getAllClockInsByCompanyID(req: Request<{comid: string}>, res: Response) {
        try {
            let employeeIDs = await EmployeeModel.find({
                companyID: req.params.comid
            }, '_id');
    
            let clockIns = await ClockInModel.find({
                employeeID: {
                    $in: employeeIDs
                }
            });
    
            res.status(Status.OK).json(clockIns);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getAllClockInsByEmployeeWorkID(
        req: Request<{comid: string, wokid: string}>, 
        res: Response
    ) {
        try {
            let employeeID = await EmployeeModel.findOne({
                workID: req.params.wokid,
                companyID: req.params.comid
            }, '_id');
            if (!employeeID) {
                res.status(Status.OK).json([]);
                return;
            }
            
            let clockIns = await ClockInModel.find({
                employeeID: employeeID
            });
    
            res.status(Status.OK).json(clockIns);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getAllClockInsByEmployeeID(req: Request<{empid: string}>, res: Response) {
        try {
            let clockIns = await ClockInModel.find({
                employeeID: req.params.empid
            });
    
            res.status(Status.OK).json(clockIns);
        } catch (error) { handleError(res, error as Error); }
    }
    
    public static async getClockInsByEmployeeWorkIDInDateRange(
        req: Request<
            {comid: string, wokid: string}, 
            {}, 
            { startDate: Date, endDate: Date }
            >, 
        res: Response
    ) {
        try {
            let employeeID = await EmployeeModel.findOne({
                workID: req.params.wokid,
                companyID: req.params.comid
            }, '_id');
            if (!employeeID) {
                res.status(Status.OK).json([]);
            }

            let clockIns = await ClockInModel.find({
                employeeID: employeeID,
                clockedIn: {
                    $gte: new Date(new Date(req.body.startDate).setHours(0,0,0,0)),
                    $lte: new Date(new Date(req.body.endDate).setHours(23,59,59))
                }
            });
            res.status(Status.OK).json(clockIns);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getClockInsByEmployeeIDInDateRange(
        req: Request<
            {empid: string}, 
            {}, 
            { startDate: Date, endDate: Date }
            >, 
        res: Response
    ) {
        try {
            let clockIns = await ClockInModel.find({
                employeeID: req.params.empid,
                clockedIn: {
                    $gte: new Date(new Date(req.body.startDate).setHours(0,0,0,0)),
                    $lte: new Date(new Date(req.body.endDate).setHours(23,59,59))
                }
            });
            res.status(Status.OK).json(clockIns);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async createClockIn(req: Request<{}, {}, {employeeID: string}>, res: Response) {
        try {
            let employee = await EmployeeModel.findOne({ _id: req.body.employeeID });
            if (!employee) {
                responseMessage(res, 'Employee with such ID not found.', Status.NOT_FOUND);
                return;
            }

            let existing = await ClockInModel.findOne({
                clockedIn: {
                    $gt: new Date(new Date().setHours(0,0,0,0))
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

    public static async deleteClockIn(req: Request<{empid: string}, {}, IClockIn>, res: Response) {
        if (new Date(req.body.clockedIn).getTime() < new Date().setHours(0,0,0,0)) {
            responseMessage(res, 'Cannot delete clock in of a past day', Status.FORBIDDEN);
            return;
        }

        try {
            let deletedClockIn = await ClockInModel.findOneAndDelete({
                clockedIn: {
                    $gt: new Date(new Date().setHours(0,0,0,0))
                },
                employeeID: req.params.empid
            });
    
            let deleteCount = 0;
            if (deletedClockIn) {
                deleteCount = 1;
                if (deletedClockIn.late) {
                    await PenaltyModel.deleteOne({
                        type: 'Late',
                        occurredAt: deletedClockIn.clockedIn,
                        employeeID: deletedClockIn.employeeID
                    });
                }
            }
    
            res.status(Status.OK).json({ deleteCount });
        } catch (error) { handleError(res, error as Error); }
    }
}