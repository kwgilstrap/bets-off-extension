// Bets Off - Background Service Worker
// This script runs in the background and handles ad blocking functionality

// Initialize counters and settings
chrome.runtime.onInstalled.addListener(() => {
  // Set default values
  chrome.storage.local.set({
    'blocking_enabled': true,
    'ads_blocked': 0,
    'trackers_blocked': 0,
    'reported_domains': []
  });
  
  console.log('Bets Off extension installed successfully');
});

// List of gambling-related domains to block
const gamblingDomains = [
  'bet365.com',
  'betway.com',
  'williamhill.com',
  'paddypower.com',
  'skybet.com',
  'ladbrokes.com',
  'coral.co.uk',
  'unibet.com',
  'betfair.com',
  '888casino.com',
  'casumo.com',
  'leovegas.com',
  'pokerstars.com',
  'partypoker.com',
  'draftkings.com',
  'fanduel.com'
  // This would be expanded in a real implementation
];

// List of gambling-related keywords to detect
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
  'bookmaker'
  // This would be expanded in a real implementation
];

// Non-blocking listener for stats tracking
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    // Check if blocking is enabled
    chrome.storage.local.get('blocking_enabled', function(data) {
      if (data.blocking_enabled === false) {
        return;
      }
      
      // Extract domain from URL
      const url = new URL(details.url);
      const domain = url.hostname;
      
      let isGamblingContent = false;
      
      // Check if domain is in gambling domains list
      if (gamblingDomains.some(gDomain => domain.includes(gDomain))) {
        isGamblingContent = true;
      }
      
      // Check URL for gambling keywords
      if (!isGamblingContent && gamblingKeywords.some(keyword => details.url.toLowerCase().includes(keyword))) {
        isGamblingContent = true;
      }
      
      if (isGamblingContent) {
        // Increment blocked ads counter
        chrome.storage.local.get('ads_blocked', function(data) {
          const newCount = (data.ads_blocked || 0) + 1;
          chrome.storage.local.set({ 'ads_blocked': newCount });
        });
      }
    });
  },
  { urls: ["<all_urls>"] }
);

// Listen for navigation to gambling sites
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  // Check if blocking is enabled
  chrome.storage.local.get('blocking_enabled', function(data) {
    if (data.blocking_enabled === false) {
      return;
    }
    
    // Extract domain from URL
    const url = new URL(details.url);
    const domain = url.hostname;
    
    // Check if domain is in gambling domains list
    if (gamblingDomains.some(gDomain => domain.includes(gDomain))) {
      // Increment trackers blocked counter
      chrome.storage.local.get('trackers_blocked', function(data) {
        const newCount = (data.trackers_blocked || 0) + 1;
        chrome.storage.local.set({ 'trackers_blocked': newCount });
      });
    }
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'getStats') {
    // Return current statistics
    chrome.storage.local.get(['ads_blocked', 'trackers_blocked'], function(data) {
      sendResponse({
        ads_blocked: data.ads_blocked || 0,
        trackers_blocked: data.trackers_blocked || 0
      });
    });
    return true; // Required for async sendResponse
  }
  
  if (message.action === 'reportDomain') {
    // Handle domain reporting
    const { domain, details } = message;
    
    // In a real implementation, this would send the report to a server
    console.log('Domain reported:', domain, details);
    
    // Store report locally
    chrome.storage.local.get('reported_domains', function(data) {
      const reportedDomains = data.reported_domains || [];
      reportedDomains.push({
        domain,
        details,
        date: new Date().toISOString()
      });
      chrome.storage.local.set({ 'reported_domains': reportedDomains });
      sendResponse({ success: true });
    });
    return true; // Required for async sendResponse
  }
  
  if (message.type === 'pageHit' && message.url) {
    // Track page hits from the content script
    const url = message.url;
    let isGamblingContent = false;
    
    // Extract domain from URL
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      // Check if domain is in gambling domains list
      if (gamblingDomains.some(gDomain => domain.includes(gDomain))) {
        isGamblingContent = true;
      }
      
      // Check URL for gambling keywords
      if (!isGamblingContent && gamblingKeywords.some(keyword => url.toLowerCase().includes(keyword))) {
        isGamblingContent = true;
      }
      
      if (isGamblingContent) {
        // Increment blocked ads counter
        chrome.storage.local.get('ads_blocked', function(data) {
          const newCount = (data.ads_blocked || 0) + 1;
          chrome.storage.local.set({ 'ads_blocked': newCount });
        });
      }
    } catch (e) {
      console.error('Invalid URL:', url);
    }
  }
});
