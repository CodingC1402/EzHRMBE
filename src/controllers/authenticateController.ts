import { UserModel } from "../models/userModel";
import bcrypt from "bcrypt";
import UserController from "./userController";
import { checkEmail, checkString } from "../utils/stringCheck";
import { PASSWORD_RULES, USERNAME_RULES } from "../configurations/namingRules";
import { Request, Response, NextFunction } from "express";
import Status from "../configurations/status";
import responseMessage from "../utils/responseError";
import SessionAuthentication from "../security/session";
import { controller } from "../database/controller";

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

    UserController.createUser(req, res, next);
  })

  public static readonly Logout = controller.createFunction(async function (req, res, next) {
    req.session.destroy((err) => {
      if (err) res.status(Status.BAD_REQUEST).send();
      else res.status(Status.NO_CONTENT).send();
    });
  })
}
