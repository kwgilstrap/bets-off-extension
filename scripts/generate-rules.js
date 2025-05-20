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
  console.log('Generating DNR rules from gambling domains list...');
  
  // Read the domains file
  let domains;
  try {
    domains = fs.readFileSync(DATA_FILE_PATH, 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
  } catch (error) {
    console.error(`Error reading domains file: ${error.message}`);
    process.exit(1);
  }
  
  // Check if we have any domains
  if (domains.length === 0) {
    console.warn('Warning: No domains or keywords found in the data file!');
    console.warn(`File path: ${DATA_FILE_PATH}`);
    console.warn('Please add at least one domain or keyword to the file.');
    
    // Create an empty rules file
    const emptyRules = { rules: [] };
    fs.writeFileSync(RULES_OUTPUT_PATH, JSON.stringify(emptyRules, null, 2));
    console.log('Created empty rules file.');
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
  
  // Write the rules to the output file
  const rulesObject = { rules };
  try {
    fs.writeFileSync(RULES_OUTPUT_PATH, JSON.stringify(rulesObject, null, 2));
    console.log(`Successfully generated ${rules.length} rules in ${RULES_OUTPUT_PATH}`);
  } catch (error) {
    console.error(`Error writing rules file: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
generateRules();