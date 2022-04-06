import {EmployeeModel} from "../models/employeeModel"
import { Request, Response, Express } from 'express'
import { Session } from 'express-session'

export default class EmployeeController {
  public static deleteEmployee(req: Request<{id: string}> & {session: Session}, res: Response) {

  }
  
  public static updateEmployee() {

  }

  public static getAllEmployees() {

  }

  public static getEmployee() {

  }


}