export const IGNORE_PATHS: Array<string> = [
  "",
  "login",
  "register",
  "verify",
  "password-change"
];

export const SESSION_EXPIRE_SPAN: number = 1000 * 60 * 60 * 24 * 1;
export const SALT_ROUNDS: number = 10;