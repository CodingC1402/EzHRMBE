import { DefaultCompany } from "../models/companyModel";
import { IUser, UserModel } from "../models/userModel";
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from "../configurations/security";
import { Request, Response, NextFunction } from "express";
import Status from "../configurations/status";
import responseMessage from "../utils/responseError";

export default class UserController {
	public static async createUser(
		req: Request<{}, {}, {username: string, password: string, email: string}>,
		res: Response,
		next: NextFunction
	) {
		const {username, password, email} = req.body;
		let user = await UserModel.findOne({ username: username });

		if (user) {
			responseMessage(res, "User already exists", Status.CONFLICT);
			return;
		}

		const encryptedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

		user = new UserModel({
			username: username,
			password: encryptedPassword,
			email: email,
			company: DefaultCompany,
		});
		try {
			let info = {
				...(await user.save()).toObject(),
				password: undefined
			}
			res.status(Status.CREATED).json(info);
		} catch (err) {
			//@ts-ignore
			let error: Error = error;
			responseMessage(res, error.message, Status.BAD_REQUEST);
		}
	}

	public static async getUser(
		req: Request,
		res: Response,
		next: NextFunction) {
		const user = await UserModel.findOne({ username: req.session.username }).select("-password").lean();
		if (!user) {
			responseMessage(res, "User not found", Status.NOT_FOUND);
		}

		res.status(Status.OK).send(user);
	}
}
