# Technical Stack

## Runtime & Language

- **Node.js** v14.0.0+ (ES Modules)
- **JavaScript** (ES6+)
- Module system: ES Modules (`"type": "module"` in package.json)

## Core Dependencies

- **dotenv** (^16.3.1) - Environment variable management
- **node-cron** (^3.0.3) - Task scheduling
- **xlsx** (^0.18.5) - Excel file parsing
- **axios** (^1.6.0) - HTTP client for SMS API calls

## Development Dependencies

- **vitest** (^4.0.1) - Testing framework

## Build & Test Commands

```bash
# Install dependencies
npm install

# Start application (production)
npm start

# Start application (development)
npm run dev

# Run tests (single run, no watch mode)
npm test
```

## Configuration

- Environment variables via `.env` file
- Configuration validation on startup
- Required variables: EXCEL_FILE_PATH, RECIPIENT_MOBILE_NUMBER, SMS_API_URL, SMS_API_KEY, SMS_SENDER_ID
- Optional variables: SCHEDULED_TIME (default: 09:00), LOG_LEVEL (default: INFO), LOG_FILE_PATH

## Testing

- Test framework: Vitest
- Test location: `tests/` directory
- Test files: `*.test.js`
- Configuration: `vitest.config.js`
- Run mode: Single execution (--run flag), no watch mode
