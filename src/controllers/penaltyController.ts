import { PenaltyModel, IPenalty } from "../models/penaltiesModel";
import { EmployeeModel } from "../models/employeeModel";
import Status from '../configurations/status';
import { handleError } from "../utils/responseError";
import { Request, Response } from "express";

export default class PenaltyController {
    public static async getAllPenaltiesByCompanyID(req: Request<{comid: string}>, res: Response) {
        try {
            let employeeIDs = await EmployeeModel.find({
                companyID: req.params.comid
            }, '_id');
    
            let penalties = await PenaltyModel.find({
                employeeID: {
                    $in: employeeIDs
            }});

            res.status(Status.OK).json(penalties);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getAllPenaltiesByEmployeeID(req: Request<{empid: string}>, res: Response) {
        try {
            let penalties = await PenaltyModel.find({
                employeeID: req.params.empid
            });
            res.status(Status.OK).json(penalties);
        } catch (error) { handleError(res, error as Error); }
    }

    public static async getAllPenaltiesByEmployeeWorkID(req: Request<{comid: string, wokid: string}>, res: Response) {
        try {
            let employee = await EmployeeModel.findOne({
                workID: req.params.wokid,
                companyID: req.params.comid
            });
    
            let penalties: any = {};
            if (employee) {
                penalties = await PenaltyModel.find({
                    employeeID: employee._id
                });
            }
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