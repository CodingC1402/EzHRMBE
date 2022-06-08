import express from 'express';
import AuthenticateController from '../controllers/authenticateController';
import UserController from '../controllers/userController';

export const LOGIN_PATH: string = "/login";
export const REGISTER_PATH: string = "/register";
export const LOGOUT_PATH: string = "/logout";
export const PROFILE_PATH: string = "/profile";
export const VERIFY_PATH: string = "/verify";
export const PASSWORD_CHANGE: string = "/password-change";

let router = express.Router();

router.use(AuthenticateController.Authorize);

router.post(LOGIN_PATH, AuthenticateController.Login);
router.post(REGISTER_PATH, AuthenticateController.Register);

router.post(PASSWORD_CHANGE, AuthenticateController.RequestPasswordChange);
router.put(PASSWORD_CHANGE, AuthenticateController.ChangePassword);

router.put(VERIFY_PATH, AuthenticateController.VerifyEmail);
router.get(PROFILE_PATH, UserController.getUser);
router.delete(LOGOUT_PATH, AuthenticateController.Logout);

const authenticateRouter = router;
export default authenticateRouter;
