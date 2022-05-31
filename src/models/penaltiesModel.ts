import mongoose, {Types} from 'mongoose';
import { MongooseDocumentMiddleware, MongooseQueryMiddleware } from '../configurations/mongooseMiddleWare';
import { UserModel } from './userModel';
import { EmployeeModel } from './employeeModel';

const MODEL_NAME = 'penalties';

export interface IPenalty {
    type: string,
    occurredAt: Date,
    employeeID: Types.ObjectId
    deduction: number,
}

export const PenaltySchema = new mongoose.Schema<IPenalty>({
    type: { type: String, required: true },
    occurredAt: { type: Date, required: true },
    employeeID: { type: mongoose.Schema.Types.ObjectId, required: true },
    deduction: {type: Number, required: true, default: 0}
});


// MIDDLEWARES
PenaltySchema.pre(MongooseDocumentMiddleware.save, async function(next) {
    await validatePenType(this);
    next();
});

PenaltySchema.pre(MongooseQueryMiddleware.findOneAndUpdate, async function(next) {
    let penalty = this.getUpdate() as IPenalty;
    await validatePenType(penalty);
    next();
});

async function validatePenType(penalty: IPenalty) {
    let employee = await EmployeeModel.findById(penalty.employeeID);
    if (!employee) throw Error('Employee not found.');

    let user = await UserModel.findOne({ 'company._id': employee.companyID });
    if (!user) throw Error('User not found...?');
    if (!user.company.rule.penaltyTypes.includes(penalty.type)) throw Error('Penalty type doesn\'t exist in company\'s penalty types');
}

export const PenaltyModel = mongoose.model(MODEL_NAME, PenaltySchema);