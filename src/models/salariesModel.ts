import mongoose, {Types} from 'mongoose';

const MODEL_NAME = 'salaries';

export interface ISalary {
    payday: Date,
    otSalary: number,
    salary: number,
    employeeID: Types.ObjectId
}

export const SalarySchema = new mongoose.Schema({
    payday: { type: Date, required: true },
    otSalary: { type: Number, required: true},
    salary: { type: Number, required: true},
    employeeID: { type: Types.ObjectId, required: true}
});

export const SalaryModel = mongoose.model(MODEL_NAME, SalarySchema);