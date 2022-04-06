import { stringCheckRules } from "../utils/stringCheck"

const COMMON_RULES: stringCheckRules = {
  allowFirstCharNumber: false,
  allowNumbers: true,
  bannedCharacters: `?><:";'/.,{}[]\\|+=_-\`~()!#$%^&*`
}

export const USERNAME_RULES: stringCheckRules = {
  ...COMMON_RULES,
}

export const PASSWORD_RULES: stringCheckRules = {
  ...COMMON_RULES,
  allowFirstCharNumber: true,
}