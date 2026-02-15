#!/bin/bash
# Setup script to configure BlackRoad-Private upstream connection
# Run this after cloning the repository: bash scripts/setup-upstream.sh

set -e

echo "🔧 Setting up BlackRoad-Private upstream connection..."

# Check if upstream remote already exists
if git remote | grep -q "^upstream$"; then
  echo "✓ Upstream remote already exists"
  git remote get-url upstream
else
  # Add upstream remote
  git remote add upstream https://github.com/BlackRoad-OS/blackroad-audit-private
  echo "✓ Added upstream remote: https://github.com/BlackRoad-OS/blackroad-audit-private"
fi

echo ""
echo "Available remotes:"
git remote -v

echo ""
echo "✅ Setup complete! You can now sync with upstream using:"
echo "   git fetch upstream"
echo "   git merge upstream/main"
