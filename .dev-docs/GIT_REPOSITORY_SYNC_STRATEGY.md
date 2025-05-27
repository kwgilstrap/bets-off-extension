# Git Repository Synchronization Strategy

**Last Updated:** May 27, 2025  
**Repository:** https://github.com/kwgilstrap/bets-off-extension  
**Objective:** Complete repository replacement with current production-ready state

## Executive Summary

This document provides a surgical approach to synchronizing your local Bets Off extension with your GitHub repository, ensuring zero data loss while establishing a clean version control state for your Chrome Web Store-ready extension.

## Phase I: Comprehensive Backup Protocol

### Step 1: Create Timestamped Backup
```bash
# From your project parent directory
cd /Users/kyle_gilstrap/Projects/bets-off
cp -r bets-off-extension backup-$(date +%Y-%m-%d-%H%M%S)
```

### Step 2: Create Archive for Extra Safety
```bash
# Create compressed archive
tar -czf bets-off-extension-backup-$(date +%Y-%m-%d).tar.gz bets-off-extension/
```

## Phase II: Git Repository Analysis

### Step 1: Check Current Git State
```bash
cd /Users/kyle_gilstrap/Projects/bets-off/bets-off-extension

# Check if git is initialized
git status

# If not initialized, initialize it
git init

# Check current remote (if any)
git remote -v
```

### Step 2: Examine Remote Repository State
Visit https://github.com/kwgilstrap/bets-off-extension to understand current remote state.

## Phase III: The Clean Slate Approach

Given your preference for complete replacement, we'll use the "scorched earth" strategy—completely replacing remote with local state.

### Option A: Force Push Strategy (Preserves Some History)

```bash
# Step 1: Ensure git is initialized
cd /Users/kyle_gilstrap/Projects/bets-off/bets-off-extension
git init

# Step 2: Set remote if not already set
git remote add origin https://github.com/kwgilstrap/bets-off-extension.git
# OR if remote exists but points elsewhere:
git remote set-url origin https://github.com/kwgilstrap/bets-off-extension.git

# Step 3: Create comprehensive .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json

# System files
.DS_Store
Thumbs.db

# Development files
*.log
*.tmp
.env
.env.local

# Archive folders
.archive/
.old/
backup*/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Build artifacts
dist/
build/
*.zip

# Sensitive data
secrets/
credentials/

# Development/debug files
debug-*.html
test-*.html
popup-inline.html
popup-no-js.html

# Temporary validation folders
_metadata/
validation/
EOF

# Step 4: Stage all files
git add .

# Step 5: Create definitive commit
git commit -m "Production Release v2.0.0: Shield UI Update

- Complete Chrome extension ready for Web Store submission
- Manifest V3 compliant with declarativeNetRequest
- Enhanced blocking for 29+ gambling domains
- Inline ad removal for ESPN BET and embedded content
- Privacy-first architecture with zero data collection
- Light/Dark/System theme support
- Real-time statistics tracking
- Bug reporting and domain submission features
- GA and Gam-Anon resource integration
- Comprehensive security hardening with CSP
- Full documentation suite in .dev-docs/

This commit represents 100+ hours of development resulting in a 
production-ready gambling content blocker that prioritizes user 
privacy and effectiveness."

# Step 6: Force push to completely replace remote
git push --force origin main
# OR if your default branch is 'master':
git push --force origin master
```

### Option B: Nuclear Option (Complete Repository Reset)

If you want to completely erase all history and start fresh:

```bash
# Step 1: Delete local .git folder
cd /Users/kyle_gilstrap/Projects/bets-off/bets-off-extension
rm -rf .git

# Step 2: Initialize fresh repository
git init
git branch -M main

# Step 3: Add comprehensive .gitignore (same as above)

# Step 4: Add all files
git add .

# Step 5: Initial commit
git commit -m "Initial commit: Bets Off v2.0.0 - Production Ready

Shield UI Chrome extension for blocking gambling content.
Ready for Chrome Web Store submission."

# Step 6: Add remote
git remote add origin https://github.com/kwgilstrap/bets-off-extension.git

# Step 7: Force push (this will completely replace remote)
git push --force origin main
```

## Phase IV: Post-Sync Verification

### Verification Checklist
```bash
# 1. Verify remote state matches local
git status
# Should show: "Your branch is up to date with 'origin/main'"

# 2. Check file integrity
git ls-files | wc -l
# Should show ~50-60 files

# 3. Verify .gitignore is working
git status --ignored
# Should show ignored files/folders

# 4. Create release tag
git tag -a v2.0.0 -m "Production release for Chrome Web Store"
git push origin v2.0.0
```

## Phase V: GitHub Repository Configuration

### Recommended Repository Settings

1. **Repository Details**
   - Description: "🛡️ Chrome extension that blocks gambling ads and betting sites. Privacy-first design with zero data collection."
   - Website: https://betsoff.io (when available)
   - Topics: `chrome-extension`, `gambling-blocker`, `ad-blocker`, `privacy`, `manifest-v3`

2. **Default Branch**: Ensure it's set to `main`

3. **Branch Protection** (Settings → Branches):
   - Protect `main` branch
   - Require pull request reviews (optional for solo development)
   - Dismiss stale pull request approvals
   - Include administrators

4. **Security** (Settings → Security):
   - Enable Dependabot alerts
   - Enable Dependabot security updates

## Phase VI: Release Management

### Create GitHub Release

```bash
# After pushing, create a release
# 1. Go to https://github.com/kwgilstrap/bets-off-extension/releases
# 2. Click "Create a new release"
# 3. Tag: v2.0.0
# 4. Title: "Bets Off v2.0.0 - Shield UI Update"
# 5. Description: Use content from HANDOFF.md
```

### Generate Distribution ZIP

```bash
# Create Chrome Web Store submission package
cd /Users/kyle_gilstrap/Projects/bets-off/bets-off-extension

zip -r ../bets-off-extension-v2.0.0.zip . \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*.DS_Store" \
  -x "package*.json" \
  -x ".archive/*" \
  -x ".dev-docs/*" \
  -x "screenshots/*" \
  -x "*.md" \
  -x "debug-*.html" \
  -x "test-*.html" \
  -x "popup-inline.html" \
  -x "popup-no-js.html" \
  -x "scripts/content.js" \
  -x "scripts/gen-icons.js" \
  -x "_metadata/*" \
  -x "validation/*" \
  -x "artwork/*" \
  -x "backup*"
```

## Potential Issues and Solutions

### Issue 1: Authentication Problems
```bash
# If you get authentication errors:
# Option 1: Use SSH
git remote set-url origin git@github.com:kwgilstrap/bets-off-extension.git

# Option 2: Use Personal Access Token
# Create at: https://github.com/settings/tokens
git remote set-url origin https://YOUR_TOKEN@github.com/kwgilstrap/bets-off-extension.git
```

### Issue 2: Protected Branch
If main/master is protected:
1. Go to Settings → Branches
2. Temporarily disable protection
3. Force push
4. Re-enable protection

### Issue 3: Large Files
```bash
# Check for large files
find . -type f -size +50M

# If found, add to .gitignore before committing
```

## Best Practices Going Forward

1. **Commit Frequency**: After each significant feature/fix
2. **Commit Messages**: Use conventional commits
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation changes
   - `style:` Code style changes
   - `refactor:` Code refactoring
   - `security:` Security improvements

3. **Branching Strategy** (Optional for solo development):
   - `main`: Production-ready code
   - `develop`: Active development
   - `feature/*`: New features

4. **Version Management**:
   - Use semantic versioning: MAJOR.MINOR.PATCH
   - Tag releases: `git tag -a v2.1.0 -m "Description"`

## Security Considerations

1. **Never commit**:
   - API keys or tokens
   - Personal information
   - Debug files with sensitive data
   - .env files

2. **Use .gitignore**: Already configured above

3. **Scan for secrets** (optional):
   ```bash
   # Install gitleaks
   brew install gitleaks
   
   # Scan repository
   gitleaks detect --source .
   ```

## Conclusion

This strategy ensures your GitHub repository perfectly mirrors your production-ready extension while maintaining a clean git history. The force push approach is appropriate given your stated preference for complete replacement.

After synchronization, your repository will serve as:
1. Version control for future development
2. Open-source transparency for users
3. Backup of your production code
4. Foundation for collaborative development

Remember: Your local backup is your safety net. With that in place, proceed with confidence.