import mongoose from "mongoose";

export interface IRole {
  name: string;
  idPrefix: string; // Add prefix to employee workID
  idPostfix: string; // Add postfix to employee workID
  baseSalary: number;
  paymentPeriod: string;
  otMultiplier: number;
}

export const RoleSchema = new mongoose.Schema<IRole>({
  name: { type: String, required: true },
  idPrefix: {type: String, required: true },
  idPostfix: {type: String, required: true}, // Add postfix to employee workID
  baseSalary: { type: Number, required: true },
  paymentPeriod: { type: String, required: true},
  otMultiplier: {type: Number, required: true }
});