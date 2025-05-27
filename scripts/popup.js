// Bets Off - Modern Popup Script v2.0

let port;

// Global error handler
window.addEventListener('error', function(e) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'padding: 20px; color: red;';
  errorDiv.textContent = 'Error: ' + (e.error?.message || 'Unknown error');
  document.body.innerHTML = '';
  document.body.appendChild(errorDiv);
});

// Theme Management - Define BEFORE using
const ThemeManager = {
  // Theme options: 'light', 'dark', 'system'
  themes: {
    light: 'sun',
    dark: 'moon',
    system: 'system'
  },
  
  init() {
    this.loadTheme();
    this.attachListeners();
  },
  
  async loadTheme() {
    const { theme = 'system' } = await chrome.storage.local.get('theme');
    this.applyTheme(theme);
    this.updateButtonIcon(theme);
  },
  
  applyTheme(theme) {
    let activeTheme = theme;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.dataset.theme = prefersDark ? 'dark' : 'light';
    } else {
      document.body.dataset.theme = theme;
    }
    
    // Store current theme
    this.currentTheme = theme;
  },
  
  updateButtonIcon(theme) {
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
      const icon = btn.querySelector('.theme-icon');
      if (icon) {
        // Update SVG based on theme
        if (theme === 'dark') {
          // Moon icon
          icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
        } else if (theme === 'system') {
          // Monitor icon
          icon.innerHTML = '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>';
        } else {
          // Sun icon (default)
          icon.innerHTML = `
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          `;
        }
      }
    }
  },
  
  async cycleTheme() {
    const { theme = 'system' } = await chrome.storage.local.get('theme');
    const themeOrder = ['light', 'dark', 'system'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextTheme = themeOrder[(currentIndex + 1) % 3];
    
    await chrome.storage.local.set({ theme: nextTheme });
    this.applyTheme(nextTheme);
    this.updateButtonIcon(nextTheme);
  },
  
  attachListeners() {
    document.querySelector('.theme-toggle')?.addEventListener('click', () => {
      this.cycleTheme();
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.currentTheme === 'system') {
        this.loadTheme();
      }
    });
  }
};

function initializeTheme() {
  ThemeManager.init();
}

document.addEventListener('DOMContentLoaded', function() {
  try {
  // Initialize theme from storage or system preference
  initializeTheme();
  
  // Create connection to background page to receive live updates
  try {
    port = chrome.runtime.connect({name: "popup"});
    
    // Listen for updates from the background script
    port.onMessage.addListener(function(msg) {
      if (msg.adsBlocked !== undefined || msg.trackersBlocked !== undefined) {
        updateCounters(msg.adsBlocked, msg.trackersBlocked);
      }
    });
  } catch (portError) {
    // Error creating port connection - silently continue
  }
  
  // Also request initial stats from background script
  chrome.runtime.sendMessage({action: 'getStats'}, function(response) {
    if (chrome.runtime.lastError) {
      return;
    }
    if (response) {
      updateCounters(response.adsBlocked, response.trackersBlocked);
    }
  });
  
  // Initialize UI state
  initializeUI();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize animations
  setTimeout(() => {
    document.querySelectorAll('.stat-card').forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in');
      }, index * 100);
    });
  }, 100);
  } catch (e) {
    document.body.innerHTML = '<div style="padding: 20px; color: red;">Startup Error: ' + e.message + '<br>Stack: ' + e.stack + '</div>';
  }
});

// Clean up port connection when popup is closed
window.addEventListener('unload', function() {
  if (port) {
    port.disconnect();
  }
});



// UI Initialization
function initializeUI() {
  // Get current enabled state from storage
  chrome.storage.local.get(['enabled', 'showBadge'], (data) => {
    // Update protection toggle
    const protectionToggle = document.getElementById('protection-toggle');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const toggleStatus = document.getElementById('toggle-status');
    
    const isEnabled = data.enabled !== false;
    
    if (protectionToggle) {
      protectionToggle.checked = isEnabled;
    }
    
    if (isEnabled) {
      statusDot?.classList.remove('inactive');
      if (statusText) statusText.textContent = 'Active';
      if (toggleStatus) toggleStatus.textContent = 'Active';
    } else {
      statusDot?.classList.add('inactive');
      if (statusText) statusText.textContent = 'Inactive';
      if (toggleStatus) toggleStatus.textContent = 'Inactive';
    }
    
    // Update badge toggle
    const badgeToggle = document.getElementById('badge-toggle');
    if (badgeToggle) {
      badgeToggle.checked = data.showBadge !== false;
    }
  });
}

// Event Listeners Setup
function setupEventListeners() {
  // Theme toggle is now handled by ThemeManager
  
  // Protection toggle - support both new checkbox and old button style
  document.getElementById('protection-toggle')?.addEventListener('change', toggleProtection);
  document.getElementById('protection-switch')?.addEventListener('click', function(e) {
    if (e.target.tagName !== 'INPUT') {
      const toggle = document.getElementById('protection-toggle');
      if (toggle) {
        toggle.checked = !toggle.checked;
        toggleProtection();
      }
    }
  });
  
  // Badge toggle - support both new checkbox and old button style
  document.getElementById('badge-toggle')?.addEventListener('change', toggleBadge);
  document.getElementById('badge-switch')?.addEventListener('click', function(e) {
    if (e.target.tagName !== 'INPUT') {
      const toggle = document.getElementById('badge-toggle');
      if (toggle) {
        toggle.checked = !toggle.checked;
        toggleBadge();
      }
    }
  });
  
  // Tab switching
  const tabs = document.querySelectorAll('.tab-button');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.getAttribute('data-tab'), tab));
  });
  
  // Report functionality
  document.getElementById('report-button')?.addEventListener('click', handleReport);
  
  // Bug report functionality
  document.getElementById('bug-report-link')?.addEventListener('click', handleBugReport);
}

// Protection Toggle
function toggleProtection() {
  const protectionToggle = document.getElementById('protection-toggle');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const toggleStatus = document.getElementById('toggle-status');
  
  const newState = protectionToggle.checked;
  
  // Update UI immediately
  if (newState) {
    statusDot.classList.remove('inactive');
    statusText.textContent = 'Active';
    toggleStatus.textContent = 'Active';
  } else {
    statusDot.classList.add('inactive');
    statusText.textContent = 'Inactive';
    toggleStatus.textContent = 'Inactive';
  }
  
  // Store setting and notify background script
  chrome.storage.local.set({ enabled: newState });
  chrome.runtime.sendMessage({
    action: 'toggleProtection',
    enabled: newState
  });
}

// Badge Toggle
function toggleBadge() {
  const badgeToggle = document.getElementById('badge-toggle');
  const newState = badgeToggle.checked;
  
  // Store setting and notify background script
  chrome.storage.local.set({ showBadge: newState });
  chrome.runtime.sendMessage({
    action: 'toggleBadge',
    showBadge: newState
  });
}

// Tab Switching
function switchTab(tabName, clickedTab) {
  // Remove active class from all tabs and contents
  document.querySelectorAll('.tab-button').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  // Add active class to clicked tab and corresponding content
  clickedTab.classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Sophisticated domain validation
function validateDomain(domain) {
  // Remove protocol and trailing slashes
  domain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  
  // Comprehensive domain pattern with international support
  const domainPattern = /^(?=.{1,253}$)(?!-)([a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,63}$/;
  
  // Validate structure and prevent XSS
  if (!domainPattern.test(domain)) return null;
  
  // Additional security: check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(domain))) return null;
  
  return domain.toLowerCase();
}

// Report Handling
function handleReport() {
  const domainInput = document.getElementById('domain');
  const categorySelect = document.getElementById('category');
  const reportButton = document.getElementById('report-button');
  
  const rawDomain = domainInput.value.trim();
  const category = categorySelect.value;
  
  // Validate and sanitize domain
  const domain = validateDomain(rawDomain);
  
  if (domain) {
    // Show loading state
    reportButton.textContent = 'Submitting...';
    reportButton.disabled = true;
    
    chrome.runtime.sendMessage({
      action: 'reportDomain',
      domain: domain,
      category: category
    }, response => {
      if (response && response.success) {
        domainInput.value = '';
        reportButton.textContent = 'Thanks!';
        reportButton.style.background = 'var(--success-color)';
        
        setTimeout(() => {
          reportButton.textContent = 'Submit Report';
          reportButton.style.background = '';
          reportButton.disabled = false;
        }, 2000);
      } else {
        reportButton.textContent = 'Error - Try Again';
        reportButton.disabled = false;
        setTimeout(() => {
          reportButton.textContent = 'Submit Report';
        }, 2000);
      }
    });
  }
}

// Counter Updates
function updateCounters(adsBlocked, trackersBlocked) {
  // Format numbers for better display
  function formatNumber(num) {
    num = Number(num) || 0;
    
    // For numbers over 999, use K format (e.g., 1.2K)
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    
    return num.toString();
  }
  
  // Update ads blocked counter
  const adsCounter = document.getElementById('ads-blocked-count');
  if (adsCounter) {
    adsCounter.textContent = formatNumber(adsBlocked);
  }
  
  // Update trackers blocked counter
  const trackersCounter = document.getElementById('trackers-blocked-count');
  if (trackersCounter) {
    trackersCounter.textContent = formatNumber(trackersBlocked);
  }
}

// Bug Report Handler
function handleBugReport(e) {
  e.preventDefault();
  
  // Gather debug info
  const manifest = chrome.runtime.getManifest();
  const debugInfo = {
    version: manifest.version,
    browser: navigator.userAgent,
    url: 'Current tab URL',
    timestamp: new Date().toISOString()
  };
  
  // Get current tab URL
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      debugInfo.url = tabs[0].url;
    }
    
    // Create email body
    const emailBody = `
Bug Report for Bets Off Extension

**Describe the bug:**
[Please describe what went wrong]

**Expected behavior:**
[What should have happened]

**Steps to reproduce:**
1. [First step]
2. [Second step]
3. [etc...]

**Debug Information:**
- Extension Version: ${debugInfo.version}
- Browser: ${debugInfo.browser}
- Current URL: ${debugInfo.url}
- Timestamp: ${debugInfo.timestamp}

**Additional context:**
[Add any other context about the problem here]
`;
    
    // Create mailto link
    const subject = encodeURIComponent('Bets Off Bug Report');
    const body = encodeURIComponent(emailBody);
    const mailto = `mailto:support@betsoff.io?subject=${subject}&body=${body}`;
    
    // Open email client
    chrome.tabs.create({ url: mailto });
  });
}
