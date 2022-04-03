require('dotenv/config');

export default class Env {
  public static readonly DB_CONNECTION: string = process.env.DB_CONNECTION || "";
  public static readonly TOKEN_SECRET: string = process.env.TOKEN_SECRET || "";
}