import { UserModel } from "../models/userModel";
import bcrypt from "bcrypt";
import UserController from "./userController";
import { checkEmail, checkString } from "../utils/stringCheck";
import { PASSWORD_RULES, USERNAME_RULES } from "../configurations/namingRules";
import { Request, Response, NextFunction, response } from "express";
import Status from "../configurations/status";
import responseMessage, { handleError } from "../utils/responseError";
import SessionAuthentication from "../security/session";
import { controller } from "../database/controller";
import { StrUtils } from "../utils/strUtils";
import { PendingRequestModel, RequestType } from "../models/pendingRequest";
import { EmailUtils } from "../utils/emailUtils";
import { SALT_ROUNDS } from "../configurations/security";
import mongoose from "mongoose";
import session from "express-session";
import { SessionModel } from "../models/sessionModel";

type loginInfo = {
	username: string,
	password: string
}

type registerInfo = {
	email: string
} & loginInfo

export default class AuthenticateController {
  public static readonly Authorize = controller.createFunction (async function (req, res, next) {
    let isAuth = SessionAuthentication.isAuthenticated(req.url, req);
    if (isAuth) {
      next();
    } else {
      res
        .status(Status.UNAUTHORIZED)
        .json({ message: "Authentication failed" });
    }
  });

  public static readonly Login = controller.createFunction<void, {}, {}, loginInfo>(async function (req, res, next) {
	  const { username, password } = req.body;
    const sessionUsername: string | undefined = req.session.username;

    if (sessionUsername === username) {
      const user = await UserModel.findOne({ username: username })
        .select("-password")
        .lean();

      if (user === null) {
        AuthenticateController.Logout(req, res, next);
      } else {
        res.status(Status.OK).json(user);
      }
      return;
    }

    const failedLogin = () =>
      res
        .status(Status.UNAUTHORIZED)
        .json({ message: "Wrong username or password" });
    const user = await UserModel.findOne({ username: username }).lean();
    if (!user) {
      failedLogin();
      return;
    }

    if (!user.verified) {
      res.status(Status.UNAUTHORIZED).json("Please verify your email before login.");
      return;
    }
    const isPassCorrect = await bcrypt.compare(password, user.password);
    if (!isPassCorrect) {
      failedLogin();
      return;
    }

    req.session.username = user.username;
    req.session.companyID = user.company._id?.toString();
    const result = {
      ...user,
      password: undefined,
    };
    res.status(Status.CREATED).send(result);
  })

  public static readonly Register = controller.createFunction<void, {}, {}, registerInfo>(async function (req, res, next) {
    const { username, email, password } = req.body;

    //Check valid username
    if (!checkString(username, USERNAME_RULES)) {
      return responseMessage(res, "Invalid username", Status.BAD_REQUEST);
    }

    //Check valid password
    if (!checkString(password, PASSWORD_RULES)) {
      return responseMessage(res, "Invalid password", Status.BAD_REQUEST);
    }

    //Validate the email here
    if (!checkEmail(email)) {
      return responseMessage(res, "Invalid Email", Status.BAD_REQUEST);
    }

    await UserController.createUser(req, res, next);
    if (res.statusCode !== Status.CREATED) return;

    let pendingRequest = new PendingRequestModel({
      type: RequestType.VERIFY_EMAIL,
      data: username
    });
    pendingRequest.save();
    let token = pendingRequest.id;

    EmailUtils.SendVerifyEmail(email, token);
  })

  public static readonly Logout = controller.createFunction(async function (req, res, next) {
    req.session.destroy((err) => {
      if (err) res.status(Status.BAD_REQUEST).send();
      else res.status(Status.NO_CONTENT).send();
    });
  })

  public static VerifyEmail = controller.createFunction(async function (req: Request<{}, {}, {}, {token: string}>, res: Response) {
    const pendingRequest = await PendingRequestModel.findById(req.query.token);
    if (!pendingRequest) {
      responseMessage(res, "Request not found", Status.NOT_FOUND);
      return;
    }

    const user = await UserModel.findOne({username: pendingRequest.data});
    if (!user) {
      responseMessage(res, "User not found", Status.NOT_FOUND);
      return;
    }

    user.verified = true;
    user.save();

    pendingRequest.remove();
    responseMessage(res, "Email verified", Status.OK);
  });

  public static ChangePassword = controller.createFunction(async function (req: Request<{}, {}, {password: string}, {token: string, logout: boolean}>, res) {
    const pendingRequest = await PendingRequestModel.findById(req.query.token);
    if (!pendingRequest) {
      responseMessage(res, "Request not found", Status.NOT_FOUND);
      return;
    }

    const user = await UserModel.findOne({username: pendingRequest.data});
    if (!user) {
      responseMessage(res, "User not found", Status.NOT_FOUND);
      return;
    }

    if (!checkString(req.body.password, PASSWORD_RULES)) {
      return responseMessage(res, "Invalid password", Status.BAD_REQUEST);
    }

    user.password = bcrypt.hashSync(req.body.password, SALT_ROUNDS);
    user.save();
 
    if (req.query.logout) {
      const session = await SessionModel.find({});
      console.log(session.length);
    }

    pendingRequest.remove();
    responseMessage(res, "user's password is changed", Status.OK);
  });

  public static RequestPasswordChange = controller.createFunction(async function (req: Request<{}, {}, {}, {username: string}>, res) {
    const user = await UserModel.findOne({username: req.query.username}).lean();
    if (!user) {
      responseMessage(res, "User not found", Status.NOT_FOUND);
      return;
    }

    let pendingRequest = new PendingRequestModel({
      type: RequestType.CHANGE_PASSWORD,
      data: req.query.username
    });
    pendingRequest.save();
    let token = pendingRequest.id;

    EmailUtils.SendChangePasswordEmail(user.email, token);
    responseMessage(res, "mail has been sent to user's email", Status.OK);
  });
}
