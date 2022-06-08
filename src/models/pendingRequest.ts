import mongoose from "mongoose";
import { StrUtils } from "../utils/strUtils";

const MODEL_NAME = "pendingRequest";

export enum RequestType {
    CHANGE_PASSWORD = 1,
    VERIFY_EMAIL = 2,
}

export interface IPendingRequest {
    type: RequestType,
    data: string,
}

export const PendingRequestSchema = new mongoose.Schema<IPendingRequest>({
    type: {type: Number, required: true},
    data: {type: String, required: true}
});

export const PendingRequestModel = mongoose.model<IPendingRequest>(MODEL_NAME, PendingRequestSchema);