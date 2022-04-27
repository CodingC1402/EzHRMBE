import mongoose from "mongoose";
import {Time} from "../utils/date";
import { IRole } from "./rolesModel";
import { IRules, RulesSchema } from "./rulesModel";

export interface ICompany {
  _id?: mongoose.Types.ObjectId;
  name: string;
  address: string;
  phone: string;
  rule: IRules;
  holidays: Date[];
  roles: IRole[];
}

export const DefaultCompany: ICompany = {
  name: "Company name",
  address: "Your company address",
  phone: "Your company phone",
  rule: {
    startWork: Time.createTimeWithUTC0(7, 30, 0),
    endWork: Time.createTimeWithUTC0(7, 30, 0, ),
    allowedLateTime: Time.createTimeWithUTC0(0, 30, 0),
    maxLateTime: Time.createTimeWithUTC0(0, 30, 0),
    penaltyType: ['Late', 'Absent']
  },
  holidays: [],
  roles: [{
    name: "IT",
    idPrefix: "IT",
    idPostfix: "",
    baseSalary: 10000,
    paymentPeriod: "Wtf?",
    otMultiplier: 1.5
  }]
};

export const CompanySchema = new mongoose.Schema<ICompany>({
  name: { type: String, required: true},
  address: { type: String, required: true},
  phone: { type: String, required: true},
  rule: { type: RulesSchema, required: true },
  holidays: { type: [Date] },
  roles: {  }
});
