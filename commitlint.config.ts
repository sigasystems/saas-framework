import type { UserConfig } from "@commitlint/types";

const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Optional: customize rules, e.g., enforce lowercase subject
    "subject-case": [2, "always", "lower-case"],
  },
};

export default Configuration;
