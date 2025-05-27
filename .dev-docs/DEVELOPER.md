# Bets Off - Developer Guide

**Last Updated:** May 27, 2025

This document provides detailed information for developers working on the Bets Off Chrome extension.

## Current Status

**✅ READY FOR CHROME WEB STORE SUBMISSION** - The extension is complete, tested, and production-ready.

## Development Environment Setup

1. **Prerequisites**
   - Node.js 18.0.0+ (LTS version required)
   - Chrome browser
   - Git

2. **Initial Setup**

   ```bash
   git clone https://github.com/your-username/bets-off-extension.git
   cd bets-off-extension
   npm install
   ```

3. **Development Commands**

   ```bash
   # Generate gambling blocking rules
   npm run build:rules
   
   # Generate icons from SVG source (if needed)
   npm run build:icons
   ```

## Key Components

### 1. Declarative Net Request Rules

The extension uses Chrome's [Declarative Net Request API](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/) for efficient content blocking:

- `rules/block.json`: Static rules for blocking ads and trackers
- `rules/gambling.json`: Auto-generated rules from gambling domains list

**Rule Generation Process:**

1. Domains listed in `data/gambling-domains.txt`
2. `scripts/generate-rules.js` transforms these into blocking rules
3. Rules are registered in `manifest.json` under `declarative_net_request.rule_resources`

### 2. Background Service Worker

Located at `scripts/background.js`, the background service worker:

- Initializes extension storage
- Listens for blocked requests to update counters
- Manages the badge counter
- Handles messaging from the popup and content script
- Toggles rule sets when protection is enabled/disabled

Key features:

- Daily counter reset
- Ad vs tracker classification logic
- Domain reporting system
- Port-based communication with popup

### 3. Content Script

Located at `scripts/content-script.js`, the content script:

- Runs in the context of web pages
- Identifies gambling content using pattern matching
- Removes inline betting elements (e.g., ESPN BET promotions)
- Communicates blocked items to the background script
- Uses smart selectors to avoid over-blocking

### 4. Popup UI

Implemented in `popup.html`, `scripts/popup.js`, and `css/popup.css`, the popup provides:

- Statistics display with shield branding
- Protection toggle
- Badge counter toggle
- Domain reporting
- Help resources (GA, Gam-Anon, Reddit)
- Bug reporting feature
- Buy Me a Coffee support link
- Theme switching (Light/Dark/System)

The UI uses a modern, compact tabbed design (320x500px) with consistent shield branding.

## Extension Flow

1. **Initialization**
   - Background script sets up storage and listeners
   - Declarative Net Request rules are loaded

2. **Request Blocking**
   - Requests matching rules in block.json or gambling.json are blocked
   - Background script detects blocked requests via webRequest.onErrorOccurred
   - Counters are updated based on request classification

3. **Content Blocking**
   - Content script scans DOM for gambling elements
   - Removes elements containing betting keywords
   - Reports blocked content to background script

4. **UI Interaction**
   - Popup connects to background script via port for real-time updates
   - Toggle actions are sent to background script
   - Background script updates storage and rule enablement

## Production Code Standards

- **NO console.log statements** in production files
- **NO console.error statements** except for critical errors
- All debugging code has been removed
- Code is minified and optimized

## Testing

### Manual Testing Checklist ✅ ALL COMPLETE

1. ✅ Install extension from unpacked source
2. ✅ Enable/disable protection toggle works
3. ✅ Badge counter shows correct blocked count
4. ✅ Badge counter toggle works
5. ✅ Visit gambling domains (e.g., draftkings.com) - properly blocked
6. ✅ Visit ESPN.com - inline betting ads removed
7. ✅ Report domain form works correctly
8. ✅ All tabs in popup UI function properly
9. ✅ Theme switching works correctly
10. ✅ Bug report feature generates proper email template
11. ✅ No scrolling at 100% zoom in popup

## Common Issues & Solutions

### Rule Generation

If rules aren't being properly generated:

1. Ensure Node.js 18+ LTS version
2. Verify permissions on rules directory
3. Check for syntax errors in gambling-domains.txt

### Extension Not Blocking Content

1. Verify both rule sets are in manifest.json
2. Check the background service worker console for errors
3. Force reload the extension in chrome://extensions/

### Theme Issues

- System theme detection uses `prefers-color-scheme` media query
- SVG icons update dynamically based on theme

## Publishing Process

### Chrome Web Store Submission

1. Version is already set to 2.0.0 in manifest.json
2. Create ZIP package:
   ```bash
   zip -r bets-off-extension.zip . \
     -x "*.git*" \
     -x "*node_modules*" \
     -x "*.DS_Store" \
     -x "package*.json" \
     -x ".archive/*" \
     -x "screenshots/*" \
     -x ".dev-docs/*" \
     -x "*.md" \
     -x "debug-*.html" \
     -x "test-*.html" \
     -x "popup-inline.html" \
     -x "popup-no-js.html" \
     -x "scripts/content.js" \
     -x "scripts/gen-icons.js"
   ```
3. Submit via [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

## Architecture Decisions

### Manifest V3

The extension uses Manifest V3 for:

- Better performance through declarativeNetRequest
- Improved security via service workers
- Future compatibility with Chrome's extension platform

### Rule-Based Blocking

Declarative rules were chosen over webRequest blocking for:

- Better performance (no request interception)
- Reduced permissions requirements
- Asynchronous operation not impacting page load

### Dual-Layer Blocking

Combines declarativeNetRequest for domains with content script for inline elements:

- Network-level blocking for known domains
- DOM-level removal for embedded content
- Comprehensive protection against gambling content

## Important Notes

- Extension uses shield "B" branding, NOT GA logos
- All gambling domains are in `data/gambling-domains.txt`
- Privacy-first: no data collection or external analytics
- Support resources are linked but not affiliated