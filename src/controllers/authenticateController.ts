import { UserModel } from "../models/userModel";
import bcrypt from "bcrypt";
import UserController from "./userController";
import { checkEmail, checkString } from "../utils/stringCheck";
import { PASSWORD_RULES, USERNAME_RULES } from "../configurations/namingRules";

export default class AuthenticateController {
  public static async Login(username: string, password: string, session: object) {
    //@ts-ignore
    const sessionUsername: string = session.username;

    if (sessionUsername === username) {
      const user = await UserModel.findOne({username: username}).select("-password").lean();
      return user;
    }

    const user = await UserModel.findOne({username: username}).lean();
    if (!user) {
      throw new Error("Invalid username");
    }

    const isPassCorrect = await bcrypt.compare(password, user.password);
    if (!isPassCorrect) {
      throw new Error("Wrong username or password");
    }

    //@ts-ignore
    session.username = user.username;
    return {
      ...user,
      password: undefined
    };
  }

  public static async Register(username: string, password: string, email: string) {
    //Check valid username
    if (!checkString(username, USERNAME_RULES)) {
      throw new Error("Invalid username");
    }
    
    //Check valid password
    if (!checkString(password, PASSWORD_RULES)) {
      throw new Error("Invalid password");
    } 

    //Validate the email here
    if (!  checkEmail(email)) {
      throw new Error("Invalid email");
    }

    return UserController.createUser(username, password, email);
  }
}