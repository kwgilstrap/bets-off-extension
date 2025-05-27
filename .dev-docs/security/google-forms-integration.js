// Google Forms Integration: The Minimalist's Approach
// 
// Step 1: Create a Google Form with two fields:
// - "Domain" (Short answer)
// - "Category" (Dropdown: betting, casino, poker, lottery, other)
//
// Step 2: Get the form's pre-filled URL structure
// Step 3: Implement this elegantly simple submission

function submitToGoogleForms(domain, category) {
  // Replace with your actual Google Form URL and entry IDs
  const FORM_CONFIG = {
    formUrl: 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse',
    domainFieldId: 'entry.XXXXXXXXX',    // Get from form's HTML
    categoryFieldId: 'entry.YYYYYYYYY',   // Get from form's HTML
  };
  
  // Construct submission URL
  const params = new URLSearchParams({
    [FORM_CONFIG.domainFieldId]: domain,
    [FORM_CONFIG.categoryFieldId]: category,
    submit: 'Submit'
  });
  
  // Create invisible iframe for submission (avoids page navigation)
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.name = 'hidden_iframe_' + Date.now();
  document.body.appendChild(iframe);
  
  // Create and submit form
  const form = document.createElement('form');
  form.action = FORM_CONFIG.formUrl;
  form.method = 'POST';
  form.target = iframe.name;
  
  // Add form data
  for (const [key, value] of params) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }
  
  document.body.appendChild(form);
  form.submit();
  
  // Cleanup after submission
  setTimeout(() => {
    document.body.removeChild(form);
    document.body.removeChild(iframe);
  }, 2000);
  
  return true;
}

// Integration into your existing handleReport function
function enhancedHandleReport() {
  // ... existing validation code ...
  
  chrome.runtime.sendMessage({
    action: 'reportDomain',
    domain: domain,
    category: category
  }, response => {
    if (response && response.success) {
      // Also submit to Google Forms for aggregation
      try {
        submitToGoogleForms(domain, category);
      } catch (e) {
        // Silently fail - external submission is secondary
        console.error('Form submission failed:', e);
      }
      
      // ... rest of your success handling ...
    }
  });
}