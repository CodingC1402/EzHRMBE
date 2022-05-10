import mongoose from 'mongoose';

export interface IReport {
    compileDate: Date;
    compiledUpTo: Date;
    late: number;
    leaves: number;
    absent: number;
    newHires: number;
    resignations: number;
    totalStaff: number;
    companyID: mongoose.Types.ObjectId;
}

const ReportSchema = new mongoose.Schema<IReport>({
    compileDate: { type: Date, required: true },
    compiledUpTo: { type: Date, required: true },
    late: { type: Number, required: true },
    leaves: { type: Number, required: true },
    absent: { type: Number, required: true },
    newHires: { type: Number, required: true },
    resignations: { type: Number, required: true },
    totalStaff: { type: Number, required: true },
    companyID: { type: mongoose.SchemaTypes.ObjectId, required: true, immutable: true }
});

export const ReportModel = mongoose.model<IReport>("report", ReportSchema);