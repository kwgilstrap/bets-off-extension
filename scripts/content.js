// Bets Off - Content Script with Counter Updates
// This version sends messages to update counters when elements are removed

// Common ad container selectors
const adSelectors = [
  // Class-based selectors (substring matching)
  "*[class*='ad-']", 
  "*[class*='ads-']",
  "*[class*='adv-']",
  "*[class*='advertisement']",
  "*[class*='sponsor']",
  "*[class*='banner']",
  "*[class*='promo']",
  
  // ID-based selectors
  "*[id*='ad-']",
  "*[id*='ads-']",
  "*[id*='adv-']",
  "*[id*='sponsor']",
  "*[id*='banner']",
  "*[id*='promo']",
  
  // Data attribute selectors
  "*[data-ad]",
  "*[data-ads]",
  "*[data-adunit]",
  "*[data-ad-unit]",
  "*[data-ad-slot]",
  "*[data-ad-client]",
  "*[data-adtest]",
  
  // Iframe source selectors
  "iframe[src*='ads']",
  "iframe[src*='ad.']",
  "iframe[src*='banner']",
  "iframe[src*='sponsor']",
  
  // Common ad container selectors
  "div.ad",
  "div.ads",
  "div.advert",
  "div.advertisement",
  "div.advertising",
  "aside.ad",
  "section.ad",
  "section.ads",
  
  // Ad network specific
  "div[class*='taboola']",
  "div[class*='outbrain']",
  "div[id*='taboola']",
  "div[id*='outbrain']",
  "div[class*='mgid']",
  "div[class*='gemini']",
  "div[class*='zergnet']",
  "div[class*='nativo']"
];

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
      console.debug('Bets Off: Error processing selector', selector, e);
    }
  });
  
  // If any elements were removed, notify background script
  if (removedCount > 0) {
    chrome.runtime.sendMessage({
      action: 'elementsRemoved',
      count: removedCount
    });
  }
  
  return removedCount;
}

// Function to check gambling content (safe version)
function checkElementForGamblingContent(element) {
  try {
    // Safe class check - fixes the TypeError
    function hasClassNameWith(el, substring) {
      // For regular HTML elements with string className
      if (typeof el.className === 'string') {
        return el.className.includes(substring);
      }
      
      // For SVG elements (className is SVGAnimatedString)
      if (el.className && typeof el.className.baseVal === 'string') {
        return el.className.baseVal.includes(substring);
      }
      
      // Alternative using classList
      if (el.classList) {
        for (let i = 0; i < el.classList.length; i++) {
          if (el.classList[i].includes(substring)) {
            return true;
          }
        }
      }
      
      // Use getAttribute as fallback
      const classAttr = el.getAttribute('class');
      return classAttr ? classAttr.includes(substring) : false;
    }

    // Check ID
    const hasGamblingId = element.id && 
      (element.id.includes('betting') || 
       element.id.includes('gambling') || 
       element.id.includes('odds') ||
       element.id.includes('wager'));
    
    // Check classes safely
    const hasGamblingClass = 
      hasClassNameWith(element, 'betting') || 
      hasClassNameWith(element, 'gambling') || 
      hasClassNameWith(element, 'odds') ||
      hasClassNameWith(element, 'wager');
    
    // Check text content
    const hasGamblingText = element.textContent && 
      (element.textContent.includes('Bet Now') || 
       element.textContent.includes('Place Bet') || 
       element.textContent.includes('Odds') ||
       element.textContent.includes('Wager'));
    
    // Check data attributes
    const hasGamblingData = 
      element.dataset && 
      Object.keys(element.dataset).some(key => 
        key.includes('betting') || 
        key.includes('gambling') || 
        key.includes('odds'));
    
    return hasGamblingId || hasGamblingClass || hasGamblingText || hasGamblingData;
    
  } catch (e) {
    console.debug('Bets Off: Error checking gambling content', e);
    return false;
  }
}

// Function to remove gambling elements
function removeGamblingElements() {
  let removedCount = 0;
  
  try {
    // Common gambling-related selectors
    const gamblingSelectors = [
      "*[id*='betting']",
      "*[id*='gambling']",
      "*[id*='odds']",
      "*[id*='wager']",
      "*[class*='betting']",
      "*[class*='gambling']",
      "*[class*='odds']",
      "*[class*='wager']",
      "*[data-betting]",
      "*[data-gambling]",
      "*[data-odds]"
    ];
    
    // Remove elements matching selectors
    gamblingSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el.offsetParent !== null && el.style.display !== 'none') {
            el.style.display = 'none';
            removedCount++;
          }
        });
      } catch (e) {
        console.debug('Bets Off: Error processing gambling selector', selector, e);
      }
    });
    
    // Check all divs and sections for gambling content
    const containers = document.querySelectorAll('div, section, aside, article');
    containers.forEach(container => {
      if (checkElementForGamblingContent(container)) {
        if (container.offsetParent !== null && container.style.display !== 'none') {
          container.style.display = 'none';
          removedCount++;
        }
      }
    });
    
  } catch (e) {
    console.debug('Bets Off: Error removing gambling elements', e);
  }
  
  // If any gambling elements were removed, notify background script
  if (removedCount > 0) {
    chrome.runtime.sendMessage({
      action: 'elementsRemoved',
      count: removedCount
    });
  }
  
  return removedCount;
}

// Execute on page load
let initialAdRemovalCount = removeAdElements();
let initialGamblingRemovalCount = removeGamblingElements();

// Log initial removal
console.debug(`Bets Off: Initially removed ${initialAdRemovalCount} ad elements and ${initialGamblingRemovalCount} gambling elements`);

// Observe DOM changes to catch dynamically inserted ads
const adObserver = new MutationObserver((mutations) => {
  const adRemovalCount = removeAdElements();
  const gamblingRemovalCount = removeGamblingElements();
  
  if (adRemovalCount > 0 || gamblingRemovalCount > 0) {
    console.debug(`Bets Off: Removed ${adRemovalCount} ad elements and ${gamblingRemovalCount} gambling elements after DOM mutation`);
  }
});

// Start observing the document with configured parameters
adObserver.observe(document.body, {
  childList: true,
  subtree: true
});

// Fetch and apply remote cosmetic filters
async function fetchRemoteFilters() {
  try {
    const response = await fetch('https://mycdn.com/mini-list.json');
    if (response.ok) {
      const data = await response.json();
      if (data && data.cosmeticFilters && Array.isArray(data.cosmeticFilters)) {
        let remoteRemovalCount = 0;
        
        // Apply additional cosmetic filters
        data.cosmeticFilters.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              if (el.offsetParent !== null && el.style.display !== 'none') {
                el.style.display = 'none';
                remoteRemovalCount++;
              }
            });
          } catch (e) {
            console.debug('Bets Off: Error applying remote filter', selector, e);
          }
        });
        
        if (remoteRemovalCount > 0) {
          console.debug(`Bets Off: Removed ${remoteRemovalCount} elements using remote filters`);
          chrome.runtime.sendMessage({
            action: 'elementsRemoved',
            count: remoteRemovalCount
          });
        }
      }
    }
  } catch (e) {
    console.debug('Bets Off: Error fetching remote filters', e);
  }
}

// Optional: Fetch remote filters
// Uncomment to enable remote filter updates
// fetchRemoteFilters();