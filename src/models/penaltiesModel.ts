import mongoose, {Types} from 'mongoose';

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
    deduction: {type: Number, required: true}
});

export const PenaltyModel = mongoose.model(MODEL_NAME, PenaltySchema);