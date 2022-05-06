import { PenaltyModel, IPenalty } from "../models/penaltiesModel";
import { EmployeeModel } from "../models/employeeModel";
import Status from '../configurations/status';
import { handleError } from "../utils/responseError";
import { query, Request, Response } from "express";
import { addDateRangeFilter } from "../utils/queryHelpers";

export default class PenaltyController {
    public static async getAllPenaltiesByCompanyID(req: Request<{compid: string}>, res: Response) {
        try {
            let employeeIDs = await EmployeeModel.find({
                companyID: req.params.compid
            }, '_id');
    
            let query = PenaltyModel.find({
                employeeID: {
                    $in: employeeIDs
            }});
            let result = addDateRangeFilter(req, res, query, "occurredAt");
            if (result) query = result;
            else return;

            let penalties = await query;
            res.status(Status.OK).json(penalties);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getAllPenaltiesByEmployeeID(req: Request<{id: string}>, res: Response) {
        try {
            let query = PenaltyModel.find({
                employeeID: req.params.id
            });
            let result = addDateRangeFilter(req, res, query, "occurredAt");
            if (result) query = result;
            else return;

            let penalties = await query;
            res.status(Status.OK).json(penalties);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getAllPenaltiesByEmployeeWorkID(req: Request<{compid: string, workid: string}>, res: Response) {
        try {
            let employeeID = await EmployeeModel.findOne({
                workID: req.params.workid,
                companyID: req.params.compid
            }, '_id');
    
            let query = PenaltyModel.find({
                employeeID: employeeID
            });
            let result = addDateRangeFilter(req, res, query, "occurredAt");
            if (result) query = result;
            else return;

            let penalties = await query;
            res.status(Status.OK).json(penalties);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async createPenalty(req: Request<{}, {}, IPenalty>, res: Response) {
        let penalty = new PenaltyModel({
            type: req.body.type,
            occurredAt: req.body.occurredAt,
            employeeID: req.body.employeeID,
            deduction: req.body.deduction
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