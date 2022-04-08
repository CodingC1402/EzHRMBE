import mongoose from "mongoose";

export interface IRole {
  name: string;
  baseSalary: number;
  paymentPeriod: string;
  otMultiplier: number;
}

export const RoleSchema = new mongoose.Schema<IRole>({
  name: { type: String, required: true },
  baseSalary: { type: Number, required: true },
  paymentPeriod: { type: String, required: true},
  otMultiplier: {type: Number, required: true }
});