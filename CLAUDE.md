# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Browser Extension Architecture

The Bets Off extension is a Chrome (Manifest V3) extension for blocking gambling-related content and ads online. It consists of three main components:

1. **Background Service Worker** (`js/background.js`): Runs in the background to block web requests to gambling domains and track statistics.
   - Handles ad/tracker blocking using `chrome.webRequest` API
   - Maintains lists of gambling domains and keywords
   - Stores blocking statistics in Chrome's local storage

2. **Content Script** (`js/content.js`): Runs in the context of web pages to identify and block gambling content.
   - Scans DOM for gambling-related content
   - Hides or modifies elements containing gambling references
   - Uses MutationObserver to detect dynamically loaded content
   - Adds visual warnings to gambling-related links

3. **Popup UI** (`popup.html`, `popup.js`, `css/popup.css`): User interface for controlling the extension and viewing statistics.
   - Displays blocking statistics
   - Provides toggle for enabling/disabling protection
   - Contains form for reporting gambling domains
   - Offers resources for gambling addiction support

## Browser APIs Used

The extension makes use of several Chrome extension APIs:
- `chrome.storage.local` - For storing user preferences and statistics
- `chrome.webRequest` - For intercepting and blocking network requests to gambling sites
- `chrome.webNavigation` - For detecting when users navigate to gambling sites
- `chrome.runtime` - For messaging between different parts of the extension

## Development Notes

### Testing the Extension

1. **Load the extension in Chrome:**
   ```
   chrome://extensions/ → Developer mode → Load unpacked → Select the extension directory
   ```

2. **Inspect background service worker:**
   ```
   Navigate to chrome://extensions/ → Find the extension → Click "Inspect views: service worker"
   ```

3. **Inspect popup:**
   ```
   Click on the extension icon → Right-click → Inspect
   ```

4. **Test content script:**
   ```
   Visit any webpage → Right-click → Inspect → Console → Look for Bets Off messages
   ```

### Debugging

1. Check the console logs in the background service worker Inspector
2. Check the popup console for UI-related issues 
3. Check the webpage console for content script issues

### UI Validation

Use the provided `validation/validation_report.html` when updating the UI to ensure compatibility with:
- Different screen sizes
- Dark mode support
- Accessibility requirements
- Performance metrics

## Extension Details

- **Manifest Version**: 3
- **Permissions**: storage, webRequest, webNavigation
- **Host Permissions**: `<all_urls>`