// Bets Off - Content Script
// This script runs in the context of web pages and handles content blocking

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if blocking is enabled
  chrome.storage.local.get('blocking_enabled', function(data) {
    if (data.blocking_enabled === false) {
      return;
    }
    
    // Scan page for gambling content
    scanForGamblingContent();
  });
});

// Non-blocking listener for stats tracking
chrome.webRequest.onBeforeRequest.addListener(
  details => chrome.runtime.sendMessage({ type: 'pageHit', url: details.url }),
  { urls: ['<all_urls>'] }
);

// List of gambling-related keywords to detect in page content
const gamblingKeywords = [
  'betting',
  'casino',
  'poker',
  'slots',
  'roulette',
  'blackjack',
  'baccarat',
  'sportsbook',
  'wagering',
  'gambling',
  'bookmaker',
  'bet now',
  'place bet',
  'odds',
  'jackpot'
  // This would be expanded in a real implementation
];

// Scan the page for gambling content
function scanForGamblingContent() {
  // Look for gambling-related iframes
  const iframes = document.querySelectorAll('iframe');
  let blockedAds = 0;
  
  iframes.forEach(iframe => {
    // Check iframe src for gambling keywords
    if (iframe.src && gamblingKeywords.some(keyword => iframe.src.toLowerCase().includes(keyword))) {
      // Hide the iframe
      iframe.style.display = 'none';
      blockedAds++;
    }
  });
  
  // Look for gambling-related ads in common ad containers
  const adContainers = document.querySelectorAll('div[id*="ad"], div[class*="ad"], div[id*="banner"], div[class*="banner"]');
  
  adContainers.forEach(container => {
    // Check container content for gambling keywords
    const content = container.textContent.toLowerCase();
    if (gamblingKeywords.some(keyword => content.includes(keyword))) {
      // Hide the container
      container.style.display = 'none';
      blockedAds++;
    }
  });
  
  // Look for gambling-related links
  const links = document.querySelectorAll('a');
  
  links.forEach(link => {
    // Check link href and text for gambling keywords
    if (link.href && gamblingKeywords.some(keyword => link.href.toLowerCase().includes(keyword)) ||
        link.textContent && gamblingKeywords.some(keyword => link.textContent.toLowerCase().includes(keyword))) {
      // Add warning class to the link
      link.classList.add('bets-off-warning');
      // Optional: replace link with warning
      // link.innerHTML = '⚠️ Gambling content blocked';
    }
  });
  
  // If any ads were blocked, update the counter
  if (blockedAds > 0) {
    chrome.runtime.sendMessage({
      action: 'incrementAdsBlocked',
      count: blockedAds
    });
  }
  
  // Add custom CSS to highlight warnings
  const style = document.createElement('style');
  style.textContent = `
    .bets-off-warning {
      border: 2px solid #e63946 !important;
      position: relative !important;
    }
    .bets-off-warning::before {
      content: "⚠️" !important;
      position: absolute !important;
      top: -10px !important;
      left: -10px !important;
      background: #e63946 !important;
      color: white !important;
      border-radius: 50% !important;
      width: 20px !important;
      height: 20px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 12px !important;
    }
  `;
  document.head.appendChild(style);
  
  // Continue monitoring for dynamically added content
  observeDynamicContent();
}

// Monitor for dynamically added content
function observeDynamicContent() {
  // Create a mutation observer to watch for new elements
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        // Check new nodes for gambling content
        mutation.addedNodes.forEach(node => {
          // Only process element nodes
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the new element is an ad
            checkElementForGamblingContent(node);
          }
        });
      }
    });
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Check a specific element for gambling content
function checkElementForGamblingContent(element) {
  // Check if element is an iframe with gambling content
  if (element.tagName === 'IFRAME' && element.src && 
      gamblingKeywords.some(keyword => element.src.toLowerCase().includes(keyword))) {
    element.style.display = 'none';
    chrome.runtime.sendMessage({
      action: 'incrementAdsBlocked',
      count: 1
    });
  }
  
  // Check if element is an ad container with gambling content
  if (element.id && (element.id.includes('ad') || element.id.includes('banner')) ||
      element.className && (element.className.includes('ad') || element.className.includes('banner'))) {
    const content = element.textContent.toLowerCase();
    if (gamblingKeywords.some(keyword => content.includes(keyword))) {
      element.style.display = 'none';
      chrome.runtime.sendMessage({
        action: 'incrementAdsBlocked',
        count: 1
      });
    }
  }
  
  // Check if element is a link with gambling content
  if (element.tagName === 'A') {
    if (element.href && gamblingKeywords.some(keyword => element.href.toLowerCase().includes(keyword)) ||
        element.textContent && gamblingKeywords.some(keyword => element.textContent.toLowerCase().includes(keyword))) {
      element.classList.add('bets-off-warning');
    }
  }
  
  // Recursively check child elements
  if (element.children && element.children.length > 0) {
    Array.from(element.children).forEach(child => {
      checkElementForGamblingContent(child);
    });
  }
}
