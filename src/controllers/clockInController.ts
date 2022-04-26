import { IClockIn, ClockInModel } from "../models/clockIns";
import { PenaltyModel } from "../models/penaltiesModel";
import { Request, Response } from "express";
import { IRules } from "../models/rulesModel";
import Status from '../configurations/status';
import responseMessage from "../utils/responseError";
import { EmployeeModel } from "../models/employeeModel";

export default class ClockInController {

    public static async getAllClockInsByCompanyID(req: Request<{}, {}, {companyID: string}>, res: Response) {
        let employeeIDs = await EmployeeModel.find({
            companyID: req.body.companyID
        }, '_id');

        let clockIns = await ClockInModel.find({
            employeeID: {
                $in: employeeIDs
            }
        });

        res.status(Status.OK).json(clockIns);
    }

    public static async getAllClockInsByEmployeeWorkID(
        req: Request<{}, {}, {companyID: string, employeeWorkID: string}>, 
        res: Response
    ) {
        let employeeID = await EmployeeModel.find({
            workID: req.body.employeeWorkID,
            companyID: req.body.companyID
        });
        
        let clockIns = await ClockInModel.find({
            employeeID: employeeID
        });

        res.status(Status.OK).json(clockIns);
    }

    public static async getAllClockInsByEmployeeID(req: Request<{}, {}, {employeeID: string}>, res: Response) {
        let clockIns = await ClockInModel.find({
            employeeID: req.body.employeeID
        });

        res.status(Status.OK).json(clockIns);
    }

    /**
     * **NOTE:** The client will determine whether the employee is late or not and send the result to the server, who processes accordingly
     * @param req: the request has a bool *late* to indicate whether the employee was late
     */
    public static async createClockIn(req: Request<{}, {}, {employeeID: string, late: boolean}>, res: Response) {
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
            employeeID: req.body.employeeID
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
    }

    /**
     * Requires the client to send over the _rules_ of the user company, to optimize processing time.
     * @param req _req.body.rules_ contains rules of the user company
     */
    public static async updateClockIn(req: Request<{}, {}, {clockIn: IClockIn, rules: IRules}>, res: Response) {
        if (!req.body.clockIn.clockedOut) {
            responseMessage(res, 'Clock out time is required.', Status.BAD_REQUEST);
            return;
        }

        let clockIn = await ClockInModel.findOne({
            clockedIn: req.body.clockIn.clockedIn,
            employeeID: req.body.clockIn.employeeID
        });

        if (!clockIn) {
            responseMessage(res, 'Requested clock in not found', Status.NOT_FOUND);
            return;
        }
        if (clockIn.clockedOut) {
            responseMessage(res, 'Clock out time for employee already recorded.', Status.FOUND);
            return;
        }

        let otWorkMinSigned = req.body.clockIn.clockedOut.getMinutes() - req.body.rules.endWork.getMinutes();
        let normalWorkMinutes = req.body.rules.endWork.getMinutes() + (otWorkMinSigned > 0 ? 0 : otWorkMinSigned);

        let updated = await ClockInModel
            .findOneAndUpdate({
                clockedIn: req.body.clockIn.clockedIn,
                employeeID: req.body.clockIn.employeeID
            }, {
                clockedOut: req.body.clockIn.clockedOut,
                normalWorkHours: normalWorkMinutes / 60,
                otWorkHours: otWorkMinSigned > 0 ? otWorkMinSigned : 0 
            }, {
                new: true
            })
            .catch((error: Error) => {
                responseMessage(res, error.message, Status.BAD_REQUEST);
            });

        res.status(Status.OK).json(updated);
    }

    public static async deleteClockIn(req: Request<{}, {}, IClockIn>, res: Response) {
        if (req.body.clockedIn.getMilliseconds() < new Date().setHours(0,0,0,0)) {
            responseMessage(res, 'Cannot delete clock in of a past day', Status.FORBIDDEN);
            return;
        }

        ClockInModel.deleteOne({
            clockedIn: {
                $gt: new Date(new Date().setHours(0,0,0,0))
            },
            employeeID: req.body.employeeID
        });
        res.sendStatus(Status.OK);
    }
}