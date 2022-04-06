import { DefaultCompany } from "../models/companyModel";
import { IUser, UserModel } from "../models/userModel";
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from "../configurations/security";

export default class UserController {
	public static async createUser(
		username: string,
		password: string,
		email: string,
	) {
		let user = await UserModel.findOne({ username: username });

		if (user) {
			let error = new Error("User already exists");
			throw error;
		}

		password = bcrypt.hashSync(password, SALT_ROUNDS);

		user = new UserModel({
			username: username,
			password: password,
			email: email,
			company: DefaultCompany,
		});
		try {
			let info = await user.save();
			return info;
		} catch (error) {
			throw error;
		}
	}

	public static async getUser(username: string) {
		let user = await UserModel.findOne({ username: username }).select("-password").lean();
		if (!user) {
			throw new Error("User not found");
		}

		return user;
	}
}
