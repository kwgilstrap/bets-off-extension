// Bets Off - Simple Popup Script

document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme
  initializeTheme();
  
  // Load stats and settings
  loadStats();
  
  // Set up event listeners
  setupEventListeners();
});

function initializeTheme() {
  // Check stored theme or use system preference
  chrome.storage.local.get(['theme'], function(data) {
    let theme = data.theme;
    
    if (!theme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
    
    document.body.dataset.theme = theme;
    updateThemeToggle(theme);
  });
}

function updateThemeToggle(theme) {
  // Theme icons are controlled by CSS based on data-theme attribute
}

function loadStats() {
  chrome.storage.local.get(['adsBlocked', 'trackersBlocked', 'enabled'], function(data) {
    // Update counters
    document.getElementById('ads-blocked').textContent = data.adsBlocked || 0;
    document.getElementById('trackers-blocked').textContent = data.trackersBlocked || 0;
    
    // Update protection status
    const isEnabled = data.enabled !== false;
    document.getElementById('protection-toggle').checked = isEnabled;
    document.getElementById('protection-status').textContent = isEnabled ? 'Active' : 'Inactive';
  });
}

function setupEventListeners() {
  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', function() {
    const currentTheme = document.body.dataset.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.dataset.theme = newTheme;
    chrome.storage.local.set({ theme: newTheme });
    updateThemeToggle(newTheme);
  });
  
  // Protection toggle
  document.getElementById('protection-toggle').addEventListener('change', function() {
    const enabled = this.checked;
    chrome.storage.local.set({ enabled: enabled });
    document.getElementById('protection-status').textContent = enabled ? 'Active' : 'Inactive';
    
    // Notify background script
    chrome.runtime.sendMessage({ action: 'updateProtection', enabled: enabled });
  });
  
  // Action buttons
  document.getElementById('options-btn').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
  
  document.getElementById('report-btn').addEventListener('click', function() {
    // For now, open the feedback form or show an alert
    alert('Report feature coming soon! Please email support@betsoff.io with any gambling sites we missed.');
  });
  
  document.getElementById('help-btn').addEventListener('click', function() {
    // Open Gamblers Anonymous directly
    chrome.tabs.create({ url: 'https://www.gamblersanonymous.org/' });
  });
}