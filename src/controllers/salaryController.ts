import { SalaryModel, ISalary } from "../models/salariesModel";
import Status from '../configurations/status';
import { handleError } from "../utils/responseError";
import { Request, Response } from "express";
import { addDateRangeFilter } from "../utils/queryHelpers";
import { EmployeeModel } from "../models/employeeModel";
import { PaymentPeriod } from "../models/rolesModel";
import { DateTime } from "luxon";
import mongoose from "mongoose";

export default class SalaryController {
    public static async getSalariesByCompanyID(req: Request<{ compid: string }>, res: Response) {
        try {
            let employeeIDs = await EmployeeModel.findOne({
                companyID: req.params.compid
            }, "_id");

            let query = SalaryModel.find({
                employeeID: { $in: employeeIDs }
            });
            query = addDateRangeFilter(req, query, "payday");
            
            let salaries = await query;
            res.status(Status.OK).json(salaries);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getSalariesByEmployeeID(req: Request<{ empid: string }>, res: Response) {
        try {
            let query = SalaryModel.find({
                employeeID: req.params.empid
            });
            query = addDateRangeFilter(req, query, "payday");
            
            let salaries = await query;
            res.status(Status.OK).json(salaries);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getSalariesByEmployeeWorkID(req: Request<{ compid: string, workid: string }>, res: Response) {
        try {
            let employeeIDs = await EmployeeModel.findOne({
                companyID: req.params.compid,
                workID: req.params.workid
            }, "_id");

            let query = SalaryModel.find({
                employeeID: { $in: employeeIDs }
            });
            query = addDateRangeFilter(req, query, "payday");
            
            let salaries = await query;
            res.status(Status.OK).json(salaries);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async createSalary(req: Request<{}, {}, ISalary>, res: Response) {
        try {
            let employeeAggr = await EmployeeModel.aggregate([
                { $match: 
                    { _id: new mongoose.Types.ObjectId(req.body.employeeID) }
                },
                { $lookup: {
                    from: "users",
                    let: { roleID: "$roleID" },
                    pipeline: [
                        { $unwind: "$company.roles" },
                        { $match: 
                            { $expr: 
                                { $eq: [ "$company.roles._id", "$$roleID" ] }
                            }
                        },
                        { $replaceRoot: {
                            newRoot: "$company.roles"
                        } }
                    ],
                    as: "role"
                } },
                { $unwind: "$role" }
            ]);
            if (!employeeAggr) {
                throw new Error("Cannot find an employee with specified Id.");
            }
            
            let existingSalary = await SalaryModel
              .findOne({ employeeID: req.body.employeeID })
              .sort({ payday: -1 })
              .limit(1);

            let employee = employeeAggr[0];
            let endOfPayPeriod = DateTime.fromJSDate(employee.startDate);
            let payday = DateTime.fromJSDate(new Date(req.body.payday));
            if (existingSalary) {
                endOfPayPeriod = DateTime
                    .fromJSDate(existingSalary.payday);
                if (employee.role.paymentPeriod === PaymentPeriod.Monthly) {
                    endOfPayPeriod = endOfPayPeriod
                    .plus({ months: 1 });
                }
            }
            if (payday.diff(endOfPayPeriod, "days").days < 0) {
                throw new Error(`Employee's pay period hasn't come yet, next pay period: ${endOfPayPeriod.toLocaleString()}.`);
            }

            let salary = new SalaryModel({
                ...req.body
            });
            await salary.save();
            
            let result = await EmployeeModel.updateOne(
                { _id: employee._id },
                { $set: { paymentDue: false } }
            );
            res.status(Status.CREATED);
            if (result.modifiedCount) {
                res.json({
                    createdSalary: salary,
                    message: "Employee payment due removed."
                });
            }
            else res.json(salary);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async updateSalary(req: Request<{id: string}, {}, ISalary>, res: Response) {
        try {
            let updated = await SalaryModel.findByIdAndUpdate(
                req.params.id, 
                { $set: {
                    salary: req.body.salary,
                    otSalary: req.body.otSalary
                } }
            );
            if (!updated) {
                throw new Error("Cannot find a salary record with specified Id.");
            }
            res.status(Status.OK).json(updated);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async deleteSalary(req: Request<{id: string}>, res: Response) {
        try {
            let deleted = await SalaryModel.findByIdAndDelete(
                req.params.id
            );
            if (!deleted) {
                throw new Error("Cannot find a salary record with specified Id.");
            }
            res.status(Status.OK).json(deleted);
        } catch (error) { handleError(res, error as Error); }
    }
}