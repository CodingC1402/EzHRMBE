import express from 'express';
import SessionAuthentication from '../security/session';
import Status from '../configurations/status';
import AuthenticateController from '../controllers/authenticateController';
import UserController from '../controllers/userController';
import responseMessage from '../utils/responseError';

export const UPDATE_PATH: string = "/update/{:id}";
export const DELETE_PATH: string = "/{:id}"
export const CREATE_PATH: string = "/create";
export const FIND_PATH: string = "/{:id}";

const router = express.Router();



const employeesRouter = router;
export default employeesRouter;