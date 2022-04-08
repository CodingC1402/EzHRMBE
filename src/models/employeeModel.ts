import mongoose from "mongoose";
import { ILeave } from "./leavesModel";

const MODEL_NAME = 'employees';

export interface IEmployee {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	resignDate?: Date;
  roleID: mongoose.Types.ObjectId;
	companyID: mongoose.Types.ObjectId;
}

export interface IEmployeeFullDetail extends IEmployee {
  _id: mongoose.Types.ObjectId;
  leaves: ILeave[],
  penalties: any,
  clockIns: any,
  salary: any,
}

export const EmployeeSchema = new mongoose.Schema<IEmployee>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  resignDate: { type: Date, required: false },
  roleID: { type: mongoose.Schema.Types.ObjectId },
  companyID: { type: mongoose.Schema.Types.ObjectId, required: true },
})

export const EmployeeModel = mongoose.model(MODEL_NAME, EmployeeSchema);