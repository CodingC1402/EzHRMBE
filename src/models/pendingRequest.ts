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
    token: string,
}

export const PendingRequestSchema = new mongoose.Schema<IPendingRequest>({
    type: {type: Number, required: true},
    data: {type: String, required: true},
    token: {type: String, require: true, unique: true}
});

export const PendingRequestModel = mongoose.model<IPendingRequest>(MODEL_NAME, PendingRequestSchema);
export async function GenerateNewToken() {
    let found = false;
    let token = "";
    do {
        token = StrUtils.GenerateRandomStr();
        found = !(!await PendingRequestModel.findOne({token: token}));
    } while (found);

    return token;
}