import express from 'express';
import SessionAuthentication from '../security/session';
import Status from '../configurations/status';
import AuthenticateController from '../controllers/authenticateController';
import UserController from '../controllers/userController';
import responseMessage from '../utils/responseError';

export const LOGIN_PATH: string = "/login";
export const REGISTER_PATH: string = "/register";
export const LOGOUT_PATH: string = "/logout";
export const PROFILE_PATH: string = "/profile";

const router = express.Router();

router.use(AuthenticateController.Authorize);

router.post(LOGIN_PATH, AuthenticateController.Login);
router.post(REGISTER_PATH, AuthenticateController.Register);
router.get(PROFILE_PATH, UserController.getUser);
router.delete(LOGOUT_PATH, AuthenticateController.Logout);

const authenticateRouter = router;
export default authenticateRouter;
