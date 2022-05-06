import { DefaultCompany } from "../models/companyModel";
import { IUser, UserModel } from "../models/userModel";
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
}
