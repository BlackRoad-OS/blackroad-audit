# Contributing to BlackRoad Audit Logs

## Repository Structure

This repository is connected to BlackRoad-Private upstream for enhanced features and internal development.

### Git Remotes

- **origin**: `https://github.com/BlackRoad-OS/blackroad-audit` (public repository)
- **upstream**: `https://github.com/BlackRoad-OS/blackroad-audit-private` (private repository)

## Working with Upstream

### Syncing with Upstream

To keep your local repository up to date with the private upstream:

```bash
# Fetch latest changes from upstream
git fetch upstream

# View upstream branches
git branch -r | grep upstream

# Merge upstream changes into your current branch
git merge upstream/main
```

### Contribution Workflow

1. **Fetch latest changes**: Always start by syncing with upstream
   ```bash
   git fetch upstream
   git merge upstream/main
   ```

2. **Create a feature branch**: Branch from the latest main
   ```bash
   git checkout -b feature/my-enhancement
   ```

3. **Make your changes**: Follow the coding standards and commit regularly

4. **Push to origin**: Push your changes to the public repository
   ```bash
   git push origin feature/my-enhancement
   ```

5. **Create a Pull Request**: Open a PR for review

## Development Setup

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Deploy to Cloudflare Workers
npm run deploy
```

## Questions?

For questions about the upstream connection or contribution process, please contact the BlackRoad OS team.
