import mongoose from "mongoose";

export interface IHoliday {
  nameHoliday: string;
  startDate: Date;
  numberOfDayOff: number;
  repeat: boolean;
}

export const HolidaySchema = new mongoose.Schema<IHoliday>({
  nameHoliday: { type: String, required: true },
  startDate: { type: Date, required: true },
  numberOfDayOff: { type: Number, required: true },
  repeat: { type: Boolean, required: true },
});

export const HolidaysModel = mongoose.model("holidays", HolidaySchema);
