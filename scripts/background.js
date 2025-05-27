// Bets Off - Enhanced Background Script with Counter Logic and Domain Reporting
// This version properly tracks blocked ads and trackers and handles domain reporting

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    adsBlocked: 0,
    trackersBlocked: 0,
    lastReset: Date.now(),
    enabled: true,
    showBadge: true, // Default to showing the badge
    reportedDomains: []
  });
});

// Reset counters daily
function checkAndResetCounters() {
  chrome.storage.local.get(['lastReset'], (data) => {
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    if (now - data.lastReset > oneDayInMs) {
      chrome.storage.local.set({
        adsBlocked: 0,
        trackersBlocked: 0,
        lastReset: now
      });
    }
  });
}

// Check for daily reset on startup
chrome.runtime.onStartup.addListener(checkAndResetCounters);

// Simple classifier for ad vs tracker requests
function isAdRequest(url) {
  const adPatterns = [
    /ad(s|v|server|img|banner)/i,
    /doubleclick/i,
    /googlesyndication/i,
    /banner/i,
    /sponsor/i,
    /taboola/i,
    /outbrain/i,
    /mgid/i
  ];
  
  return adPatterns.some(pattern => pattern.test(url));
}

function isTrackerRequest(url) {
  const trackerPatterns = [
    /analytics/i,
    /tracker/i,
    /pixel/i,
    /stats?/i,
    /metrics/i,
    /telemetry/i,
    /logging/i,
    /beacon/i,
    /fingerprint/i
  ];
  
  return trackerPatterns.some(pattern => pattern.test(url));
}

// Helper function to increment counters
function incrementCounter(counterName) {
  chrome.storage.local.get(['enabled', counterName], (data) => {
    // Only increment if protection is enabled
    if (data.enabled === false) {
      return;
    }
    
    const newValue = (data[counterName] || 0) + 1;
    const update = {};
    update[counterName] = newValue;
    chrome.storage.local.set(update);
    
    // Update badge if adsBlocked counter
    if (counterName === 'adsBlocked') {
      updateBadge(newValue);
    }
  });
}

// Helper function to update the extension badge
function updateBadge(count) {
  chrome.storage.local.get(['enabled', 'showBadge'], (data) => {
    // Clear badge when disabled or when badge is set to not show
    if (data.enabled === false || data.showBadge === false) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }
    
    const text = count > 999 ? '999+' : count.toString();
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color: '#E53935' });
  });
}

// Use webRequest API to track blocked requests
chrome.webRequest.onErrorOccurred.addListener(
  (details) => {
    // Check if the request was blocked by the extension
    if (details.error === "net::ERR_BLOCKED_BY_CLIENT") {
      // Determine if it's an ad or tracker
      const isAd = isAdRequest(details.url);
      const isTracker = isTrackerRequest(details.url);
      
      if (isAd) {
        incrementCounter('adsBlocked');
      }
      
      if (isTracker) {
        incrementCounter('trackersBlocked');
      }
    }
  },
  {urls: ["<all_urls>"]}
);

// Function to toggle declarative net request rules
function toggleRules(enabled) {
  if (typeof chrome.declarativeNetRequest !== 'undefined' && 
      typeof chrome.declarativeNetRequest.updateEnabledRulesets !== 'undefined') {
    
    chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: enabled ? ['block_rules', 'gambling_rules'] : [],
      disableRulesetIds: enabled ? [] : ['block_rules', 'gambling_rules']
    });
  }
}

// Function to add reported gambling domain
function saveReportedDomain(domain, category) {
  chrome.storage.local.get(['reportedDomains'], (data) => {
    const reportedDomains = data.reportedDomains || [];
    
    // Add new domain report
    reportedDomains.push({
      domain: domain,
      category: category,
      timestamp: Date.now()
    });
    
    // Save updated list
    chrome.storage.local.set({ reportedDomains: reportedDomains });
    
    // Optionally send to a server for processing in a production environment
    // sendReportToServer(domain, category);
  });
  
  return { success: true };
}

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'elementsRemoved') {
    // Increment the counter by the number of elements removed
    chrome.storage.local.get(['enabled', 'adsBlocked'], (data) => {
      // Only increment if protection is enabled
      if (data.enabled === false) {
        return;
      }
      
      const count = message.count || 1;
      const newValue = (data.adsBlocked || 0) + count;
      chrome.storage.local.set({ adsBlocked: newValue });
      
      // Update badge
      updateBadge(newValue);
    });
  }
  
  if (message.action === 'getStats') {
    // Return current stats
    chrome.storage.local.get(['adsBlocked', 'trackersBlocked'], (data) => {
      sendResponse({
        adsBlocked: data.adsBlocked || 0,
        trackersBlocked: data.trackersBlocked || 0
      });
    });
    return true; // Required for async sendResponse
  }
  
  if (message.action === 'toggleProtection') {
    // Toggle protection state
    const isEnabled = message.enabled;
    
    // Update badge based on new state and badge visibility preference
    if (!isEnabled) {
      chrome.action.setBadgeText({ text: '' });
    } else {
      chrome.storage.local.get(['adsBlocked', 'showBadge'], (data) => {
        if (data.showBadge !== false) {
          updateBadge(data.adsBlocked || 0);
        }
      });
    }
    
    // Toggle blocking rules
    toggleRules(isEnabled);
    
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === 'reportDomain') {
    // Process domain report
    const result = saveReportedDomain(message.domain, message.category);
    sendResponse(result);
    return true;
  }
  
  if (message.action === 'toggleBadge') {
    // Toggle badge visibility
    const showBadge = message.showBadge;
    
    // Store the setting
    chrome.storage.local.set({ showBadge });
    
    // Update badge visibility immediately
    if (showBadge === false) {
      chrome.action.setBadgeText({ text: '' });
    } else {
      chrome.storage.local.get(['enabled', 'adsBlocked'], (data) => {
        if (data.enabled) {
          updateBadge(data.adsBlocked || 0);
        }
      });
    }
    
    sendResponse({ success: true });
    return true;
  }
});

// Update popup with current stats when it's opened
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    // Send stats when popup connects
    chrome.storage.local.get(['adsBlocked', 'trackersBlocked'], (data) => {
      port.postMessage({
        adsBlocked: data.adsBlocked || 0,
        trackersBlocked: data.trackersBlocked || 0
      });
    });
  }
});