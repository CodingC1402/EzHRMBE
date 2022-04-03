import { IGNORE_PATHS } from "../configurations/Security"
import jwt, { JwtPayload } from "jsonwebtoken"
import express from "express";
import Env from "../configurations/Env";

const AUTHORIZATION_HEADER = "Authorization";
const NO_TOKEN_MESSAGE = "No token?";

export interface TokenPayload {
  username: string;
}

export default class Token {
  // If success then return an empty string otherwise failed
  public static isAuthenticated(url: string, header: object): string {
    for (let i = 0; i < IGNORE_PATHS.length; i++) {
      let path = IGNORE_PATHS[i];
      if (url.includes(path)) return "";
    }

    //@ts-ignore
    let token: string = header[AUTHORIZATION_HEADER];
    token = token.split(" ")[1];
    if (!token) return NO_TOKEN_MESSAGE;

    let result = "";
    jwt.verify(token, Env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        result = err.message === "" ? "Unknown error" : err.message;
      }
    });

    return result;
  }

  public static refreshAuthentication(refreshToken: string) {

  }

  public static removeRefreshToken() {
    
  }
}