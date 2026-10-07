# Contributing to Soroban Indexer

First off, thank you for considering contributing to `soroban-indexer`! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

🌊 **Special Welcome to Stellar Drips Wave Participants!** 🌊
We are thrilled to be part of the Stellar ecosystem. If you are participating in the Drips Wave program, this project is a great place to earn rewards while building critical infrastructure for Soroban.

## How to Find Issues

We use GitHub issues to track bugs, feature requests, and tasks. 
- Look for issues tagged with `good first issue` if you are new to the project.
- **Drips Wave Participants:** Look specifically for issues tagged with `wave` or `drips`. These issues often have associated point values in their description or labels.

## Development Setup

The project consists of a Rust ingester and a TypeScript/Node.js API.

### Prerequisites
- [Rust](https://rustup.rs/) (latest stable)
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/)
- Docker (optional, but recommended for local DB setup)

### Step-by-Step

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/soroban-indexer.git
   cd soroban-indexer
   ```

2. **Set up the Database:**
   ```bash
   docker-compose up -d db
   ```

3. **Set up the Node.js API:**
   ```bash
   cd api
   pnpm install
   pnpm run build
   ```

4. **Set up the Rust Ingester:**
   ```bash
   cd ../ingester
   cargo build
   ```

5. **Run Database Migrations:**
   ```bash
   # (Assuming a migration script is available in the API package)
   cd ../api
   pnpm run migrate
   ```

## Code Style Guidelines

We enforce automated formatting and linting to maintain code quality.

### Rust (Ingester)
- Use `cargo fmt` to format your code before committing.
- Ensure `cargo clippy` passes without warnings.
- Run tests with `cargo test`.

### TypeScript (API & Frontend)
- We use ESLint and Prettier.
- Run `pnpm run lint` and `pnpm run format` in the `api` or `dashboard` directories.

## Pull Request Process

1. Create a new branch from `main` (e.g., `feature/add-new-endpoint` or `fix/event-parsing`).
2. Make your changes, ensuring you follow the code style guidelines.
3. Write or update tests as necessary.
4. Update documentation if your changes affect the API or architecture.
5. Submit a Pull Request. Provide a clear description of the problem and the solution.
6. A maintainer will review your PR and may request changes.

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/). This helps us automate changelogs and versioning.

Format: `<type>[optional scope]: <description>`

Examples:
- `feat(api): add GraphQL support for token transfers`
- `fix(ingester): resolve memory leak in event streaming`
- `docs: update API examples in README`

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.

## Issue Labeling System (Drips Wave)

For Drips Wave, issues will be labeled based on complexity and impact:
- `wave: small` - Minor bugs, documentation, simple features.
- `wave: medium` - Standard feature implementations, API additions.
- `wave: large` - Complex architectural changes, performance overhauls.

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms. (See `CODE_OF_CONDUCT.md` if available, otherwise refer to standard open source norms).
