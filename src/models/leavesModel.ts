import mongoose from 'mongoose';

export interface ILeave {
    leaveType: string,
    startDate: Date,
    numberOfDays: number;
    reason: string;
    employeeID: mongoose.Types.ObjectId;
}

export const LeaveSchema = new mongoose.Schema<ILeave>({
    leaveType: { type: String, required: true },
    startDate: { type: Date, required: true },
    numberOfDays: { type: Number, required: true },
    reason: { type: String, required: true },
    employeeID: { type: mongoose.Schema.Types.ObjectId, required: true, immutable: true}
});

export const LeavesModel = mongoose.model("leaves", LeaveSchema);