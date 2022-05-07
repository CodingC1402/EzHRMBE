import mongoose from "mongoose";
import { Time } from "../utils/date";
import { IRole } from "./rolesModel";
import { IRules, RulesSchema } from "./rulesModel";
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
type CompanyDocumentProps = {
  holidays: mongoose.Types.DocumentArray<IHoliday>;
};

type CompanyModelType = mongoose.Model<ICompany, {}, CompanyDocumentProps>;

export const DefaultCompany: ICompany = {
  name: "Company name",
  address: "Your company address",
  phone: "Your company phone",
  rule: {
    startWork: Time.createTimeWithUTC0(7, 30, 0),
    endWork: Time.createTimeWithUTC0(7, 30, 0),
    allowedLateTime: Time.createTimeWithUTC0(0, 30, 0),
    maxLateTime: Time.createTimeWithUTC0(0, 30, 0),
    penaltyType: ["Late", "Absent"],
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
      paymentPeriod: "Wtf?",
      otMultiplier: 1.5,
    },
  ],
};

export const CompanySchema = new mongoose.Schema<ICompany, CompanyModelType>({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  rule: { type: RulesSchema, required: true },
  holidays: [HolidaySchema],
  roles: {},
});
