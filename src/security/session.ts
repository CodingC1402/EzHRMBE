import { IGNORE_PATHS } from "../configurations/security"

export interface SessionInfo {
  username: string;
}

export default class SessionAuthentication {
  public static isAuthenticated(urlStr: string, session: SessionInfo): boolean {
    let urlArr = urlStr.split("/");

    for (let i = 0; i < IGNORE_PATHS.length; i++) {
      let path = IGNORE_PATHS[i];
      if (urlArr[1] === path) {
        return true;
      }
    }

    if (session.username) {
      return true;
    }

    return false;
  }
}