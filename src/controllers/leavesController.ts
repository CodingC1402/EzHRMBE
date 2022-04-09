import { Response, Request } from 'express';
import mongoose from 'mongoose';
import Status from '../configurations/status';
import { EmployeeModel, IEmployee } from '../models/employeeModel';
import { ILeave, LeavesModel } from '../models/leavesModel';
import responseMessage from '../utils/responseError';

const LEAVE_NOT_FOUND = "Leave not found";
const EMPLOYEE_DOESNT_EXIST = "Employee doesn't exists";
const NO_PERMISSION = "You do not have permission for this action";


export default class LeavesController {  
    public static async create(req: Request<{}, {}, ILeave>, res: Response) {
        let leave = new LeavesModel({
            ...req.body
        });

        let employee = await EmployeeModel.findById(leave?.employeeID).lean();
        if (!employee) {
            responseMessage(res, EMPLOYEE_DOESNT_EXIST, Status.NOT_FOUND);
            return;
        }
        
        if (employee.companyID.toString() !== req.session.companyID) {
            responseMessage(res, NO_PERMISSION, Status.FORBIDDEN);
            return;
        }

        leave.save()
        .then((result) => {
            res.status(Status.OK).json(result);
        })
        .catch((err: Error) => {
            responseMessage(res, err.message, Status.FORBIDDEN);
        })
    }

    public static async delete(req: Request<{id: string}, {}, ILeave>, res: Response) {
        let leave = await LeavesModel.findById(req.params.id);
        if (!leave) {
            responseMessage(res, LEAVE_NOT_FOUND, Status.NOT_FOUND);
            return;
        }

        // Employee can't be null unless change happen no via api.
        let employee: IEmployee & {_id: mongoose.Types.ObjectId} = await EmployeeModel.findById(leave?.employeeID).lean();

        if (employee.companyID.toString() !== req.session.companyID) {
            responseMessage(res, NO_PERMISSION, Status.FORBIDDEN);
            return;
        }

        leave.delete();
        res.status(Status.OK).json(leave.toObject());
    }

    public static async update(req: Request<{id: string}, {}, ILeave>, res: Response) {
        let leave = await LeavesModel.findById(req.params.id);
        if (!leave) {
            responseMessage(res, LEAVE_NOT_FOUND, Status.NOT_FOUND);
            return;
        }

        // Employee can't be null unless change happen no via api.
        let employee: IEmployee & {_id: mongoose.Types.ObjectId} = await EmployeeModel.findById(leave?.employeeID).lean();

        if (employee.companyID.toString() !== req.session.companyID) {
            responseMessage(res, NO_PERMISSION, Status.FORBIDDEN);
            return;
        }

        await leave.update(req.body);
        res.status(Status.OK).json(leave);
    }
}