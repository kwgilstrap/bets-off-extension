# Chrome Web Store Pre-Submission Checklist

**Last Updated: May 27, 2025**

**Last Updated: May 27, 2025**

## ✅ Code Cleanup (COMPLETED)

- [x] Removed all console.log statements from:
  - [x] scripts/content-script.js
  - [x] scripts/popup-simple.js
  - [x] scripts/generate-rules.js
  - [x] scripts/popup.js
- [x] Removed all console.error statements
- [x] No debug code remaining

## 📸 Store Assets Needed

- [x] **Icon**: 128x128 PNG (already have: icons/icon128.png)
- [x] **Screenshots**: 1280x800 or 640x400 (COMPLETED - 11 screenshots)
  - [x] Screenshot 1: Extension popup showing blocked stats (operating-normal.png)
  - [x] Screenshot 2: Extension blocking gambling sites (light-mode-blocking-site.png, light-mode-blocking-site-02.png)
  - [x] Screenshot 3: Theme options - Dark mode (dark-mode-00.png, dark-mode-01.png)
  - [x] Screenshot 4: Help resources tab (lightmode-help-tab.png, help-tab.png)
  - [x] Screenshot 5: Report tab (lightmode-report-tab.png)
  - [x] Additional: Options with counter off (lightmode-options-counteroff.png)
  - [x] Additional: Extensions page view (Extensions.png)
- [ ] **Promotional Images** (optional):
  - [ ] Small tile: 440x280
  - [ ] Large tile: 920x680
  - [ ] Marquee: 1400x560

## 📝 Store Listing Content (COMPLETED)

- [x] Extension name: "Bets Off - Block Gambling Ads & Sites"
- [x] Short description (132 chars): "Block gambling ads, betting sites & casino content. Protect yourself or loved ones from gambling triggers while browsing."
- [x] Detailed description: See `docs/chrome-store-listing.md`
- [x] Category: Productivity
- [x] Language: English
- [x] Tags: gambling blocker, ad blocker, addiction recovery, parental control, productivity

## 🔒 Privacy & Compliance (COMPLETED)

- [x] Privacy policy created: `privacy.html` (ready in project root)
- [x] Privacy policy text ready for Chrome Web Store submission
- [x] Host permissions justified
- [x] Single purpose defined
- [x] No remote code usage
- [x] No data collection declared

## 🧪 Testing Requirements (COMPLETED)

- [x] Test in incognito mode
- [x] Verify blocking works on popular gambling sites:
  - [x] DraftKings
  - [x] FanDuel
  - [x] BetMGM
  - [x] Caesars
  - [x] PokerStars
- [x] Test ad blocking on major sites:
  - [x] ESPN (inline ESPN BET promotions blocked)
  - [x] YouTube
  - [x] News sites
- [x] Verify all UI elements work:
  - [x] Protection toggle (persists state)
  - [x] Theme switching (light/dark/system with smooth transitions)
  - [x] Tab navigation (Options, Report, Help)
  - [x] Report functionality (email template generation)
  - [x] Help links (GA, Gam-Anon, Reddit)
- [x] Check performance impact (minimal, uses declarativeNetRequest)
- [x] Test on different Chrome versions (88+)

## 📦 Package Preparation

- [x] manifest.json version: 2.0.0
- [x] All icons present (16, 32, 48, 128, 256)
- [x] No node_modules in package
- [x] Create .zip file excluding:
  - [x] .git/
  - [x] .archive/
  - [x] .dev-docs/
  - [x] node_modules/
  - [x] .DS_Store files
  - [x] package*.json
  - [x] Screenshots folder
  - [x] Debug/test HTML files
  - [x] All markdown files

## 🚀 Submission Steps

1. Create screenshots showing extension in action
2. Host privacy policy at <https://betsoff.io/privacy>
3. Zip extension files (excluding dev files)
4. Go to Chrome Web Store Developer Dashboard
5. Create new item
6. Upload .zip file
7. Fill in store listing information
8. Add screenshots
9. Set pricing (free)
10. Submit for review

## 📋 Post-Submission

- [ ] Monitor developer dashboard for review status
- [ ] Respond to any reviewer feedback
- [ ] Plan announcement for when approved
- [ ] Update website with Chrome Web Store link
- [ ] Create user documentation/FAQ

## Notes

- Review typically takes 1-3 business days
- May need to provide additional justification for permissions
- Keep original assets for future updates
