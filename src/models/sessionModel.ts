import mongoose from "mongoose";

export const SESSION_COLLECTION = "connectsessions";

export interface ISession {
    expires: Date,
    session: string
}

const sessionSchema = new mongoose.Schema<ISession>({
    expires: {type: Date, required: true},
    session: {type: String, required: true},
});

export const SessionModel = mongoose.model<ISession>(SESSION_COLLECTION, sessionSchema);