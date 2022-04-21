import mongoose from "mongoose";

export namespace mongooseType {
    export type Document<Type> = mongoose.Document<unknown, any, Type> & Type & {_id: ObjectID};
    export type ObjectDocument<Type> = Type & {_id: ObjectID}
    export type ObjectID = mongoose.Types.ObjectId;
}