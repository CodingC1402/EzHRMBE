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
}