import { PenaltyModel, IPenalty } from "../models/penaltiesModel";
import { EmployeeModel } from "../models/employeeModel";
import Status from '../configurations/status';
import { handleError } from "../utils/responseError";
import { Request, Response } from "express";
import { addDateRangeFilter, addDateRangeFilterAggregate } from "../utils/queryHelpers";
import mongoose from "mongoose";

export default class PenaltyController {
    public static async getAccumulatedDeductionByEmployeeID(req: Request<{empid: string}>, res: Response) {
        try {
            let aggre = PenaltyModel.aggregate([
                { $match: 
                    { employeeID: new mongoose
                                    .Types
                                    .ObjectId(req.params.empid) }
                }
            ]);
            aggre = addDateRangeFilterAggregate(req.query.startDate, req.query.endDate, aggre, "occurredAt");

            aggre.group({
                _id: "$employeeID",
                totalDeduction: { $sum: "$deduction" }
            });
            let totalDeduction = await aggre;
            res.status(Status.OK).json(totalDeduction);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getAllPenaltiesByCompanyID(req: Request, res: Response) {
        try {
            let employeeIDs = await EmployeeModel.find({
                companyID: req.session.companyID
            }, '_id');
    
            let query = PenaltyModel.find({
                employeeID: {
                    $in: employeeIDs
            }});
            query = addDateRangeFilter(req, query, "occurredAt");

            let penalties = await query;
            res.status(Status.OK).json(penalties);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getAllPenaltiesByEmployeeID(req: Request<{empid: string}>, res: Response) {
        try {
            let query = PenaltyModel.find({
                employeeID: req.params.empid
            });
            query = addDateRangeFilter(req, query, "occurredAt");

            let penalties = await query;
            res.status(Status.OK).json(penalties);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getAllPenaltiesByEmployeeWorkID(req: Request<{ workid: string }>, res: Response) {
        try {
            let employeeID = await EmployeeModel.findOne({
                workID: req.params.workid,
                companyID: req.session.companyID
            }, '_id');
    
            let query = PenaltyModel.find({
                employeeID: employeeID
            });
            query = addDateRangeFilter(req, query, "occurredAt");

            let penalties = await query;
            res.status(Status.OK).json(penalties);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async createPenalty(req: Request<{}, {}, IPenalty>, res: Response) {
        let penalty = new PenaltyModel({
            ...req.body
        });

        try {
            await penalty.save();
            res.status(Status.OK).json(penalty);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async updatePenalty(req: Request<{id: string}, {}, IPenalty>, res: Response) {
        try {
            let updatedPen = await PenaltyModel.findByIdAndUpdate(
                req.params.id, 
                { ...req.body },
                { new: true }   
            );
            
            res.status(Status.OK).json(updatedPen ? updatedPen : {});
        } catch (error) { handleError(res, error as Error); }
    }

    public static async deletePenalty(req: Request<{id: string}>, res: Response) {
        try {
            let result = await PenaltyModel.deleteOne({
                _id: req.params.id
            });
    
            res.status(Status.OK).json(result);
        } catch (error) { handleError(res, error as Error); }
    }
}