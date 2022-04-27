import { IClockIn, ClockInModel } from "../models/clockInModel";
import { PenaltyModel } from "../models/penaltiesModel";
import { Request, Response } from "express";
import { IRules } from "../models/rulesModel";
import Status from '../configurations/status';
import responseMessage from "../utils/responseError";
import { EmployeeModel } from "../models/employeeModel";
import { handleError } from "../utils/responseError";

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
            let employeeID = await EmployeeModel.find({
                workID: req.params.wokid,
                companyID: req.params.comid
            });
            
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

    /**
     * **NOTE:** The client will determine whether the employee is late or not and send the result to the server, who processes accordingly
     * @param req: the request has a bool *late* to indicate whether the employee was late
     */
    public static async createClockIn(req: Request<{}, {}, {employeeID: string, late: boolean}>, res: Response) {
        try {
            let existing = await ClockInModel.findOne({
                clockedIn: {
                    $gt: new Date(new Date().setHours(0,0,0,0))
                },
                employeeID: req.body.employeeID
            });
    
            if (existing) {
                responseMessage(res, 'Employee has already clocked in today.', Status.CONFLICT, {existingClockIn: {...existing}});
                return;
            }
    
            let clockIn = new ClockInModel({
                clockedIn: new Date(),
                late: req.body.late,
                employeeID: req.body.employeeID,
            });
            await clockIn.save();
    
            if (req.body.late) {
                let penalty = new PenaltyModel({
                    type: 'Late',
                    employeeID: req.body.employeeID,
                    occurredAt: clockIn.clockedIn,
                });
                await penalty.save();
            }
            res.status(Status.OK).json(clockIn);
        } catch (error) { handleError(res, error as Error); }
    }

    /**
     * Requires the client to send over the _rules_ of the user company, to optimize processing time.
     * @param req _req.body.rules_ contains rules of the user company
     */
    public static async updateClockIn(req: Request<{empid: string}, {}, {clockIn: IClockIn, rules: IRules}>, res: Response) {
        if (!req.body.clockIn.clockedOut) {
            responseMessage(res, 'Clock out time is required.', Status.BAD_REQUEST);
            return;
        }

        try {
            let clockIn = await ClockInModel.findOne({
                clockedIn: {
                    $gt: new Date(new Date().setHours(0,0,0,0))
                },
                employeeID: req.params.empid
            });
    
            if (!clockIn) {
                responseMessage(res, 'Requested clock in not found', Status.NOT_FOUND);
                return;
            }
            if (clockIn.clockedOut) {
                responseMessage(res, 'Clock out time for employee already recorded.', Status.FOUND);
                return;
            }
        } catch (error) { handleError(res, error as Error); return; }

        let end = new Date(req.body.rules.endWork);
        let start = new Date(req.body.rules.startWork);
        let endWorkDT = new Date();
        let startWorkDT = new Date();
        endWorkDT.setHours(end.getHours(), end.getMinutes(), end.getSeconds());
        startWorkDT.setHours(start.getHours(), start.getMinutes(), start.getSeconds());

        let accountedStart = Math.max(startWorkDT.getTime(), new Date(req.body.clockIn.clockedIn).getTime());
        let otWorkTimeSigned = new Date(req.body.clockIn.clockedOut).getTime() - endWorkDT.getTime();
        let normalWorkHours = (endWorkDT.getTime() + (otWorkTimeSigned > 0 ? 0 : otWorkTimeSigned) - accountedStart) / 3600000;

        try {
            let updated = await ClockInModel
            .findOneAndUpdate({
                clockedIn: {
                    $gt: new Date(new Date().setHours(0,0,0,0))
                },
                employeeID: req.params.empid
            }, {
                clockedOut: req.body.clockIn.clockedOut,
                normalWorkHours: normalWorkHours,
                otWorkHours: otWorkTimeSigned > 0 ? otWorkTimeSigned / 3600000 : 0 
            }, { new: true });

            res.status(Status.OK).json(updated);
        } catch (error) { handleError(res, error as Error); }
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