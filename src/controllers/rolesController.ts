import { Response, Request } from "express";
import Status from "../configurations/status";
import { controller } from "../database/controller";
import { IRole, RoleModel } from "../models/rolesModel";
import responseMessage from "../utils/responseError";
import UserController from "./userController";
import { IUser, UserModel } from "../models/userModel";

const ROLE_NOT_FOUND = "Role not found";
const USER_NOT_FOUND = "User not found";
export default class RolesController {
  public static readonly createRole = controller.createFunction(async function (
    req: Request<{}, {}, IRole>,
    res: Response
  ) {
    let role = new RoleModel({
      ...req.body,
    });
    role.validate(async function (err) {
      if (err) responseMessage(res, err.message, Status.BAD_REQUEST);
      // validation passed
      else {
        const user = await UserModel.findOne({
          username: req.session.username,
        })
          .select("-password")
          .lean();
        if (!user) {
          responseMessage(res, USER_NOT_FOUND, Status.NOT_FOUND);
          return;
        }
        user.company.roles.push(role);
        await UserModel.findOneAndUpdate(
          { username: req.session.username },
          user
        )
          .then(() => {
            res.status(Status.OK).json(role);
          })
          .catch((err: Error) => {
            responseMessage(res, err.message, Status.BAD_REQUEST);
          });
      }
    });
  });

  public static readonly deleteRole = controller.createFunction(async function (
    req: Request<{ id: string }, {}, IRole>,
    res: Response
  ) {
    const user = await UserModel.findOne({ username: req.session.username })
      .select("-password")
      .lean();

    if (!user) {
      responseMessage(res, USER_NOT_FOUND, Status.NOT_FOUND);
      return;
    }
    //Check id role
    const result = user.company.roles.filter(
      (role: any) => role?._id.toString() === req.params.id
    );
    if (result.length == 0) {
      responseMessage(res, ROLE_NOT_FOUND, Status.NOT_FOUND);
      return;
    }
    user.company.roles = user.company.roles.filter(
      (role: any) => role._id.toString() !== req.params.id
    );

    await UserModel.findOneAndUpdate({ username: req.session.username }, user)
      .then((result: any) => {
        res.status(Status.OK).json(user.company.roles);
      })
      .catch((err: Error) => {
        responseMessage(res, err.message, Status.BAD_REQUEST);
      });
  });

  public static readonly updateRole = controller.createFunction(async function (
    req: Request<{ id: string }, {}, IRole>,
    res: Response
  ) {
    //find user
    const user = await UserModel.findOne({ username: req.session.username })
      .select("-password")
      .lean();

    if (!user) {
      responseMessage(res, USER_NOT_FOUND, Status.NOT_FOUND);
      return;
    }
    //Check id role
    const result = user.company.roles.filter(
      (role: any) => role._id.toString() === req.params.id
    );
    if (result.length == 0) {
      responseMessage(res, ROLE_NOT_FOUND, Status.NOT_FOUND);
      return;
    }
    //update
    user.company.roles = user.company.roles.map((role: any) => {
      if (role._id.toString() === req.params.id) {
        role.name = req.body.name ? req.body.name : role.name;
        role.idPrefix = req.body.idPrefix ? req.body.idPrefix : role.idPrefix;
        role.idPostfix = req.body.idPostfix
          ? req.body.idPostfix
          : role.idPostfix;
        role.baseSalary = req.body.baseSalary
          ? req.body.baseSalary
          : role.baseSalary;
        role.paymentPeriod = req.body.paymentPeriod
          ? req.body.paymentPeriod
          : role.paymentPeriod;
        role.otMultiplier = req.body.otMultiplier
          ? req.body.otMultiplier
          : role.otMultiplier;
      }
      return role;
    });
    //validate new role update
    const result2 = user.company.roles.filter(
      (role: any) => role._id.toString() === req.params.id
    );
    let checkRole = new RoleModel(...result2);
    checkRole.validate(async function (err: any) {
      if (err) responseMessage(res, err.message, Status.BAD_REQUEST);
      else {
        await UserModel.findOneAndUpdate(
          { username: req.session.username },
          user
        )
          .then(() => {
            res.status(Status.OK).json(user.company.roles);
          })
          .catch((err: Error) => {
            responseMessage(res, err.message, Status.BAD_REQUEST);
          });
      }
    });
  });
  public static readonly getRoleById = controller.createFunction(
    async function (req: Request<{ id: string }, {}, IRole>, res: Response) {
      const user = await UserModel.findOne({ username: req.session.username })
        .select("-password")
        .lean();

      if (!user) {
        responseMessage(res, USER_NOT_FOUND, Status.NOT_FOUND);
        return;
      }
      const result = user.company.roles.filter(
        (role: any) => role._id.toString() === req.params.id
      );
      if (result.length == 0) {
        responseMessage(res, ROLE_NOT_FOUND, Status.NOT_FOUND);
        return;
      }
      res.status(Status.OK).json(result);
    }
  );

  public static readonly getAllRoles = controller.createFunction(
    async function (req: Request, res: Response) {
      const user = await UserModel.findOne({ username: req.session.username })
        .select("-password")
        .lean();

      if (!user) {
        responseMessage(res, USER_NOT_FOUND, Status.NOT_FOUND);
        return;
      }

      res.status(Status.OK).json(user.company.roles);
    }
  );
}
