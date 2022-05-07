import mongoose from "mongoose";

export enum BasePenaltyTypes {
  Late = "Late",
  Absent = "Absent"
}

// We don't have time here
export interface IRules {
  startWork: Date;
  endWork: Date;
  allowedLateTime: Date;
  maxLateTime: Date;
  penaltyType: string[];
}

export const RulesSchema = new mongoose.Schema<IRules>({
  startWork: { type: Date, required: true },
  endWork: { type: Date, required: true },
  allowedLateTime: { type: Date, required: true},
  maxLateTime: { type: Date, required: true },
  penaltyType: { type: [String], required: true }
})