import { Response, Request } from "express";
import Status from "../configurations/status";
import { controller } from "../database/controller";
import { IHoliday, HolidayModel } from "../models/holidayModel";
import responseMessage from "../utils/responseError";
import UserController from "./userController";
import { IUser, UserModel } from "../models/userModel";

const HOLIDAY_NOT_FOUND = "Holiday not found";
const USER_NOT_FOUND = "User not found";
export default class HolidaysController {
  public static readonly createHoliday = controller.createFunction(
    async function (req: Request<{}, {}, IHoliday>, res: Response) {
      let holiday = new HolidayModel({
        ...req.body,
      });
      holiday.validate(async function (err) {
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
          user.company.holidays.push(holiday);
          await UserModel.findOneAndUpdate(
            { username: req.session.username },
            user
          )
            .then(() => {
              res.status(Status.OK).json(user);
            })
            .catch((err: Error) => {
              responseMessage(res, err.message, Status.BAD_REQUEST);
            });
        }
      });
    }
  );

  public static readonly deleteHoliday = controller.createFunction(
    async function (
      req: Request<{ name: string }, {}, IHoliday>,
      res: Response
    ) {
      const user = await UserModel.findOne({ username: req.session.username })
        .select("-password")
        .lean();

      if (!user) {
        responseMessage(res, USER_NOT_FOUND, Status.NOT_FOUND);
        return;
      }
      //Check name holiday
      const result = user.company.holidays.filter(
        (date: IHoliday) => date.name === req.params.name
      );
      if (result.length == 0) {
        responseMessage(res, HOLIDAY_NOT_FOUND, Status.NOT_FOUND);
        return;
      }
      user.company.holidays = user.company.holidays.filter(
        (date) => date.name !== req.params.name
      );

      await UserModel.findOneAndUpdate({ username: req.session.username }, user)
        .then((result: any) => {
          res.status(Status.OK).json(user);
        })
        .catch((err: Error) => {
          responseMessage(res, err.message, Status.BAD_REQUEST);
        });
    }
  );

  public static readonly updateHoliday = controller.createFunction(
    async function (
      req: Request<{ name: string }, {}, IHoliday>,
      res: Response
    ) {
      const user = await UserModel.findOne({ username: req.session.username })
        .select("-password")
        .lean();

      if (!user) {
        responseMessage(res, USER_NOT_FOUND, Status.NOT_FOUND);
        return;
      }
      //Check name holiday
      const result = user.company.holidays.filter(
        (date: IHoliday) => date.name === req.params.name
      );
      if (result.length == 0) {
        responseMessage(res, HOLIDAY_NOT_FOUND, Status.NOT_FOUND);
        return;
      }
      user.company.holidays = user.company.holidays.map(
        (dateHoliday: IHoliday) => {
          if (dateHoliday.name === req.params.name) {
            dateHoliday.name = req.body.name ? req.body.name : dateHoliday.name;
            dateHoliday.startDate = req.body.startDate
              ? new Date(req.body.startDate)
              : dateHoliday.startDate;
            dateHoliday.numberOfDaysOff = req.body.numberOfDaysOff
              ? req.body.numberOfDaysOff
              : dateHoliday.numberOfDaysOff;
            dateHoliday.repeatYearly = req.body.repeatYearly
              ? req.body.repeatYearly
              : dateHoliday.repeatYearly;
          }
          return dateHoliday;
        }
      );
      await UserModel.findOneAndUpdate({ username: req.session.username }, user)
        .then(() => {
          res.status(Status.OK).json("UPDATE_HOLIDAY_SUCCESS");
        })
        .catch((err: Error) => {
          responseMessage(res, err.message, Status.BAD_REQUEST);
        });
    }
  );
  public static readonly getHolidayByName = controller.createFunction(
    async function (
      req: Request<{ name: string }, {}, IHoliday>,
      res: Response
    ) {
      const user = await UserModel.findOne({ username: req.session.username })
        .select("-password")
        .lean();

      if (!user) {
        responseMessage(res, USER_NOT_FOUND, Status.NOT_FOUND);
        return;
      }
      const result = user.company.holidays.filter(
        (date: IHoliday) => date.name === req.params.name
      );
      if (result.length == 0) {
        responseMessage(res, HOLIDAY_NOT_FOUND, Status.NOT_FOUND);
        return;
      }
      res.status(Status.OK).json(result);
    }
  );

  public static readonly getAllHolidays = controller.createFunction(
    async function (req: Request, res: Response) {
      const user = await UserModel.findOne({ username: req.session.username })
        .select("-password")
        .lean();

      if (!user) {
        responseMessage(res, USER_NOT_FOUND, Status.NOT_FOUND);
        return;
      }

      res.status(Status.OK).json(user.company.holidays);
    }
  );
}
