import { contextSafetyRule } from './rules/context-safety';

export const rules = {
  "context-safety": contextSafetyRule
};

export const configs = {
  recommended: {
    plugins: ["afjl-lint"],
    rules: {
      "afjl-lint/context-safety": "warn"
    }
  }
};
