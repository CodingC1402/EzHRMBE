import mongoose from "mongoose";
import { MongooseDocumentMiddleware, MongooseQueryMiddleware } from "../configurations/mongooseMiddleWare";
import { ILeave } from "./leavesModel";
import { mongooseType } from "../utils/mongooseType";
import { objectUtils } from "../utils/objectUtils";
import { checkEmail, checkPhone } from "../utils/stringCheck";

const MODEL_NAME = 'employees';
enum Gender {
  MAN = 1,
  WOMAN = 2,
}

export interface IEmployee {
  workID: number; // The company ID
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
  gender: Gender;
  startDate: Date;
	resignDate?: Date;
  roleID: mongoose.Types.ObjectId;
	companyID: mongoose.Types.ObjectId;
  paymentDue: boolean;
}

export interface IEmployeeFullDetail extends IEmployee {
  _id: mongoose.Types.ObjectId;
  leaves: ILeave[],
  penalties: any,
  clockIns: any,
  salary: any,
}

export const EmployeeSchema = new mongoose.Schema<IEmployee>({
  workID: { type: Number, required: true, immutable: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: Number, required: true },
  startDate: {type: Date, required: true},
  resignDate: { type: Date, required: false },
  roleID: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyID: { type: mongoose.Schema.Types.ObjectId, required: true, immutable: true },
  paymentDue: { type: Boolean, required: false }
})

// Index
EmployeeSchema.index({ workID: 1, companyID: 1 }, { unique: true });


// Middle ware
const INVALID_GENDER = "Invalid gender";
const INVALID_RESIGN_DATE = "resignDate can't be before or on the startDate";
const INVALID_EMAIL_FORMAT = "Invalid email format";
const PHONE_NUMBER_CONTAINS_CHARACTER = "Phone number contains characters";

EmployeeSchema.pre(MongooseDocumentMiddleware.save, async function (next) {
  let error = checkIfValid(this.toObject());
  if (error) {
    next(error);
    return;
  }

  next();
});

EmployeeSchema.pre(MongooseQueryMiddleware.findOneAndUpdate, async function (next) {
  let employee = await EmployeeModel.findOne(this.getQuery()).lean();
  let update = this.getUpdate();

  if (!employee || !update) return;
  objectUtils.updateSelf(employee, update);
  let error = checkIfValid(employee);
  if (error) {
    next(error);
    return;
  }

  next();
});

function checkIfValid(doc: mongooseType.ObjectDocument<IEmployee>) {
  if (doc.resignDate && doc.startDate >= doc.resignDate) {
    return new Error (INVALID_RESIGN_DATE);
  }

  doc.gender = Math.floor(doc.gender);
  if (doc.gender > Gender.WOMAN || doc.gender < 1) {
    return new Error (INVALID_GENDER);
  }

  if (!checkEmail(doc.email)) {
    return new Error (INVALID_EMAIL_FORMAT);
  }

  if (!checkPhone(doc.phone)) {
    return new Error (PHONE_NUMBER_CONTAINS_CHARACTER);
  }

  return null;
}

export const EmployeeModel = mongoose.model(MODEL_NAME, EmployeeSchema);