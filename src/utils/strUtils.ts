import crypto from 'crypto';
export namespace StrUtils {
  export function IsDigit(str: string): boolean {
    return /^[0-9]$/.test(str);
  }

  export function ContainDigit(str: string): boolean {
    return /[0-9]/.test(str);
  }

  export function ContainChar(str: string, charset: string): boolean {
    let regret = new RegExp(`[${charset}]`);
    return regret.test(str);
  }

  export function GenerateRandomStr(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}