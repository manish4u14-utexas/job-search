/**
 * Test script for JSearch API
 * Run with: node scripts/test-jsearch.js
 */

import dotenv from 'dotenv';
dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

async function testJSearch() {
  console.log('='.repeat(60));
  console.log('JSearch API Test');
  console.log('='.repeat(60));
  
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your-rapidapi-key-here') {
    console.error('❌ RAPIDAPI_KEY not configured in .env file');
    process.exit(1);
  }
  
  console.log(`✓ API Key found: ${RAPIDAPI_KEY.substring(0, 10)}...${RAPIDAPI_KEY.slice(-4)}`);
  console.log('');
  
  // Test 1: Basic search
  console.log('Test 1: Basic Job Search');
  console.log('-'.repeat(60));
  
  const url = new URL('https://jsearch.p.rapidapi.com/search');
  url.searchParams.append('query', 'Product Manager in United States');
  url.searchParams.append('page', '1');
  url.searchParams.append('num_pages', '1');
  url.searchParams.append('date_posted', '3days');
  
  console.log(`Request URL: ${url.toString()}`);
  console.log('');
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });
    
    console.log(`Response Status: ${response.status} ${response.statusText}`);
    console.log('Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    console.log('');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:');
      console.error(errorText);
      console.log('');
      console.log('Possible Issues:');
      console.log('1. API key not activated yet (wait 5-10 minutes after subscription)');
      console.log('2. Wrong API endpoint (check you subscribed to the correct JSearch API)');
      console.log('3. Subscription not active (verify on RapidAPI dashboard)');
      console.log('4. Rate limit exceeded (check your quota on RapidAPI)');
      console.log('');
      console.log('Next Steps:');
      console.log('1. Go to: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch');
      console.log('2. Click "Test Endpoint" button');
      console.log('3. Verify the test works in the RapidAPI dashboard');
      console.log('4. If it works there, wait a few minutes and try again');
      process.exit(1);
    }
    
    const data = await response.json();
    console.log('✓ API Response Successful!');
    console.log('');
    console.log('Response Data:');
    console.log(`  Total Jobs: ${data.data?.length || 0}`);
    console.log(`  Status: ${data.status}`);
    
    if (data.data && data.data.length > 0) {
      console.log('');
      console.log('Sample Job:');
      const job = data.data[0];
      console.log(`  Title: ${job.job_title}`);
      console.log(`  Company: ${job.employer_name}`);
      console.log(`  Location: ${job.job_city}, ${job.job_state}`);
      console.log(`  Posted: ${job.job_posted_at_datetime_utc}`);
      console.log(`  URL: ${job.job_apply_link || job.job_google_link}`);
    }
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ JSearch API is working correctly!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('This might be a network error or the API is unreachable.');
    process.exit(1);
  }
}

testJSearch();
