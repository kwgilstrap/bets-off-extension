// Bets Off - Chrome Extension JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI elements
  initializeToggle();
  initializeTabs();
  initializeReportForm();
  loadStatistics();
  
  // Add animation classes
  document.querySelectorAll('.stat-card, .categories-container, .report-form, .support-container').forEach(element => {
    element.classList.add('fade-in');
  });
});

// Toggle functionality
function initializeToggle() {
  const toggle = document.getElementById('blocking-toggle');
  const toggleLabel = document.querySelector('.toggle-label');
  
  toggle.addEventListener('change', function() {
    if (this.checked) {
      toggleLabel.textContent = 'Enabled';
      // Enable blocking functionality
      chrome.storage.local.set({ 'blocking_enabled': true });
    } else {
      toggleLabel.textContent = 'Disabled';
      // Disable blocking functionality
      chrome.storage.local.set({ 'blocking_enabled': false });
    }
  });
  
  // Load saved toggle state
  chrome.storage.local.get('blocking_enabled', function(data) {
    if (data.blocking_enabled === undefined) {
      // Default to enabled if not set
      toggle.checked = true;
      chrome.storage.local.set({ 'blocking_enabled': true });
    } else {
      toggle.checked = data.blocking_enabled;
      toggleLabel.textContent = data.blocking_enabled ? 'Enabled' : 'Disabled';
    }
  });
}

// Tab switching functionality
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      this.classList.add('active');
      const tabId = this.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
}

// Report form submission
function initializeReportForm() {
  const reportBtn = document.getElementById('report-btn');
  const domainInput = document.getElementById('domain-input');
  const detailsInput = document.getElementById('details-input');
  
  reportBtn.addEventListener('click', function() {
    const domain = domainInput.value.trim();
    const details = detailsInput.value.trim();
    
    if (!domain) {
      // Show error if domain is empty
      domainInput.style.borderColor = 'var(--primary-color)';
      return;
    }
    
    // Reset border color
    domainInput.style.borderColor = '';
    
    // Submit report
    submitReport(domain, details);
    
    // Show success message
    reportBtn.textContent = 'Submitted!';
    reportBtn.disabled = true;
    
    // Reset form after delay
    setTimeout(() => {
      domainInput.value = '';
      detailsInput.value = '';
      reportBtn.textContent = 'Submit Report';
      reportBtn.disabled = false;
    }, 2000);
  });
}

// Submit report to backend (mock function)
function submitReport(domain, details) {
  // In a real implementation, this would send data to a server
  console.log('Report submitted:', { domain, details });
  
  // For mockup purposes, just store locally
  chrome.storage.local.get('reported_domains', function(data) {
    const reportedDomains = data.reported_domains || [];
    reportedDomains.push({
      domain,
      details,
      date: new Date().toISOString()
    });
    chrome.storage.local.set({ 'reported_domains': reportedDomains });
  });
}

// Load and display statistics
function loadStatistics() {
  const adsBlockedElement = document.getElementById('ads-blocked');
  const trackersBlockedElement = document.getElementById('trackers-blocked');
  
  // Load statistics from storage
  chrome.storage.local.get(['ads_blocked', 'trackers_blocked'], function(data) {
    const adsBlocked = data.ads_blocked || 0;
    const trackersBlocked = data.trackers_blocked || 0;
    
    // Display with animation
    animateCounter(adsBlockedElement, 0, adsBlocked);
    animateCounter(trackersBlockedElement, 0, trackersBlocked);
  });
}

// Animate counter from start to end value
function animateCounter(element, start, end) {
  const duration = 1000; // 1 second
  const frameDuration = 1000 / 60; // 60fps
  const totalFrames = Math.round(duration / frameDuration);
  const increment = (end - start) / totalFrames;
  
  let currentFrame = 0;
  let currentValue = start;
  
  const animate = function() {
    currentFrame++;
    currentValue += increment;
    
    if (currentFrame === totalFrames) {
      element.textContent = end;
    } else {
      element.textContent = Math.floor(currentValue);
      requestAnimationFrame(animate);
    }
  };
  
  animate();
}

// Update categories display (mock function)
function updateCategories() {
  // In a real implementation, this would load actual blocked categories
  const categories = ['Betting', 'Casino', 'Poker', 'Sports Betting'];
  const categoriesList = document.getElementById('categories-list');
  
  categoriesList.innerHTML = '';
  categories.forEach(category => {
    const tag = document.createElement('span');
    tag.className = 'category-tag';
    tag.textContent = category;
    categoriesList.appendChild(tag);
  });
}
