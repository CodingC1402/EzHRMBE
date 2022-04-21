import { Response, Request } from "express";
import mongoose from "mongoose";
import Status from "../configurations/status";
import { controller } from "../database/controller";
import { EmployeeModel, IEmployee } from "../models/employeeModel";
import { ILeave, LeavesModel } from "../models/leavesModel";
import responseMessage from "../utils/responseError";
import EmployeeController from "./employeesController";

const LEAVE_NOT_FOUND = "Leave not found";
const EMPLOYEE_ID_EMPTY = "employeeID can't be empty";

export default class LeavesController {
  public static readonly create = controller.createFunction(async function (
    req: Request<{}, {}, ILeave>,
    res: Response
  ) {
    let leave = new LeavesModel({
      ...req.body,
    });

    //@ts-ignore
    let companyID: string = req.session.companyID;
    if (!leave.employeeID) {
      responseMessage(res, EMPLOYEE_ID_EMPTY, Status.BAD_REQUEST);
      return;
    }

    if (
      !(await EmployeeController.checkIfHavePermission(
        res,
        leave.employeeID.toString(),
        companyID
      ))
    ) {
      return;
    }

    await leave
      .save()
      .then((result) => {
        res.status(Status.CREATED).json(result);
      })
      .catch((err: Error) => {
        responseMessage(res, err.message, Status.BAD_REQUEST);
      });
  });

  public static readonly delete = controller.createFunction(async function (
    req: Request<{ id: string }, {}, ILeave>,
    res: Response
  ) {
    let leave = await LeavesModel.findById(req.params.id);
    if (!leave) {
      responseMessage(res, LEAVE_NOT_FOUND, Status.NOT_FOUND);
      return;
    }

    //@ts-ignore
    let companyID: string = req.session.companyID;
    if (
      !(await EmployeeController.checkIfHavePermission(
        res,
        leave?.employeeID.toString(),
        companyID
      ))
    ) {
      return;
    }

    await leave.delete();
    res.status(Status.OK).json(leave.toObject());
  });

  public static readonly update = controller.createFunction(async function (
    req: Request<{ id: string }, {}, ILeave>,
    res: Response
  ) {
    let leave = await LeavesModel.findById(req.params.id);
    if (!leave) {
      responseMessage(res, LEAVE_NOT_FOUND, Status.NOT_FOUND);
      return;
    }

    //@ts-ignore
    let companyID: string = req.session.companyID;
    if (
      !(await EmployeeController.checkIfHavePermission(
        res,
        leave?.employeeID.toString(),
        companyID
      ))
    ) {
      return;
    }

    await LeavesModel.findOneAndUpdate({ _id: leave._id }, req.body)
      .then(() => {
        res.status(Status.OK).json(leave);
      })
      .catch((err: Error) => {
        responseMessage(res, err.message, Status.BAD_REQUEST);
      });
  });

  public static readonly getAllLeavesOfEmployee = controller.createFunction(
    async function (req: Request<{ id: string }, {}, ILeave>, res: Response) {
      //@ts-ignore
      let companyID: string = req.session.companyID;
      let employee = await EmployeeController.checkIfHavePermission(
        res,
        req.params.id.toString(),
        companyID
      );

      if (!employee) return;

      let leaves = await LeavesModel.find({
        employeeID: new mongoose.Types.ObjectId(req.params.id),
      });
      res.status(Status.OK).json(leaves || []);
    }
  );
}
