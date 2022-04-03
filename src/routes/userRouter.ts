import { IUser } from "../models/userModel";
import express from "express";
import UserController from "../controllers/userController";
import Status from "../configurations/Status";
import responseError from "../utils/responseError";

const CREATE_PATH = "/create";
const GET_PATH = "/find/:username";

const userRouter = express.Router();

userRouter.post(CREATE_PATH, async (req, res) => {
	const userInfo: IUser = {
		...req.body,
	};
  
	UserController.createUser(userInfo)
		.then((value) => {
			res.status(Status.OK).json(value);
		})
		.catch((error) => responseError(res, error, Status.BAD_REQUEST));
});

userRouter.get(GET_PATH, async (req, res, next) => {
	UserController.getUser(req.params.username)
		.then((value) => {
			if (value) res.status(Status.OK).json({
				...value,
				password: undefined,
			});
			else {
				responseError(res, new Error("User not found"), Status.BAD_REQUEST);
			}
		})
		.catch((error) => responseError(res, error, Status.BAD_REQUEST));
});

export default userRouter;
