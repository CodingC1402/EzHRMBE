import mongoose from "mongoose";

export interface IHoliday {
  name: string;
  startDate: Date;
  numberOfDaysOff: number;
  repeatYearly: boolean;
}

export const HolidaySchema = new mongoose.Schema<IHoliday>({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  numberOfDaysOff: { type: Number, required: true },
  repeatYearly: { type: Boolean, required: true },
});

export const HolidayModel = mongoose.model("holidays", HolidaySchema);
