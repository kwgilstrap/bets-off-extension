// Bets Off - Minimal Content Script
// Simple script to count removed ad elements

// Common ad container selectors - more specific to avoid blocking main content
const adSelectors = [
  // Specific gambling ad containers
  "div[id*='betting-ad']",
  "div[id*='casino-ad']",
  "div[id*='gambling-ad']",
  "div[class*='betting-ad']",
  "div[class*='casino-ad']",
  "div[class*='gambling-ad']",
  
  // ESPN BET specific selectors
  "a[href*='espnbet.com']",
  "a[href*='espnbet.app.link']",
  "div[data-espnbettrack]",
  "*[data-logo='espnbet']",
  "*[data-betting='true']",
  
  // Common ad platforms
  "div[class*='google-ad']",
  "div[class*='doubleclick']",
  "div[class*='adsense']",
  
  // Generic ad containers (more specific)
  "div.advertisement",
  "div.ad-container",
  "div.ad-wrapper",
  "aside.advertisement",
  "section.advertisement",
  
  // Iframe ads
  "iframe[src*='doubleclick']",
  "iframe[src*='googlesyndication']",
  "iframe[src*='adsystem']"
];

// Function to safely check class names
function hasClassNameWith(element, substring) {
  // For regular HTML elements with string className
  if (typeof element.className === 'string') {
    return element.className.includes(substring);
  }
  
  // For SVG elements (className is SVGAnimatedString)
  if (element.className && typeof element.className.baseVal === 'string') {
    return element.className.baseVal.includes(substring);
  }
  
  // Use getAttribute as fallback
  const classAttr = element.getAttribute('class');
  return classAttr ? classAttr.includes(substring) : false;
}

// Function to remove ad elements
function removeAdElements() {
  let removedCount = 0;
  
  adSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // If element is visible and not already hidden
        if (el.offsetParent !== null && el.style.display !== 'none') {
          el.style.display = 'none';
          removedCount++;
        }
      });
    } catch (e) {
      // Error processing selector - silently continue
    }
  });
  
  // Additional text-based detection for betting elements
  const bettingKeywords = ['ESPN BET', 'ESPNBET', 'DraftKings', 'FanDuel', 'BetMGM', 
                           'Caesars Sportsbook', 'bet now', 'place bet', 'betting odds',
                           'sportsbook', 'gambling', 'wager'];
  
  // Check only links with betting content - more targeted approach
  const links = document.querySelectorAll('a[href*="espnbet"], a[href*="draftkings"], a[href*="fanduel"], a[href*="betmgm"], a[href*="caesars"], a[href*="bet365"]');
  links.forEach(el => {
    if (el.offsetParent !== null && el.style.display !== 'none') {
      // Check if it's a small betting widget (not main content)
      const parent = el.parentElement;
      if (parent && (parent.classList.contains('link-text-short') || 
                     parent.querySelector('.link-text-short') ||
                     parent.offsetHeight < 100)) {
        parent.style.display = 'none';
        removedCount++;
      } else {
        el.style.display = 'none';
        removedCount++;
      }
    }
  });
  
  // Target specific ESPN BET inline elements using attribute selectors
  const espnBetElements = document.querySelectorAll(
    'a[data-track-event_name*="espn bet"], ' +
    'a[data-track-event_detail*="espn bet"], ' +
    '*[data-espnbettrack="true"], ' +
    'span.link-text-short'
  );
  
  espnBetElements.forEach(el => {
    // Only remove if it contains ESPN BET text
    const text = el.textContent || '';
    if (text.includes('ESPN BET') && el.offsetParent !== null && el.style.display !== 'none') {
      el.style.display = 'none';
      removedCount++;
    }
  });
  
  // If any elements were removed, notify background script
  if (removedCount > 0) {
    // Check if extension context is still valid before sending message
    if (chrome.runtime?.id) {
      chrome.runtime.sendMessage({
        action: 'elementsRemoved',
        count: removedCount
      }).catch(() => {
        // Extension context invalidated, ignore error
      });
    }
  }
}

// Execute on page load
if (chrome.runtime?.id) {
  removeAdElements();
}

// Observe DOM changes to catch dynamically inserted ads
if (chrome.runtime?.id && document.body) {
  const adObserver = new MutationObserver(() => {
    if (chrome.runtime?.id) {
      removeAdElements();
    }
  });

  // Start observing the document with configured parameters
  adObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}