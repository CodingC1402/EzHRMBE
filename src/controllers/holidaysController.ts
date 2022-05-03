import { Response, Request } from "express";
import Status from "../configurations/status";
import { controller } from "../database/controller";
import { IHoliday, HolidayModel } from "../models/holidayModel";
import responseMessage from "../utils/responseError";

const HOLIDAY_NOT_FOUND = "Holiday not found";

export default class HolidaysController {
  public static readonly createHoliday = controller.createFunction(
    async function (req: Request<{}, {}, IHoliday>, res: Response) {
      let holiday = new HolidayModel({
        ...req.body,
      });

      await holiday
        .save()
        .then((result) => {
          res.status(Status.CREATED).json(result);
        })
        .catch((err: Error) => {
          responseMessage(res, err.message, Status.BAD_REQUEST);
        });
    }
  );

  public static readonly deleteHoliday = controller.createFunction(
    async function (req: Request<{ id: string }, {}, IHoliday>, res: Response) {
      let holiday = await HolidayModel.findById(req.params.id);
      if (!holiday) {
        responseMessage(res, HOLIDAY_NOT_FOUND, Status.NOT_FOUND);
        return;
      }
      await holiday.delete();
      res.status(Status.OK).json(holiday.toObject());
    }
  );

  public static readonly updateHoliday = controller.createFunction(
    async function (req: Request<{ id: string }, {}, IHoliday>, res: Response) {
      let holiday = await HolidayModel.findById(req.params.id);
      if (!holiday) {
        responseMessage(res, HOLIDAY_NOT_FOUND, Status.NOT_FOUND);
        return;
      }
      await HolidayModel.findOneAndUpdate({ _id: holiday._id }, req.body)
        .then(() => {
          res.status(Status.OK).json(holiday);
        })
        .catch((err: Error) => {
          responseMessage(res, err.message, Status.BAD_REQUEST);
        });
    }
  );
  public static readonly getHolidayByID = controller.createFunction(
    async function (req: Request<{ id: string }, {}, IHoliday>, res: Response) {
      let holiday = await HolidayModel.findById(req.params.id)
        .then((result) => {
          if (!result) {
            responseMessage(res, HOLIDAY_NOT_FOUND, Status.NOT_FOUND);
            return;
          }
          res.status(Status.OK).json(result);
        })
        .catch((err: Error) => {
          responseMessage(res, err.message, Status.BAD_REQUEST);
        });
    }
  );

  public static readonly getAllHolidays = controller.createFunction(
    async function (req: Request, res: Response) {
      let holidays: IHoliday[] = await HolidayModel.find({
        companyID: req.session.companyID,
      }).lean();

      res.status(Status.OK).json(holidays || []);
    }
  );
}
