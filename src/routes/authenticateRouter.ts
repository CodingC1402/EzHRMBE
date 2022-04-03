import express from 'express';
import SessionAuthentication from '../security/session';
import { LOGIN_PATH, REGISTER_PATH, SESSION_ID } from '../configurations/Security';
import Status from '../configurations/Status';
import AuthenticateController from '../controllers/authenticateController';

const router = express.Router();

router.use((req, res, next) => {
  //@ts-ignore
  let isAuth = SessionAuthentication.isAuthenticated(req.url, {...req.session});
  if (isAuth) {
    next();
  } else {
    res.status(Status.UNAUTHORIZED).json({message: 'Authentication failed'});
  }
})

// If login successfully then return user without the hashed password
router.get(LOGIN_PATH, async (req, res) => {
  let {username, password} = req.body;
  AuthenticateController.Login(username, password, req.session)
  .then((user) => {
    res.status(Status.OK).cookie(SESSION_ID, req.session.id).json(user);
  })
  .catch((error) => {
    res.status(Status.BAD_REQUEST).json({message: error.message});
  });
})

router.post("/register",async (req, res) => {
  
});

router.post("/logout", async (req, res) => {
  req.session.destroy(err => {});
  res.status(Status.OK).send();
})

const authenticateRouter = router;
export default authenticateRouter;