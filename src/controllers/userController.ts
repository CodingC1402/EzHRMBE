import mongoose from "mongoose";
import { IUser, UserModel } from "../models/userModel";

export default class UserController {
	public static async createUser(userInfo: IUser) {
		let user = await UserModel.findOne({ username: userInfo.username });

		if (user) {
			let error = new Error("User already exists");
			throw error;
		}

		user = new UserModel(userInfo);
		try {
			let info = await user.save();
			return info;
		} catch (error) {
			throw error;
		}
	}

	public static async getUser(username: string) {
		return await UserModel.findOne({ username: username });
	}
}
