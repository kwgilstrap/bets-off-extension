# Technical Reference

**Last Updated:** May 27, 2025

## **Architecture**

- **Manifest V3** Chrome extension
- **Background:** Service worker (`background.js`)
- **Content Script:** Injected on all pages (`content-script.js`)
- **Popup:** UI interface (`popup.html` + `popup.js`)

## **Storage Structure**

```javascript
{
  enabled: true,        // Protection on/off
  showBadge: true,      // Show counter badge
  theme: 'system',      // 'light' | 'dark' | 'system'
  stats: {
    adsBlocked: 45,
    trackersBlocked: 72
  }
}
```

## **Blocking System**

1. **Static Rules** (`/rules/block.json`) - 15 general patterns
2. **Dynamic Rules** (`/rules/gambling.json`) - 29 domains
3. **Content Script** - DOM scanning and removal

## **Current Domain List** (29 total)

```
draftkings.com    fanduel.com     bet365.com
betmgm.com       caesars.com     pointsbet.com
williamhill.com  888sport.com    unibet.com
betway.com       paddypower.com  betfair.com
skybet.com       ladbrokes.com   coral.co.uk
betfred.com      sportingbet.com bwin.com
pokerstars.com   ggpoker.com     partypoker.com
wsop.com         bovada.lv       betonline.ag
mybookie.ag      sportsbetting.ag pinnacle.com
stake.com        stake.us
```

## **Message Protocol**

```javascript
// Popup → Background
{ action: 'getStats' }
{ action: 'toggleProtection', enabled: boolean }
{ action: 'toggleBadge', showBadge: boolean }
{ action: 'reportDomain', domain: string, category: string }

// Background → Popup
{ adsBlocked: number, trackersBlocked: number }
```

## **Files Not to Touch**

- `/scripts/background.js` - Working perfectly
- `/scripts/content-script.js` - Working perfectly
- `/data/gambling-domains.txt` - Current and complete
- `/rules/*.json` - Auto-generated, don't edit
