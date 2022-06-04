import {
  EmployeeModel,
  IEmployee,
  IEmployeeFullDetail,
} from "../models/employeeModel";
import { Request, Response } from "express";
import Status from "../configurations/status";
import responseMessage from "../utils/responseError";
import { LeavesModel } from "../models/leavesModel";
import { objectUtils } from "../utils/objectUtils";
import { controller } from "../database/controller";
import { UserModel } from "../models/userModel";
import { IRole } from "../models/rolesModel";
import mongoose from "mongoose";

const EMPLOYEE_DOESNT_EXIST = "Employee doesn't exists";
const NO_PERMISSION_MESSAGE = "You don't have permission for this employee";
const UNAUTHORIZED_MESSAGE = "You are not logged in";
const MIN_ID = 1;

export default class EmployeeController {
  public static readonly createEmployee = controller.createFunction<
    void,
    {},
    {},
    IEmployee
  >(async function (req, res) {
    if (!req.body.workID) {
      let newest = await EmployeeModel.find({
        companyID: req.session.companyID,
      })
        .sort("-workID")
        .limit(1)
        .lean();
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
      companyID: req.session.companyID,
    });

    await employee
      .save()
      .then(async (doc) => {
        let docObj = doc.toObject();
        let roledEmp = await assignRole(docObj);
        res.status(Status.CREATED).json(roledEmp);
      })
      .catch((error) => {
        responseMessage(res, error.toString(), Status.BAD_REQUEST);
      });
  });

  public static readonly updateEmployee = controller.createFunction<
    void,
    { id: string },
    {},
    IEmployee
  >(async function (
    req: Request<{ id: string }, {}, IEmployee>,
    res: Response
  ) {
    // Has to do this due to there is a chance that the client modified the employee object
    let employee = await EmployeeModel.findById(req.params.id);
    if (!employee) {
      res.status(Status.NOT_FOUND).send();
      return;
    }

    if (employee.companyID.toString() !== req.session.companyID) {
      EmployeeController.sendNoPermission(res);
      return;
    }

    try {
      let newEmployee = await EmployeeModel.findOneAndUpdate(
        { _id: employee._id }, 
        req.body, 
        { new: true }
      );
      
      let leanEmployee = newEmployee!.toObject();
      let roledEmployee = await assignRole(leanEmployee);
      EmployeeController.sendOk(
        res,
        roledEmployee
      );
    } catch (error) {
      //@ts-ignore
      responseMessage(res, error.toString(), Status.BAD_REQUEST);
      return;
    }
  });

  public static readonly deleteEmployee = controller.createFunction(
    async function (req: Request<{ id: string }>, res: Response) {
      let employee = await EmployeeModel.findById(req.params.id);
      if (!employee) {
        res.status(Status.NOT_FOUND).send();
        return;
      }

      if (employee.companyID.toString() === req.session.companyID) {
        await employee
          .delete()
          .catch((error: Error) =>
            responseMessage(res, error.message, Status.BAD_REQUEST)
          );
        EmployeeController.sendOk(res, employee);

        // Add deletion of leaves, penalties, rules, salaries
      } else EmployeeController.sendNoPermission(res);
    }
  );

  public static readonly getAllEmployeesDetails = controller.createFunction(
    async function (req: Request, res: Response) {
      let employees: IEmployeeFullDetail[] = await EmployeeModel.find({
        companyID: req.session.companyID,
      }).lean();

      let detailedEmployees = await Promise.all(
        employees.map(async (e) => {
          e.leaves = await LeavesModel.find({
            employeeID: e._id,
          }).lean();

          /**
           * ADD ALL OTHER DETAIL HERE
          */

          return await assignRole(e);
        })
      );

      EmployeeController.sendOk(res, detailedEmployees || []);
    }
  );

  public static readonly getAllEmployees = controller.createFunction(
    async function (req: Request, res: Response) {
      let employees: IEmployeeFullDetail[] = await EmployeeModel.find({
        companyID: req.session.companyID,
      }).lean();

      let roledEmployees = await Promise.all(
        employees.map(assignRole)
      );

      EmployeeController.sendOk(res, roledEmployees || []);
    }
  );

  public static readonly getEmployeeDetail = controller.createFunction(
    async function (req: Request<{ id: string }>, res: Response) {
      let employee: IEmployeeFullDetail = await EmployeeModel.findOne({
        _id: req.params.id,
      }).lean();
      if (!employee) {
        res.status(Status.NOT_FOUND).send();
        return;
      }

      if (employee.companyID.toString() !== req.session.companyID) {
        EmployeeController.sendNoPermission(res);
        return;
      }

      employee.leaves = await LeavesModel.find({
        employeeID: employee._id,
      }).lean();
    
      //
      // Add other details here
      //

      EmployeeController.sendOk(res, employee);
    }
  );

  public static sendNoPermission(res: Response) {
    responseMessage(res, NO_PERMISSION_MESSAGE, Status.FORBIDDEN);
  }

  public static sendOk(res: Response, result: any) {
    res.status(Status.OK).json(result);
  }

  // Will check if the req have permission for this employee, if return null then it has already responded with error.
  public static async checkIfHavePermission(
    res: Response,
    employeeID: String,
    companyID: string
  ) {
    let employee = await EmployeeModel.findById(employeeID).lean();
    if (!employee) {
      responseMessage(res, EMPLOYEE_DOESNT_EXIST, Status.NOT_FOUND);
      return null;
    }

    if (!companyID) {
      responseMessage(res, UNAUTHORIZED_MESSAGE, Status.UNAUTHORIZED);
      return null;
    }

    if (employee.companyID.toString() !== companyID) {
      responseMessage(res, NO_PERMISSION_MESSAGE, Status.FORBIDDEN);
      return null;
    }

    return employee;
  }
}

async function getRoleById(
  id: string | mongoose.Types.ObjectId, 
  companyID: string | mongoose.Types.ObjectId
) : Promise<IRole | undefined> {
  let user = await UserModel.findOne({
    "company._id": companyID
  });

  if (id instanceof mongoose.Types.ObjectId)
    id = id.toString();
  
  return user?.company.roles.find(
    (role: any) => role._id.toString() === id
  );
}

async function assignRole(employee: IEmployee): Promise<Omit<IEmployee, "roleID">> {
  (employee as any)
    .role = 
      await getRoleById(
        employee.roleID, 
        employee.companyID
      );
  const { roleID, ...e } = employee;
  return e;
}