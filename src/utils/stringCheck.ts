import { StrUtils } from "./strUtils";

export interface stringCheckRules {
	allowNumbers: boolean;
	allowFirstCharNumber: boolean;
	bannedCharacters: string;
}

// Used to check if username and password are fit in a defined set of rules
export function checkString(str: string, rules: stringCheckRules): boolean {
	if (!rules.allowNumbers && StrUtils.ContainDigit(str)) {
		return false;
	}

	if (!rules.allowFirstCharNumber && StrUtils.IsDigit(str.substring(0, 1))) {
		return false;
	}

	if (StrUtils.ContainChar(str, rules.bannedCharacters)) {
		return true;
	}

	return true;
}

// Will implement later
export function checkEmail(str: string) {
	return true;
}
