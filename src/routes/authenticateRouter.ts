import express from 'express';
import SessionAuthentication from '../security/session';
import Status from '../configurations/status';
import AuthenticateController from '../controllers/authenticateController';
import UserController from '../controllers/userController';
import responseError from '../utils/responseError';

export const LOGIN_PATH: string = "/login";
export const REGISTER_PATH: string = "/register";
export const SESSION_ID: string = "session_id";
export const LOGOUT_PATH: string = "/logout";
export const PROFILE_PATH: string = "/profile";

const router = express.Router();

router.use((req, res, next) => {
  //@ts-ignore
  let isAuth = SessionAuthentication.isAuthenticated(req.url, { ...req.session });
  if (isAuth) {
    next();
  } else {
    res.status(Status.UNAUTHORIZED).json({ message: 'Authentication failed' });
  }
});

// If login successfully then return user without the hashed password
router.post(LOGIN_PATH, async (req, res) => {
  const { username, password } = req.body;
  AuthenticateController.Login(username, password, req.session)
    .then(user => res.status(Status.CREATED).cookie(SESSION_ID, req.session.id).json(user))
    .catch(err => responseError(res, err, Status.UNAUTHORIZED));
});

router.post(REGISTER_PATH, async (req, res) => {
  const {username, password, email} = req.body;
  AuthenticateController.Register(username, password, email)
    .then(user => res.status(Status.CREATED).cookie(SESSION_ID, req.session.id).json(user))
    .catch(err => responseError(res, err, Status.CONFLICT));
});

router.get(PROFILE_PATH, async (req, res) => {
  //@ts-ignore
  UserController.getUser(req.session?.username)
    .then(user => res.status(Status.OK).json({ user }))
    .catch(err => responseError(res, err, Status.NOT_FOUND));
});

router.delete(LOGOUT_PATH, async (req, res) => {
  req.session.destroy((err) => {
    if (err)
      res.status(Status.BAD_REQUEST).send();
    else   
      res.status(Status.NO_CONTENT).send();
  });
});

const authenticateRouter = router;
export default authenticateRouter;
