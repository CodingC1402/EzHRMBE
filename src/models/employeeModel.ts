import mongoose from "mongoose";

export interface IEmployee {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	resignDate?: Date;
  roleID: mongoose.Schema.Types.ObjectId;
	companyID: string;
}

export const EmployeeSchema = new mongoose.Schema<IEmployee>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  resignDate: { type: Date, required: false },
  roleID: { type: mongoose.Schema.Types.ObjectId, required: true },
})

export const EmployeeModel = mongoose.model('employees', EmployeeSchema);