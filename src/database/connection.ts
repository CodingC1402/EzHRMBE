import mongoose from "mongoose";
import Env from "../configurations/env";

export class Connection {
  private static _count = 0;
  private static _promise: Promise<typeof mongoose | void> | null = null;
  public static get count(): number {
    return Connection._count;
  }

  public static async openConnection() {
    if (Connection._promise) {
      await Connection._promise;
    }

    if (this._count == 0) {
      Connection._promise = mongoose.connect(Env.DB_CONNECTION);
      await Connection._promise;
      Connection._promise = null;

      console.log("Db connection established");
    }
    this._count++;
    //console.log(this._count);
  }

  public static async closeConnection() {
    if (Connection._promise) {
      await Connection._promise;
    }

    if (this._count == 0) {
      console.warn("Db connection closed but closeConnection() was called");
      return;
    }

    this._count--;
    //console.log(this._count);
    if (this._count == 0) {
      Connection._promise = mongoose.disconnect();
      await Connection._promise;
      Connection._promise = null;

      console.log("Db connection closed\n");
    }
  }
}
