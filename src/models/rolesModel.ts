import mongoose from "mongoose";

export interface IRole {
  name: string;
  baseSalary: number;
  paymentPeriod: string;
  otMultiplier: number;
}

export const RoleSchema = new mongoose.Schema<IRole>({
  
});