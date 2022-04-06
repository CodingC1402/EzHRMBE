import { IGNORE_PATHS } from "../configurations/security"

export interface SessionInfo {
  username: string;
}

export default class SessionAuthentication {
  public static isAuthenticated(url: string, session: SessionInfo): boolean {
    for (let i = 0; i < IGNORE_PATHS.length; i++) {
      let path = IGNORE_PATHS[i];
      if (url.includes(path)) {
        return true;
      }
    }

    if (session.username) {
      return true;
    }

    return false;
  }
}