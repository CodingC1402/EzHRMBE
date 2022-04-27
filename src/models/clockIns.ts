import mongoose from 'mongoose';

export interface IClockIn {
    clockedIn: Date;
    clockedOut?: Date;
    normalWorkHours: number;
    otWorkHours: number;
    employeeID: mongoose.Types.ObjectId;
}

const ClockInSchema = new mongoose.Schema<IClockIn>({
    clockedIn: {type: Date, required: true, immutable: true},
    clockedOut: {type: Date, required: false},
    normalWorkHours: {type: Number, required: false},
    otWorkHours: {type: Number, required: false},
    employeeID: {type: mongoose.Schema.Types.ObjectId, required: true, immutable: true}
})

export const ClockInModel = mongoose.model<IClockIn>('clockin', ClockInSchema);