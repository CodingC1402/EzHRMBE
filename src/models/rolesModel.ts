import mongoose from "mongoose";

export enum PaymentPeriod {
  Hourly = "Hourly",
  Monthly = "Monthly",
}

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
  idPrefix: { type: String, required: false },
  idPostfix: { type: String, required: false }, // Add postfix to employee workID
  baseSalary: { type: Number, required: true },
  paymentPeriod: {
    type: String,
    required: true,
    enum: Object.keys(PaymentPeriod),
  },
  otMultiplier: { type: Number, required: true },
});
export const RoleModel = mongoose.model("roles", RoleSchema);
