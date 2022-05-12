import mongoose, { Types, Model } from "mongoose";
import { Time } from "../utils/date";
import { IRole, RoleSchema } from "./rolesModel";
import { IRules, RulesSchema, BasePenaltyTypes } from "./rulesModel";
import { IHoliday, HolidaySchema } from "./holidayModel";
import moment from "moment";

export interface ICompany {
  _id?: mongoose.Types.ObjectId;
  name: string;
  address: string;
  phone: string;
  rule: IRules;
  holidays: IHoliday[];
  roles: IRole[];
}

export const DefaultCompany: ICompany = {
  name: "Company name",
  address: "Your company address",
  phone: "Your company phone",
  rule: {
    startWork: Time.createTimeWithUTC0(7, 30, 0),
    endWork: Time.createTimeWithUTC0(7, 30, 0),
    allowedLateTime: Time.createTimeWithUTC0(0, 30, 0),
    maxLateTime: Time.createTimeWithUTC0(0, 30, 0),
    penaltyType: Object.keys(BasePenaltyTypes),
  },
  holidays: [
    {
      name: "Holiday",
      startDate: new Date(),
      numberOfDaysOff: 10,
      repeatYearly: true,
    },
  ],
  roles: [
    {
      name: "IT",
      idPrefix: "IT",
      idPostfix: "",
      baseSalary: 10000,
      paymentPeriod: "Monthly",
      otMultiplier: 1.5,
    },
  ],
};
type CompanyDocProps = {
  roles: Types.DocumentArray<IRole>;
  holidays: Types.DocumentArray<IHoliday>;
};
type CompanyModelType = Model<ICompany, {}, CompanyDocProps>;
export const CompanySchema = new mongoose.Schema<ICompany, CompanyModelType>({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  rule: { type: RulesSchema, required: true },
  holidays: { type: [HolidaySchema], required: true },
  roles: { type: [RoleSchema], required: true },
});
