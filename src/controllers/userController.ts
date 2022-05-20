import { DefaultCompany, ICompany } from "../models/companyModel";
import { handleError } from "../utils/responseError";
import { IUser, UserModel } from "../models/userModel";
import { IRules } from "../models/rulesModel";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../configurations/security";
import { Request, Response, NextFunction } from "express";
import Status from "../configurations/status";
import responseMessage from "../utils/responseError";
import { controller } from "../database/controller";

export default class UserController {
  public static readonly createUser = controller.createFunction<
    void,
    {},
    {},
    { username: string; password: string; email: string }
  >(async function (req: Request, res: Response, next: NextFunction) {
    const { username, password, email } = req.body;
    let user = await UserModel.findOne({ username: username });

    if (user) {
      responseMessage(res, "User already exists", Status.CONFLICT);
      return;
    }

    const encryptedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

    user = new UserModel({
      username: username,
      password: encryptedPassword,
      email: email,
      company: DefaultCompany,
    });
    try {
      let info = {
        ...(await user.save()).toObject(),
        password: undefined,
      };
      res.status(Status.CREATED).json(info);
    } catch (err) {
      console.log(err);
      //@ts-ignore
      let error: Error = error;
      responseMessage(res, error.message, Status.BAD_REQUEST);
    }
  });

  public static readonly getUser = controller.createFunction(async function (req: Request, res: Response, next: NextFunction) {
    const user = await UserModel.findOne({ username: req.session.username })
      .select("-password")
      .lean();
    if (!user) {
      responseMessage(res, "User not found", Status.NOT_FOUND);
    }

    res.status(Status.OK).send(user);
  });

  public static async updateCompanyInfo(
    req: Request<
      {},
      {},
      { name: string, address: string, phone: string }
    >,
    res: Response
  ) {
    try {
      let user = await UserModel.findOneAndUpdate(
        { "company._id": req.session.companyID },
        {
          "company.name": req.body.name,
          "company.address": req.body.address,
          "company.phone": req.body.phone
        },
        { new: true }
      );
      if (!user) {
        throw new Error("Cannot find user with specified company ID.");
      }
      res.status(Status.OK).json(user.company);
    } catch (error) { handleError(res, error as Error); }
  }

  public static async updateCompanyRule(
    req: Request<
      {},
      {},
      IRules
    >,
    res: Response
  ) {
    try {
      let user = await UserModel.findOneAndUpdate(
        { "company._id": req.session.companyID },
        {
          "company.rule.startWork": req.body.startWork,
          "company.rule.endWork": req.body.endWork,
          "company.rule.allowedLateTime": req.body.allowedLateTime,
          "company.rule.maxLateTime": req.body.maxLateTime
        },
        { new: true }
      );
      if (!user) {
        throw new Error("Cannot find user with specified company ID.");
      }
      res.status(Status.OK).json(user.company.rule);
    } catch (error) { handleError(res, error as Error); }
  }

  public static async createPenaltyType(
    req: Request<
      {},
      {},
      { penalty: string }
    >,
    res: Response
  ) {
    try {
      let user = await UserModel.findOne({
        "company._id": req.session.companyID
      });
      if (!user) {
        throw new Error("Cannot find user with specified company ID.");
      }
      if (user.company.rule.penaltyTypes.includes(req.body.penalty)) {
        throw new Error("Penalty type already exists for company.");
      }

      user.company.rule.penaltyTypes.push(req.body.penalty);
      await user.save();
      res.status(Status.OK).json(user.company.rule.penaltyTypes);
    } catch (error) { handleError(res, error as Error); }
  }

  public static async deletePenaltyType(
    req: Request<{ penalty: string }>,
    res: Response
  ) {
    try {
      let user = await UserModel.findOne({
        "company._id": req.session.companyID
      });
      if (!user) {
        throw new Error("Cannot find user with specified company ID.");
      }
      if (!user.company.rule.penaltyTypes.includes(req.params.penalty)) {
        throw new Error("Penalty type does not exist for company.");
      }

      let index = user.company.rule.penaltyTypes.indexOf(req.params.penalty);
      user.company.rule.penaltyTypes.splice(index, 1);
      await user.save();
      res.status(Status.OK).json(user.company.rule.penaltyTypes);
    } catch (error) { handleError(res, error as Error); }
  }
}
