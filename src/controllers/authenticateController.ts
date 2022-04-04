import { UserModel } from "../models/userModel";
import bcrypt from "bcrypt";

export default class AuthenticateController {
  public static async Login(username: string, password: string, session: object) {
    //@ts-ignore
    let sessionUsername: string = session;

    if (sessionUsername === username) {
      return;
    }

    let user = await UserModel.findOne({username: username}).lean();
    if (!user) {
      throw new Error("Invalid username");
    }

    let isPassCorrect = await bcrypt.compare(password, user.password);
    if (!isPassCorrect) {
      throw new Error("Wrong username or password");
    }

    //@ts-ignore
    session.username = user.username;
    return user;
  }

  public static async Register(username: string, password: string, email: string) {
    //Check valid username
    

    //Check valid password


    let user = new UserModel({
      username: username,
      password: password,
      email: email
    });

    user.save();
  }
}