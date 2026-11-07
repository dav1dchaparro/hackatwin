// Conventional Commits: https://www.conventionalcommits.org
// CI runs this via npx with pinned versions (see .github/workflows/ci.yml).
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Dependabot bodies/footers contain long lines.
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
  },
};
