# 🎓 Interactive Web Quiz

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen.svg?style=flat-square)](https://pages.ryuukae.io/interactive-web-quiz)
[![CI Status](https://img.shields.io/badge/CI-passing-brightgreen.svg?style=flat-square)](#)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg?style=flat-square)](#)
[![CodeQL](https://img.shields.io/badge/CodeQL-passed-blue.svg?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-blue.svg?style=flat-square)](https://nodejs.org)

> An enterprise-grade, client-side assessment platform featuring dynamic card generation, dual QAD/JSON data ingestion, auto-expanding textareas, and a fully hardened CI/CD validation pipeline.

🌐 **Live Production Application:** [https://pages.ryuukae.io/interactive-web-quiz](https://pages.ryuukae.io/interactive-web-quiz)

---

## 📖 Project Overview & Motivation

**Interactive Web Quiz** originated as a technical refactoring project designed to transform loosely structured script code into an enterprise-level, production-ready frontend application. The project serves as an end-to-end showcase of modern software engineering practices, architectural patterns, automated quality assurance, and zero-defect deployment pipelines.

The application serves a dual purpose:
1. **Academic Study Platform**: Enables students and educators to construct, validate, and share practice examinations before assessments.
2. **Organizational Knowledge Checks**: Provides a lightweight, decentralized tool for teams to administer instant post-meeting understanding checks without requiring backend server infrastructure or user accounts.

---

## ✨ Key Architectural Features

- 🛠️ **Visual Assessment Builder**: Real-time interactive UI for creating question cards with configurable correct answers and up to 6 distractors.
- ⚡ **Dual-Format Bulk Digestion**: Ingests both standard JSON structures and human-readable QAD (Question-Answer-Distractor) markup with comprehensive schema validation.
- 📱 **Progressive Web App (PWA)**: Offline-first service worker architecture powered by `vite-plugin-pwa` and Workbox.
- 🎯 **Accessibility (a11y) First**: Full keyboard navigation support, ARIA screen-reader landmarks, and contrast validation audited via `@axe-core/playwright`.
- 🛡️ **Defensive Client Security**: Strict input sanitization, complete isolation from DOM-XSS vectors, and zero external runtime dependencies.
- 🔒 **Type-Safe Vanilla JS**: 100% JSDoc annotations strictly checked by TypeScript compiler (`tsc --noEmit`) in strict mode.

---

## 🏛️ System Architecture

The application is engineered using a decoupled **Model-View-Controller (MVC)** design pattern:

```text
┌─────────────────────────────────────────────────────────────┐
│                       Entry Point                           │
│                      (src/script.js)                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│    AppNavigationController   │ │      StorageService          │
│    (Screen State & Router)   │ │   (LocalStorage & Cache)     │
└──────────────┬───────────────┘ └──────────────────────────────┘
               │
       ┌───────┴───────────────────────────────┐
       ▼                                       ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│     BuilderUIController      │ │       QuizUIController       │
│  (DOM Events & Bulk Ingest)  │ │   (Quiz Session Lifecycle)   │
└──────────────┬───────────────┘ └──────────────┬───────────────┘
               │                                │
       ┌───────┴───────────────┐                ▼
       ▼                       ▼ ┌──────────────────────────────┐
┌──────────────┐ ┌──────────────┐│          QuizState           │
│ BuilderState │ │ BuilderCard  ││ (Active Index & Score State) │
│ (Cards Model)│ │  Component   │└──────────────────────────────┘
└──────────────┘ └──────────────┘
```

- **Models** (`src/js/models/`): Pure JavaScript classes managing business logic, state transitions, validation, and payload serialization independently from the DOM.
- **Controllers** (`src/js/controllers/`): Orchestrate DOM event bindings, state updates, bulk text digestion, and screen navigation.
- **Components** (`src/js/components/`): Encapsulated UI components (`BuilderCardComponent`) with isolated lifecycle management and defensive DOM manipulation.
- **Utilities** (`src/js/utils/`): Pure functional helpers for QAD parsing, JSON schema validation, file I/O streams, and logging.

---

## 🛡️ Quality Engineering & CI/CD Pipeline

To ensure that no code with formatting issues, type errors, linting warnings, or test failures can ever reach production, the repository employs a multi-tiered gatekeeping architecture:

### 1. Local Pre-commit & Pre-push Gates (Husky + Lint-Staged)
- **Branch Naming Validation**: Enforces Conventional Commits branch formats (`feat/*`, `fix/*`, `ci/*`, etc.).
- **Lint-Staged**: Automatically runs ESLint (0 warnings), Prettier checks, Stylelint, HTML-Validate, and CSpell across all staged files.
- **Pre-push Gate**: Executes `npm run audit`, `npm run lint`, Vitest test suites, TypeScript typecheck, and Vite production bundle compilation prior to pushing to remote.

### 2. GitHub Actions Workflows
- **Continuous Integration (`CI`)**: Validates YAML syntax with Actionlint, caches Playwright browser binaries, executes 100% test coverage assertions, runs Lighthouse CI performance audits, and captures failure traces.
- **Visual Regression Audits**: Pixel-perfect cross-browser visual comparisons across Chromium, Firefox, and WebKit on Ubuntu runners.
- **CodeQL Security Scanning**: Automated SAST security analysis detecting injection, DOM-XSS, and race conditions.
- **Automated Releases (`CD`)**: Semantic Release pipeline automating changelog generation, version synchronization, and zero-downtime deployment to GitHub Pages.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `>=20.0.0`
- **npm**: `>=10.0.0`

### Installation
```bash
# Clone the repository
git clone https://github.com/Ryuukae/interactive-web-quiz.git
cd interactive-web-quiz

# Install dependencies
npm ci
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```
## 🧪 Available Scripts & Command Reference

|        Task	      |         Command	         |                 Purpose                  |
| :------------------ | :----------------------- | :--------------------------------------- |
|  **Master verify**  |  `npm run verify`        |        Full CI gatekeeper check          |
|  **Unit Tests**     |  `npm run test`	         |         Run Vitest test suites           |
|  **TDD Watch**      |  `npm run test:watch`    |       Interactive TDD test runner        |
|  **Coverage**	      |  `npm run test:coverage` |       Enforce 100% code coverage         |
|  **E2E Tests**      |  `npm run test:e2e`	 |        Playwright browser suites         |
|  **Master Lint**    |  `npm run lint`          | ESLint, Stylelint, HTML, CSpell, Secrets |
|  **Lint Fix**	      |  `npm run lint:fix`	 |       Autofix linting violations         |
|  **Format**	      |  `npm run format`	 |      Prettier repository formatting      |
|  **Format Check**   |  `npm run format:check`  |       Verify Prettier formatting         |
|  **Typecheck**      |  `npm run typecheck`     |      TypeScript JSDoc verification       |
|  **Security Audit** |  `npm run audit`	 |    Scan for dependency vulnerabilities   |
|  **Bundle Budget**  |  `npm run size`	         |     Validate production bundle size      |
|  **Dev Server**     |  `npm run dev`	         |      Start Vite dev server with HMR      |
|  **Build**          |  `npm run build`         |       Production Vite & PWA build        |
|  **Preview**	      |  `npm run preview`       |     Preview production build locally     |
|  **Snapshots Sync** |  `npm run snapshots:sync`|    Update visual regression baselines    |
|  **Version Sync**   |  `npm run sync:versions` |        Align JSDoc @version tags         |

---

## 👤 Author

**Adam Ross DeStafeno**
- GitHub: [@Ryuukae](https://github.com/Ryuukae)
- Email: [ryuukae.dev@gmail.com](mailto:ryuukae.dev@gmail.com)
- Pages: [https://pages.ryuukae.io](https://pages.ryuukae.io)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
