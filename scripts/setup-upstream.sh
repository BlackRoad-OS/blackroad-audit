#!/bin/bash
# Setup script to configure BlackRoad-Private upstream connection
# Run this after cloning the repository: bash scripts/setup-upstream.sh

set -e

echo "🔧 Setting up BlackRoad-Private upstream connection..."

UPSTREAM_URL="https://github.com/BlackRoad-OS/blackroad-audit-private"

# Check if upstream remote already exists
if git remote | grep -q "^upstream$"; then
  echo "✓ Upstream remote already exists"
  git remote get-url upstream
else
  # Add upstream remote
  git remote add upstream "$UPSTREAM_URL"
  echo "✓ Added upstream remote: $UPSTREAM_URL"
fi

echo ""
echo "Available remotes:"
git remote -v

echo ""
echo "🔍 Verifying access to upstream remote..."
if git ls-remote --exit-code upstream HEAD &>/dev/null; then
  echo "✅ Successfully connected to upstream remote!"
else
  echo "⚠️  Warning: Unable to access upstream remote."
  echo "   This is normal if you don't have access to the private repository."
  echo "   You can still work with the public repository (origin)."
  echo "   Contact the BlackRoad OS team if you need access to the upstream."
fi

echo ""
echo "✅ Setup complete! You can now sync with upstream using:"
echo "   git fetch upstream"
echo "   git merge upstream/main"
