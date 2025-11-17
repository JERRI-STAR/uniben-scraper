// UNIBEN Web Scraper - Complete Node.js Implementation
// Install required packages: npm install express axios cheerio

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

const UNIBEN_URL = 'https://waeup.uniben.edu/';

// Middleware
app.use(express.json());

// Utility function to clean text
const cleanText = (text) => {
  return text.replace(/\s+/g, ' ').trim();
};

// Fetch and parse the main page
const fetchMainPage = async () => {
  try {
    const response = await axios.get(UNIBEN_URL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return cheerio.load(response.data);
  } catch (error) {
    throw new Error(`Failed to fetch UNIBEN page: ${error.message}`);
  }
};

// Extract undergraduate school fees
const extractUndergraduateFees = ($) => {
  const fees = {
    freshStudents: { science: {}, nonScience: {} },
    returningStudents: { science: {}, nonScience: {} },
    additionalCharges: {},
    note: ''
  };

  try {
    const text = $('body').text();
    
    // Extract the note about additional charges
    const noteMatch = text.match(/Please Note that there is added charge of N([\d,]+) for New Students.*?and N([\d,]+) for Returning Students/);
    if (noteMatch) {
      fees.note = `Additional charge: N${noteMatch[1]} for Freshers, N${noteMatch[2]} for Returning Students`;
    }

    // Find all table rows and extract fee information
    $('table').each((i, table) => {
      const rows = $(table).find('tr');
      
      rows.each((j, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 3) {
          const item = cleanText($(cells[0]).text());
          const science = cleanText($(cells[1]).text());
          const nonScience = cleanText($(cells[2]).text());

          // Check if this is fresh students section
          if (item && science.match(/[\d,]+\.00/) && nonScience.match(/[\d,]+\.00/)) {
            // Determine if this is a special charge for freshers
            if (item.includes('Orientation') || item.includes('Certificate') || 
                item.includes('Academic Gown') || item.includes('Forensic')) {
              fees.additionalCharges[item] = {
                science: parseFloat(science.replace(/,/g, '')),
                nonScience: parseFloat(nonScience.replace(/,/g, ''))
              };
            } else if (!item.includes('TOTAL') && !item.includes('GRAND')) {
              fees.freshStudents.science[item] = parseFloat(science.replace(/,/g, ''));
              fees.freshStudents.nonScience[item] = parseFloat(nonScience.replace(/,/g, ''));
            }
          }
        }
      });
    });

    // Extract totals from text
    const totalMatch = text.match(/TOTAL\s+(\d[\d,]+\.00)\s+(\d[\d,]+\.00)/);
    if (totalMatch) {
      fees.freshStudents.science['TOTAL'] = parseFloat(totalMatch[1].replace(/,/g, ''));
      fees.freshStudents.nonScience['TOTAL'] = parseFloat(totalMatch[2].replace(/,/g, ''));
    }

    const grandTotalMatch = text.match(/GRAND TOTAL\s+(\d[\d,]+\.00)\s+(\d[\d,]+\.00)/);
    if (grandTotalMatch) {
      fees.freshStudents.science['GRAND TOTAL'] = parseFloat(grandTotalMatch[1].replace(/,/g, ''));
      fees.freshStudents.nonScience['GRAND TOTAL'] = parseFloat(grandTotalMatch[2].replace(/,/g, ''));
    }

  } catch (error) {
    console.error('Error extracting undergraduate fees:', error.message);
  }

  return fees;
};

// Extract postgraduate fees
const extractPostgraduateFees = ($) => {
  const fees = {
    programs: []
  };

  try {
    const text = $('body').text();
    
    // Extract PG fees using regex patterns
    const pgSection = text.match(/POST GRADUATE FULL TIME CHARGES([\s\S]*?)(?=THE CHARGES FOR SCIENCE|$)/);
    
    if (pgSection) {
      const lines = pgSection[1].split('\n').filter(line => line.trim());
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const amountMatch = line.match(/(\d[\d,]+\.00)\s+(\d[\d,]+\.00)/);
        
        if (amountMatch && i > 0) {
          const program = cleanText(lines[i - 1]);
          fees.programs.push({
            program: program,
            freshers: parseFloat(amountMatch[1].replace(/,/g, '')),
            returning: parseFloat(amountMatch[2].replace(/,/g, ''))
          });
        }
      }
    }
  } catch (error) {
    console.error('Error extracting postgraduate fees:', error.message);
  }

  return fees;
};

// Extract hostel accommodation fees
const extractHostelFees = ($) => {
  const hostels = [];

  try {
    const text = $('body').text();
    
    // Find the hostel section
    const hostelSection = text.match(/THE HOSTEL ACCOMMODATION FEES FROM 2024\/2025([\s\S]*?)(?=THE FORMER CHARGES|RETURNING STUDENTS|$)/);
    
    if (hostelSection) {
      // Extract hostel information using regex
      const hostelPattern = /(\d+)\.\s+([A-Z\s\(\)\/\d]+?)\s+([A-Z\s]+?)?\s+([\d,]+\.00)/g;
      let match;
      
      while ((match = hostelPattern.exec(hostelSection[1])) !== null) {
        hostels.push({
          sn: match[1],
          hostelName: cleanText(match[2]),
          demarcation: match[3] ? cleanText(match[3]) : 'N/A',
          amount: parseFloat(match[4].replace(/,/g, ''))
        });
      }
    }
  } catch (error) {
    console.error('Error extracting hostel fees:', error.message);
  }

  return hostels;
};

// Extract acceptance fees
const extractAcceptanceFees = ($) => {
  const acceptanceFees = {
    medicalSciences: {},
    otherCandidates: {}
  };

  try {
    const text = $('body').text();
    
    // Extract acceptance fee items
    const items = [
      'BANK/PORTAL CHARGES',
      'ADMISSION CLEARANCE',
      'ICT LEVY',
      'MAINTENANCE FEE',
      'MTN NET LIBRARY',
      'COLLEGE DEVELOPMENT LEVY'
    ];

    items.forEach(item => {
      const pattern = new RegExp(item + '\\s+([\\d,]+\\.00)\\s+([\\d,]+\\.00|-)', 'i');
      const match = text.match(pattern);
      
      if (match) {
        acceptanceFees.medicalSciences[item] = parseFloat(match[1].replace(/,/g, ''));
        acceptanceFees.otherCandidates[item] = match[2] === '-' ? 0 : parseFloat(match[2].replace(/,/g, ''));
      }
    });

    // Extract totals
    const totalMatch = text.match(/TOTAL\s+(\d[\d,]+\.00)\s+(\d[\d,]+\.00)/g);
    if (totalMatch && totalMatch.length > 0) {
      const lastTotal = totalMatch[totalMatch.length - 1];
      const amounts = lastTotal.match(/(\d[\d,]+\.00)/g);
      if (amounts && amounts.length >= 2) {
        acceptanceFees.medicalSciences['TOTAL'] = parseFloat(amounts[0].replace(/,/g, ''));
        acceptanceFees.otherCandidates['TOTAL'] = parseFloat(amounts[1].replace(/,/g, ''));
      }
    }

  } catch (error) {
    console.error('Error extracting acceptance fees:', error.message);
  }

  return acceptanceFees;
};

// Extract announcements
const extractAnnouncements = ($) => {
  const announcements = [];

  try {
    const text = $('body').text();
    
    // Key announcement patterns
    const announcementPatterns = [
      /UNIBEN HOSTEL ACCOMMODATION.*?GUIDELINES([\s\S]*?)(?=\*\* Accommodation Booking|$)/,
      /\*\* Accommodation Booking.*?(?=NEWLY ADMITTED|$)/,
      /NEWLY ADMITTED STUDENTS REQUIREMENTS.*?(?=THE ACCEPTANCE FEE|$)/,
      /RETURNING STUDENTS.*?(?=NOTE THAT ALL STUDENTS|THE HOSTEL|$)/
    ];

    announcementPatterns.forEach((pattern, index) => {
      const match = text.match(pattern);
      if (match) {
        const title = [
          'Hostel Accommodation Guidelines',
          'Accommodation Booking Information',
          'Requirements for Newly Admitted Students',
          'Information for Returning Students'
        ][index];

        announcements.push({
          title: title,
          content: cleanText(match[0].substring(0, 500)) + '...',
          fullContent: cleanText(match[0])
        });
      }
    });

    // Extract specific important dates and deadlines
    const bookingDateMatch = text.match(/Accommodation Booking.*?SATURDAY (\d+ \w+ \d+)/);
    if (bookingDateMatch) {
      announcements.push({
        title: 'Accommodation Booking Start Date',
        content: `Booking starts on ${bookingDateMatch[1]}`,
        fullContent: `Accommodation booking using HOS Activation Code starts on ${bookingDateMatch[1]}`
      });
    }

  } catch (error) {
    console.error('Error extracting announcements:', error.message);
  }

  return announcements;
};

// Extract requirements for new students
const extractRequirements = ($) => {
  const requirements = {
    documentsRequired: [],
    instructions: []
  };

  try {
    const text = $('body').text();
    
    // Extract document requirements
    const docPattern = /(\d+)\.\s+([A-Za-z\s\(\)\/\-:]+(?:Certificate|result|Card|letter|Affidavit|PASSPORT))/gi;
    let match;
    
    while ((match = docPattern.exec(text)) !== null) {
      requirements.documentsRequired.push({
        number: match[1],
        document: cleanText(match[2])
      });
    }

    // Extract key instructions
    const instructions = [
      'PAY YOUR ACCEPTANCE FEE',
      'UPLOAD RELEVANT DOCUMENTS',
      'REQUEST CLEARANCE',
      'REMEMBER TO UPLOAD SCAN OF SCRATCH CARD',
      'NO NEED TO COME INTO CAMPUS',
      'PAY SCHOOL CHARGES',
      'REGISTER YOUR COURSES ONLINE',
      'VISIT COURSE ADVISER FOR VALIDATION'
    ];

    instructions.forEach(instruction => {
      if (text.includes(instruction)) {
        requirements.instructions.push(instruction);
      }
    });

  } catch (error) {
    console.error('Error extracting requirements:', error.message);
  }

  return requirements;
};

// API Routes

// Get all data
app.get('/api/all', async (req, res) => {
  try {
    const $ = await fetchMainPage();
    
    const data = {
      timestamp: new Date().toISOString(),
      undergraduateFees: extractUndergraduateFees($),
      postgraduateFees: extractPostgraduateFees($),
      hostelFees: extractHostelFees($),
      acceptanceFees: extractAcceptanceFees($),
      announcements: extractAnnouncements($),
      requirements: extractRequirements($)
    };

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get undergraduate fees
app.get('/api/fees/undergraduate', async (req, res) => {
  try {
    const $ = await fetchMainPage();
    const fees = extractUndergraduateFees($);

    res.json({
      success: true,
      data: fees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get postgraduate fees
app.get('/api/fees/postgraduate', async (req, res) => {
  try {
    const $ = await fetchMainPage();
    const fees = extractPostgraduateFees($);

    res.json({
      success: true,
      data: fees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get hostel fees
app.get('/api/hostel', async (req, res) => {
  try {
    const $ = await fetchMainPage();
    const hostels = extractHostelFees($);

    res.json({
      success: true,
      data: hostels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get acceptance fees
app.get('/api/fees/acceptance', async (req, res) => {
  try {
    const $ = await fetchMainPage();
    const fees = extractAcceptanceFees($);

    res.json({
      success: true,
      data: fees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const $ = await fetchMainPage();
    const announcements = extractAnnouncements($);

    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get requirements for new students
app.get('/api/requirements', async (req, res) => {
  try {
    const $ = await fetchMainPage();
    const requirements = extractRequirements($);

    res.json({
      success: true,
      data: requirements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'UNIBEN Web Scraper API',
    version: '1.0.0',
    endpoints: {
      all: '/api/all',
      undergraduateFees: '/api/fees/undergraduate',
      postgraduateFees: '/api/fees/postgraduate',
      hostelFees: '/api/hostel',
      acceptanceFees: '/api/fees/acceptance',
      announcements: '/api/announcements',
      requirements: '/api/requirements',
      health: '/health'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`UNIBEN Scraper API running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} for available endpoints`);
});

module.exports = app;
