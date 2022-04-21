import { Response, Request } from 'express';
import mongoose from 'mongoose';
import Status from '../configurations/status';
import { EmployeeModel, IEmployee } from '../models/employeeModel';
import { ILeave, LeavesModel } from '../models/leavesModel';
import responseMessage from '../utils/responseError';
import EmployeeController from './employeesController';

const LEAVE_NOT_FOUND = "Leave not found";


export default class LeavesController {  
    public static async create(req: Request<{}, {}, ILeave>, res: Response) {
        let leave = new LeavesModel({
            ...req.body
        });

        //@ts-ignore
        let companyID: string = req.session.companyID;
        if (!await EmployeeController.checkIfHavePermission(res, leave?.employeeID.toString(), companyID)) {
            return;
        }

        leave.save()
        .then((result) => {
            res.status(Status.CREATED).json(result);
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

        //@ts-ignore
        let companyID: string = req.session.companyID;
        if (!await EmployeeController.checkIfHavePermission(res, leave?.employeeID.toString(), companyID)) {
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

        //@ts-ignore
        let companyID: string = req.session.companyID;
        if (!await EmployeeController.checkIfHavePermission(res, leave?.employeeID.toString(), companyID)) {
            return;
        }

        await leave.update(req.body);
        res.status(Status.OK).json(leave);
    }

    public static async getAllLeavesOfEmployee(req: Request<{id: string}, {}, ILeave>, res: Response) {
        //@ts-ignore
        let companyID: string = req.session.companyID;
        let employee = await EmployeeController.checkIfHavePermission(res, req.params.id.toString(), companyID);

        if (!employee) return;

        let leaves = LeavesModel.find({employeeID: new mongoose.Types.ObjectId(req.params.id)});
        res.status(Status.OK).json(leaves || []);
    }
}