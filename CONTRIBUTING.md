# Contributing to Interactive Web Quiz

Thank you for investing your time in contributing to our project!

## Development Workflow

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ryuukae/interactive-web-quiz.git
   ```

2. **Install dependencies**

   ```bash
   npm ci
   ```

3. **Run the local development server**
   ```bash
   npm run dev
   ```

## Commit and Branching Standards

We strictly enforce [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and standard branching structures. Your PR will automatically be rejected if these standards are not met.

### Branch Naming

All branches must adhere to the following regular expression format:
`^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security)\/[a-z0-9._-]+$`

Examples:

- `feat/new-quiz-parser`
- `fix/button-alignment`
- `ci/enhance-pipeline`

### Commit Messages

All commit messages must be formatted as: `<type>(<scope>): <subject>`

Examples:

- `feat(ui): add auto-expanding textareas`
- `fix(parser): resolve null pointer on empty input`
- `ci(github): add strict typechecking to workflow`

## Quality Gates

Before pushing code, ensure you pass the verification suite. Our pre-push hooks will automatically block your push if any of these fail.
Run the full verification suite locally:

```bash
npm run verify
```

This ensures your code passes:

- Prettier & ESLint Formatting
- Bundle Size Audits
- Strict DOM-library Typechecking
- Vitest Code Coverage (>80%)
- Security Audits

Once you push, GitHub Actions will automatically re-run these validations and execute Playwright E2E browser tests.

## Pull Requests

- Please use the provided Pull Request template.
- Ensure your PR is atomic and focuses on a single feature or fix.
- Link any relevant issues in the PR description using keywords like `Fixes #123`.
