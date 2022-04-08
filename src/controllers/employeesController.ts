import {EmployeeModel, IEmployeeFullDetail} from "../models/employeeModel"
import { Request, Response, Express, response } from 'express'
import Status from "../configurations/status";
import responseMessage from "../utils/responseError";
import { LeavesModel } from "../models/leavesModel";
import mongoose from "mongoose";

export default class EmployeeController {
  public static deleteEmployee(req: Request<{}, {}, {id: string}>, res: Response) {

  }
  
  public static updateEmployee(req: Request<{}, {}, {id: string}>, res: Response) {

  }

  public static async getAllEmployees(req: Request<{}, {}, {companyID: string, leaves: boolean, clockIns: boolean, penalties: boolean, salary: number, dept: number}>, res: Response) {
    let employees: IEmployeeFullDetail[] = await EmployeeModel.find({companyID: req.body.companyID}).lean();
    let body = req.body;
    let queryFuncs = [];

    if (!employees || employees.length === 0) {
      res.status(Status.NOT_FOUND).send();
      return;
    }

    if (body.leaves) queryFuncs.push(async (employee: IEmployeeFullDetail) => employee.leaves = await EmployeeModel.find({employeeID: employee._id}));
    if (body.clockIns) {};
    if (body.penalties) {};
    if (body.salary) {};

    for (let i = 0; i < queryFuncs.length; i++) {
      let func = queryFuncs[i];
      employees.forEach((employee) => {
        func(employee).then();
      })
    }

    res.status(Status.OK).json(employees);
  }

  public static async getEmployeeDetail(req: Request<{id: string}>, res: Response) {
    let employee = await EmployeeModel.findOne({_id: req.params.id}).lean();
    if (!employee) return;

    if (employee.companyID.toString() === req.session.companyID) {
      res.status(Status.OK).json(employee);
    } else {
      responseMessage(res, "You don't have permision for this employee", Status.FORBIDDEN);
    }
  }
}