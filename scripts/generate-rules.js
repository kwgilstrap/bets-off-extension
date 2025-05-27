#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to the data file and output rules file
const DATA_FILE_PATH = path.join(__dirname, '../data/gambling-domains.txt');
const RULES_OUTPUT_PATH = path.join(__dirname, '../rules/gambling.json');

// Resource types to block
const RESOURCE_TYPES = ['main_frame', 'sub_frame', 'image', 'script', 'xmlhttprequest'];

// Main function
function generateRules() {
  
  // Read the domains file
  let domains;
  try {
    domains = fs.readFileSync(DATA_FILE_PATH, 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
  } catch (error) {
    process.exit(1);
  }
  
  // Check if we have any domains
  if (domains.length === 0) {
    // Create an empty rules file
    const emptyRules = { rules: [] };
    fs.writeFileSync(RULES_OUTPUT_PATH, JSON.stringify(emptyRules, null, 2));
    return;
  }
  
  // Generate rules
  const rules = domains.map((domain, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: `*${domain}*`,
      resourceTypes: RESOURCE_TYPES
    }
  }));
  
  // Write the rules to the output file as array (not object)
  try {
    fs.writeFileSync(RULES_OUTPUT_PATH, JSON.stringify(rules, null, 2));
  } catch (error) {
    process.exit(1);
  }
}

// Run the script
generateRules();