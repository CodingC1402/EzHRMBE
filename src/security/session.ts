import { IGNORE_PATHS } from "../configurations/security"
import { Request } from 'express'

// Adding to session declaration
declare module 'express-session' {
  interface SessionData {
      username: string;
      companyID: string;
  }
}

export default class SessionAuthentication {
  public static isAuthenticated(urlStr: string, req: Request): boolean {
    let urlArr = urlStr.split("/");

    for (let i = 0; i < IGNORE_PATHS.length; i++) {
      let path = IGNORE_PATHS[i];
      if (urlArr[1].split('?')[0] === path) {
        return true;
      }
    }

    if (req.session.username) {
      return true;
    }

    return false;
  }
}