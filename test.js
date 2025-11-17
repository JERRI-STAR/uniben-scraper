// test.js - Simple test file for UNIBEN scraper
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Test helper function
async function testEndpoint(name, endpoint) {
  try {
    console.log(`\n${colors.blue}Testing: ${name}${colors.reset}`);
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    
    if (response.data.success) {
      console.log(`${colors.green}✓ Success${colors.reset}`);
      console.log('Sample data:', JSON.stringify(response.data.data, null, 2).substring(0, 200) + '...');
      return true;
    } else {
      console.log(`${colors.red}✗ Failed: ${response.data.error}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log(`${colors.yellow}========================================${colors.reset}`);
  console.log(`${colors.yellow}  UNIBEN Scraper API Test Suite${colors.reset}`);
  console.log(`${colors.yellow}========================================${colors.reset}`);
  
  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log(`${colors.green}✓ Server is running${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}✗ Server is not running. Please start the server first with 'npm start'${colors.reset}`);
    process.exit(1);
  }

  const tests = [
    { name: 'Get All Data', endpoint: '/api/all' },
    { name: 'Get Undergraduate Fees', endpoint: '/api/fees/undergraduate' },
    { name: 'Get Postgraduate Fees', endpoint: '/api/fees/postgraduate' },
    { name: 'Get Hostel Fees', endpoint: '/api/hostel' },
    { name: 'Get Acceptance Fees', endpoint: '/api/fees/acceptance' },
    { name: 'Get Announcements', endpoint: '/api/announcements' },
    { name: 'Get Requirements', endpoint: '/api/requirements' }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testEndpoint(test.name, test.endpoint);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n${colors.yellow}========================================${colors.reset}`);
  console.log(`${colors.yellow}  Test Results${colors.reset}`);
  console.log(`${colors.yellow}========================================${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log(`\n${colors.green}All tests passed! 🎉${colors.reset}`);
  } else {
    console.log(`\n${colors.red}Some tests failed. Please check the errors above.${colors.reset}`);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Test suite error:${colors.reset}`, error);
  process.exit(1);
});
