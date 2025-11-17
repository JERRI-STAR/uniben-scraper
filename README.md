# UNIBEN Web Scraper API

A Node.js-based web scraper that extracts information from the University of Benin (UNIBEN) official student portal at https://waeup.uniben.edu/

## Features

- ✅ Extract undergraduate school fees (Science & Non-Science)
- ✅ Extract postgraduate school fees for all programs
- ✅ Extract hostel accommodation fees and information
- ✅ Extract acceptance fees for new students
- ✅ Extract announcements and important notices
- ✅ Extract requirements for newly admitted students
- ✅ RESTful API endpoints
- ✅ Error handling and validation
- ✅ Clean, structured JSON responses

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Steps

1. **Clone or create the project directory:**
```bash
mkdir uniben-scraper
cd uniben-scraper
```

2. **Create the files:**
- Copy the `scraper.js` file (main scraper code)
- Copy the `package.json` file

3. **Install dependencies:**
```bash
npm install
```

4. **Run the scraper:**
```bash
npm start
```

The API will start on `http://localhost:3000`

### Development Mode

For development with auto-restart on file changes:
```bash
npm run dev
```

## API Endpoints

### 1. Get All Data
```
GET /api/all
```
Returns all scraped data including fees, hostels, announcements, and requirements.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-11-17T10:30:00.000Z",
    "undergraduateFees": {...},
    "postgraduateFees": {...},
    "hostelFees": [...],
    "acceptanceFees": {...},
    "announcements": [...],
    "requirements": {...}
  }
}
```

### 2. Get Undergraduate Fees
```
GET /api/fees/undergraduate
```
Returns undergraduate school fees for fresh and returning students (Science & Non-Science).

**Example Response:**
```json
{
  "success": true,
  "data": {
    "freshStudents": {
      "science": {
        "Examination Fees": 10000,
        "Labouratory Fees": 15000,
        "Library / MTN Lib.": 5000,
        "GRAND TOTAL": 115500
      },
      "nonScience": {
        "Examination Fees": 10000,
        "Labouratory Fees": 5000,
        "GRAND TOTAL": 105500
      }
    },
    "additionalCharges": {...},
    "note": "Additional charge: N1,200 for Freshers, N250 for Returning Students"
  }
}
```

### 3. Get Postgraduate Fees
```
GET /api/fees/postgraduate
```
Returns postgraduate school fees for all programs.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "programs": [
      {
        "program": "PGD (All Courses)",
        "freshers": 132000,
        "returning": 82500
      },
      {
        "program": "MBA, MBF",
        "freshers": 220000,
        "returning": 155500
      }
    ]
  }
}
```

### 4. Get Hostel Fees
```
GET /api/hostel
```
Returns hostel accommodation fees for all available hostels.

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "sn": "1",
      "hostelName": "NDDC HOSTEL",
      "demarcation": "N/A",
      "amount": 60000
    },
    {
      "sn": "7",
      "hostelName": "HALL 7",
      "demarcation": "N/A",
      "amount": 116000
    }
  ]
}
```

### 5. Get Acceptance Fees
```
GET /api/fees/acceptance
```
Returns acceptance fees for newly admitted students.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "medicalSciences": {
      "BANK/PORTAL CHARGES": 5000,
      "ADMISSION CLEARANCE": 30000,
      "COLLEGE DEVELOPMENT LEVY": 20000,
      "TOTAL": 80000
    },
    "otherCandidates": {
      "BANK/PORTAL CHARGES": 5000,
      "ADMISSION CLEARANCE": 30000,
      "TOTAL": 60000
    }
  }
}
```

### 6. Get Announcements
```
GET /api/announcements
```
Returns current announcements and important notices.

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "title": "Hostel Accommodation Guidelines",
      "content": "Students interested in Hostel Accommodation on Campus should take note...",
      "fullContent": "Complete announcement text..."
    },
    {
      "title": "Accommodation Booking Start Date",
      "content": "Booking starts on 15 FEBRUARY 2025",
      "fullContent": "Accommodation booking using HOS Activation Code starts on 15 FEBRUARY 2025"
    }
  ]
}
```

### 7. Get Requirements
```
GET /api/requirements
```
Returns requirements for newly admitted students.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "documentsRequired": [
      {
        "number": "1",
        "document": "Birth Certificate or Age declaration"
      },
      {
        "number": "2",
        "document": "WAEC or NECO/NABTEB result"
      }
    ],
    "instructions": [
      "PAY YOUR ACCEPTANCE FEE",
      "UPLOAD RELEVANT DOCUMENTS",
      "REQUEST CLEARANCE"
    ]
  }
}
```

### 8. Health Check
```
GET /health
```
Returns API health status.

## Usage Examples

### Using cURL

```bash
# Get all data
curl http://localhost:3000/api/all

# Get undergraduate fees
curl http://localhost:3000/api/fees/undergraduate

# Get hostel fees
curl http://localhost:3000/api/hostel
```

### Using JavaScript (Fetch API)

```javascript
// Get undergraduate fees
fetch('http://localhost:3000/api/fees/undergraduate')
  .then(response => response.json())
  .then(data => {
    console.log('Undergraduate Fees:', data);
  })
  .catch(error => console.error('Error:', error));

// Get all data
async function getAllData() {
  try {
    const response = await fetch('http://localhost:3000/api/all');
    const data = await response.json();
    console.log('All Data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Using Python (Requests)

```python
import requests

# Get hostel fees
response = requests.get('http://localhost:3000/api/hostel')
data = response.json()
print('Hostel Fees:', data)
```

## Project Structure

```
uniben-scraper/
├── scraper.js          # Main scraper application
├── package.json        # Project dependencies
├── README.md          # Documentation
└── node_modules/      # Dependencies (auto-generated)
```

## How It Works

1. **Fetching**: The scraper uses Axios to fetch the HTML content from the UNIBEN portal
2. **Parsing**: Cheerio (jQuery-like library) parses the HTML structure
3. **Extraction**: Custom extraction functions use regex patterns and DOM traversal to extract specific data
4. **API**: Express.js serves the extracted data through RESTful endpoints
5. **Response**: Data is returned in clean, structured JSON format

## Data Extraction Details

### Undergraduate Fees
- Extracts fees for both Science and Non-Science students
- Separates fresh student charges and additional charges
- Includes examination fees, laboratory fees, library fees, etc.

### Postgraduate Fees
- Extracts fees for all PG programs (PGD, Masters, PhD)
- Includes both fresher and returning student charges
- Covers all faculties and departments

### Hostel Information
- Lists all available hostels with their serial numbers
- Includes demarcation details (floor, bunk position)
- Shows current accommodation fees for 2024/2025 session

### Announcements
- Extracts important notices and guidelines
- Includes booking dates and deadlines
- Provides requirements and instructions for students

## Error Handling

The API includes comprehensive error handling:
- Network errors (timeout, connection issues)
- Parsing errors (malformed HTML)
- Data extraction errors (missing patterns)

All errors return a structured response:
```json
{
  "success": false,
  "error": "Error message description"
}
```

## Configuration

You can modify the following in `scraper.js`:

- **Port**: Change `PORT` variable (default: 3000)
- **Timeout**: Adjust axios timeout (default: 10000ms)
- **User-Agent**: Modify headers for different user agents

## Limitations & Considerations

1. **Dynamic Content**: This scraper works with static HTML. If UNIBEN adds JavaScript-rendered content, you may need Puppeteer or Playwright.

2. **Rate Limiting**: Add delays between requests if scraping frequently to avoid overwhelming the server.

3. **Structure Changes**: If UNIBEN updates their website structure, extraction patterns may need adjustment.

4. **Legal**: Ensure compliance with UNIBEN's terms of service and robots.txt.

## Future Enhancements

- [ ] Add caching to reduce server load
- [ ] Implement rate limiting
- [ ] Add database storage for historical data
- [ ] Create scheduled jobs for automatic updates
- [ ] Add PDF extraction for linked documents
- [ ] Build a frontend dashboard
- [ ] Add authentication and API keys
- [ ] Implement webhooks for data changes

## Troubleshooting

### Port Already in Use
```bash
# Change the PORT in scraper.js or use:
PORT=4000 npm start
```

### Network Timeout
Increase the timeout value in the axios configuration:
```javascript
timeout: 30000  // 30 seconds
```

### Installation Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
- Check the UNIBEN portal: https://waeup.uniben.edu/
- Review the code comments in scraper.js
- Test endpoints using the provided examples

## Changelog

### Version 1.0.0 (2025-11-17)
- Initial release
- Complete extraction of fees, hostels, and announcements
- RESTful API implementation
- Comprehensive error handling
