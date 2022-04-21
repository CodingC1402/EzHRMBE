import mongoose from "mongoose";

export namespace objectUtils {
    // Update obj using update but only change the properties that obj has
    export function update(obj: Object, update: Object) {
        let result: typeof obj = {};

        //@ts-ignore
        Object.keys(obj).forEach(key => result[key] = update.hasOwnProperty(key) ? update[key] : obj[key]);
        return result;
    }

    export function updateSelf(obj: Object, update: Object) {
        //@ts-ignore
        Object.keys(obj).forEach(key => { if (update.hasOwnProperty(key)) { obj[key] = update[key]; } });
        return obj;
    }
}