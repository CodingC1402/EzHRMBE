import mongoose from "mongoose";
import { ILeave } from "./leavesModel";

const MODEL_NAME = 'employees';

export interface IEmployee {
  workID: number; // The company ID
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
  workID: { type: Number, required: true, unique: true, immutable: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  resignDate: { type: Date, required: false },
  roleID: { type: mongoose.Schema.Types.ObjectId }, // Add back required later.
  companyID: { type: mongoose.Schema.Types.ObjectId, required: true, immutable: true },
})

export const EmployeeModel = mongoose.model(MODEL_NAME, EmployeeSchema);