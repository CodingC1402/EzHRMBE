import mongoose from 'mongoose';

const MODEL_NAME = 'salaries';

export interface ISalary {
    payday: Date,
    otSalary: number,
    salary: number,
    employeeID: mongoose.Types.ObjectId
}

export const SalarySchema = new mongoose.Schema<ISalary>({
    payday: { type: Date, required: true },
    otSalary: { type: Number, required: true},
    salary: { type: Number, required: true},
    employeeID: { type: mongoose.SchemaTypes.ObjectId, required: true}
});

export const SalaryModel = mongoose.model(MODEL_NAME, SalarySchema);