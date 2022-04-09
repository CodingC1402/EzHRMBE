import {
  EmployeeModel,
  IEmployee,
  IEmployeeFullDetail,
} from "../models/employeeModel";
import { Request, Response, Express, response } from "express";
import Status from "../configurations/status";
import responseMessage from "../utils/responseError";
import { LeavesModel } from "../models/leavesModel";
import mongoose, { Types } from "mongoose";

const NO_PERMISSION_MESSAGE = "You don't have permission for this employee";
const NO_EMPLOYEE_MESSAGE = "The company doesn't have any employee";
const MIN_ID = 1;

export default class EmployeeController {
  public static async createEmployee(
    req: Request<{}, {}, IEmployee>,
    res: Response
  ) {
    if (!req.body.workID) {
      let newest = await EmployeeModel.find({companyID: req.session.companyID}).sort("-workID").limit(1).lean();
      if (newest[0]) {
        req.body.workID = newest[0].workID + 1;
      } else {
        req.body.workID = MIN_ID;
      }
    } else {
      let value = Math.floor(req.body.workID);
      req.body.workID = value < MIN_ID ? MIN_ID : value;
    }

    let employee = new EmployeeModel({
      ...req.body,
      roleID: undefined,
      companyID: req.session.companyID,
    });

    employee
      .save()
      .then((doc) => {
        res.status(Status.OK).json(doc.toObject());
      })
      .catch((error) => {
        responseMessage(res, error.toString(), Status.BAD_REQUEST);
      });
  }

  public static async updateEmployee(
    req: Request<{ id: string }, {}, IEmployee>,
    res: Response
  ) {
    // Has to do this due to there is a chance that the client modified the employee object
    let employee = await EmployeeModel.findById(req.params.id);
    if (!employee) {
      res.status(Status.NOT_FOUND).send();
      return;
    };

    if (employee.companyID.toString() !== req.session.companyID) {
      EmployeeController.sendNoPermission(res);
      return;
    }

    let updateInfo = {
      ...req.body,
    };

    try {
      await employee.updateOne(updateInfo);
    } catch (error) {
      //@ts-ignore
      responseMessage(res, error.toString(), Status.BAD_REQUEST);
      return;
    }

    EmployeeController.sendOk(res, employee);
  }

  public static async deleteEmployee(
    req: Request<{ id: string }>,
    res: Response
  ) {
    let employee = await EmployeeModel.findById(req.params.id);
    if (!employee) {
      res.status(Status.NOT_FOUND).send();
      return;
    };

    if (employee.companyID.toString() === req.session.companyID) {
      employee
        .delete()
        .catch((error: Error) =>
          responseMessage(res, error.message, Status.BAD_REQUEST)
        );
      EmployeeController.sendOk(res, employee);

      // Add deletion of leaves, penalties, rules, salaries
    } else EmployeeController.sendNoPermission(res);
  }

  public static async getAllEmployeesDetails(req: Request, res: Response) {
    let employees: IEmployeeFullDetail[] = await EmployeeModel.find({
      companyID: req.session.companyID,
    }).lean();

    for (let i = 0; i < employees.length; i++) {
      let employee = employees[i];
      employee.leaves = await LeavesModel.find({ employeeID: employee._id }).lean();
    }

    if (!employees || employees.length === 0) {
      res.status(Status.NOT_FOUND).send();
      return;
    }

    EmployeeController.sendOk(res, employees);
  }

  public static async getAllEmployees(req: Request, res: Response) {
    let employees: IEmployeeFullDetail[] = await EmployeeModel.find({
      companyID: req.session.companyID,
    }).lean();

    if (!employees || employees.length === 0) {
      responseMessage(res, NO_EMPLOYEE_MESSAGE, Status.NOT_FOUND);
      return;
    }

    EmployeeController.sendOk(res, employees);
  }

  public static async getEmployeeDetail(
    req: Request<{ id: string }>,
    res: Response
  ) {
    let employee: IEmployeeFullDetail = await EmployeeModel.findOne({ _id: req.params.id }).lean();
    if (!employee) {
      res.status(Status.NOT_FOUND).send();
      return;
    };

    if (employee.companyID.toString() !== req.session.companyID) {
      EmployeeController.sendNoPermission(res);
      return;
    }
    
    employee.leaves = await LeavesModel.find({ employeeID: employee._id }) .lean();
    EmployeeController.sendOk(res, employee);
  }

  public static sendNoPermission(res: Response) {
    responseMessage(res, NO_PERMISSION_MESSAGE, Status.FORBIDDEN);
  }

  public static sendOk(res: Response, result: any) {
    res.status(Status.OK).json(result);
  }
}
