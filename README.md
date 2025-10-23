# Birthday Notification System

An automated system that monitors associate birthdays from an Excel spreadsheet and sends daily SMS notifications when birthdays occur.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Excel File Format](#excel-file-format)
- [Usage](#usage)
- [Scheduler Setup](#scheduler-setup)
- [Logging](#logging)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## Features

- ✅ Automated daily birthday checks from Excel spreadsheets
- ✅ SMS notifications via configurable SMS gateway
- ✅ Support for .xlsx and .xls file formats
- ✅ Flexible scheduling with cron expressions
- ✅ Comprehensive logging with rotation
- ✅ Graceful error handling and recovery
- ✅ Secure credential management via environment variables

## Prerequisites

Before installing the Birthday Notification System, ensure you have:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- An **SMS gateway account** with API access (e.g., Twilio, Nexmo, etc.)
- An **Excel file** (.xlsx or .xls) containing associate data

## Installation

1. **Clone or download the repository:**

```bash
git clone <repository-url>
cd birthday-notification-system
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create configuration file:**

Copy the example environment file and configure it with your settings:

```bash
cp .env.example .env
```

4. **Edit the `.env` file** with your actual configuration values (see [Configuration](#configuration) section)

## Configuration

The system is configured using environment variables stored in a `.env` file. All configuration options are documented below.

### Environment Variables

#### Excel File Configuration

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EXCEL_FILE_PATH` | Yes | Path to the Excel file containing associate data | `./data/associates.xlsx` |

#### SMS Recipient Configuration

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RECIPIENT_MOBILE_NUMBER` | Yes | Mobile number to receive birthday notifications (include country code) | `+1234567890` |

#### SMS Provider Configuration

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SMS_API_URL` | Yes | SMS gateway API endpoint URL | `https://api.smsprovider.com/send` |
| `SMS_API_KEY` | Yes | API key for SMS gateway authentication | `your_api_key_here` |
| `SMS_SENDER_ID` | Yes | Sender ID displayed in SMS messages | `BirthdayBot` |

#### Scheduler Configuration

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SCHEDULED_TIME` | No | Daily execution time in HH:MM format (24-hour) | `09:00` (default) |

#### Logging Configuration

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `LOG_LEVEL` | No | Logging level (INFO, WARN, ERROR) | `INFO` (default) |
| `LOG_FILE_PATH` | No | Path to log file | `./logs/birthday-system.log` |

### Example Configuration

```env
# Excel File Configuration
EXCEL_FILE_PATH=./data/associates.xlsx

# SMS Recipient Configuration
RECIPIENT_MOBILE_NUMBER=+1234567890

# SMS Provider Configuration
SMS_API_URL=https://api.smsprovider.com/send
SMS_API_KEY=your_api_key_here
SMS_SENDER_ID=BirthdayBot

# Scheduler Configuration
SCHEDULED_TIME=09:00

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE_PATH=./logs/birthday-system.log
```

## Excel File Format

The system expects an Excel file with the following structure:

### Required Columns

| Column | Header | Data Type | Format | Example |
|--------|--------|-----------|--------|---------|
| A | Name | Text | Any text | `John Doe` |
| B | Date of Birth | Date | MM/DD/YYYY or DD/MM/YYYY | `03/15/1990` |

### Format Requirements

- **First row**: Can contain headers (will be skipped if detected)
- **Name column (A)**: Must contain non-empty text
- **Date of Birth column (B)**: Must be a valid date in one of the supported formats
- **Worksheet**: Data should be in the first worksheet
- **File formats**: Supports both `.xlsx` and `.xls` formats

### Example Excel Structure

```
| Name          | Date of Birth |
|---------------|---------------|
| John Doe      | 03/15/1990    |
| Jane Smith    | 07/22/1985    |
| Bob Johnson   | 12/01/1992    |
```

### Invalid Row Handling

- Rows with missing or invalid dates will be skipped
- A warning will be logged for each skipped row
- Processing continues with remaining valid rows

## Usage

### Running the Application

#### Development Mode

Start the application in development mode:

```bash
npm run dev
```

#### Production Mode

Start the application in production mode:

```bash
npm start
```

### Application Behavior

1. **On Startup:**
   - Loads configuration from `.env` file
   - Validates all required settings
   - Initializes the scheduler
   - Logs startup information

2. **Daily Execution:**
   - Runs automatically at the configured time
   - Reads the Excel file
   - Identifies associates with birthdays today
   - Sends SMS notification if birthdays are found
   - Logs all operations and results

3. **Graceful Shutdown:**
   - Press `Ctrl+C` to stop the application
   - Scheduler stops gracefully
   - All resources are cleaned up

### Manual Birthday Check

To test the system or run a manual check, you can use the example script:

```bash
node examples/scheduler-usage.js
```

## Scheduler Setup

The system includes a built-in scheduler that runs daily checks. However, you can also set up system-level scheduling for additional reliability.

### Windows (Task Scheduler)

1. **Open Task Scheduler:**
   - Press `Win + R`, type `taskschd.msc`, press Enter

2. **Create Basic Task:**
   - Click "Create Basic Task" in the right panel
   - Name: `Birthday Notification System`
   - Description: `Daily birthday check and SMS notification`

3. **Set Trigger:**
   - Trigger: Daily
   - Start time: Your desired time (e.g., 9:00 AM)
   - Recur every: 1 day

4. **Set Action:**
   - Action: Start a program
   - Program/script: `node`
   - Add arguments: `src/index.js`
   - Start in: `C:\path\to\birthday-notification-system`

5. **Finish and Test:**
   - Review settings and click Finish
   - Right-click the task and select "Run" to test

### Linux/Mac (Cron)

1. **Edit crontab:**

```bash
crontab -e
```

2. **Add cron job:**

```bash
# Run birthday notification system daily at 9:00 AM
0 9 * * * cd /path/to/birthday-notification-system && node src/index.js >> /path/to/logs/cron.log 2>&1
```

3. **Save and exit**

4. **Verify cron job:**

```bash
crontab -l
```

### Using PM2 (Process Manager)

For production deployments, consider using PM2 for process management:

1. **Install PM2:**

```bash
npm install -g pm2
```

2. **Start application:**

```bash
pm2 start src/index.js --name birthday-system
```

3. **Configure auto-restart:**

```bash
pm2 startup
pm2 save
```

4. **Monitor application:**

```bash
pm2 status
pm2 logs birthday-system
```

## Logging

The system provides comprehensive logging for monitoring and troubleshooting.

### Log Levels

- **INFO**: Normal operations (startup, daily checks, SMS sent)
- **WARN**: Non-critical issues (invalid rows, skipped data)
- **ERROR**: Critical failures (configuration errors, API failures)

### Log File Location

Logs are written to the path specified in `LOG_FILE_PATH` (default: `./logs/birthday-system.log`)

### Log Rotation

- Logs are automatically rotated daily
- Format: `birthday-system-YYYY-MM-DD.log`
- Old logs are preserved for historical reference

### Sample Log Output

```
[2025-10-23 09:00:00] INFO: ========================================
[2025-10-23 09:00:00] INFO: Birthday Notification System Starting...
[2025-10-23 09:00:00] INFO: ========================================
[2025-10-23 09:00:01] INFO: Configuration loaded from environment
[2025-10-23 09:00:01] INFO: Scheduled time: 09:00
[2025-10-23 09:00:01] INFO: Starting daily birthday check...
[2025-10-23 09:00:02] INFO: Loaded 150 associates from Excel file
[2025-10-23 09:00:02] INFO: Found 2 associates with birthdays today
[2025-10-23 09:00:03] INFO: SMS notification sent successfully to +1234567890
[2025-10-23 09:00:03] INFO: Daily birthday check completed
```

## Testing

The system includes comprehensive unit and integration tests.

### Run All Tests

```bash
npm test
```

### Test Coverage

The test suite covers:
- Excel file parsing (valid/invalid formats)
- Date matching logic (birthdays, leap years)
- SMS service (message formatting, API calls)
- Configuration validation
- End-to-end integration scenarios

### Test Files Location

Tests are located in the `tests/` directory:
- `ExcelParser.test.js` - Excel parsing tests
- `DateMatcher.test.js` - Date matching tests
- `SMSService.test.js` - SMS service tests
- `BirthdayCheckService.test.js` - Orchestration tests
- `integration.test.js` - End-to-end tests

## Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start

**Symptom:** Error message on startup

**Possible Causes:**
- Missing or invalid `.env` file
- Missing required environment variables
- Invalid configuration values

**Solutions:**
```bash
# Verify .env file exists
ls -la .env

# Check .env file has all required variables
cat .env

# Compare with .env.example
diff .env .env.example

# Ensure proper format (no spaces around =)
EXCEL_FILE_PATH=./data/associates.xlsx  # Correct
EXCEL_FILE_PATH = ./data/associates.xlsx  # Incorrect
```

#### 2. Excel File Not Found

**Symptom:** `Error: Excel file not found at path: ./data/associates.xlsx`

**Solutions:**
```bash
# Verify file exists
ls -la ./data/associates.xlsx

# Check file path in .env matches actual location
# Use absolute path if relative path doesn't work
EXCEL_FILE_PATH=/full/path/to/associates.xlsx

# Ensure file has read permissions
chmod 644 ./data/associates.xlsx
```

#### 3. Invalid Excel Format

**Symptom:** `Error: Invalid Excel file format` or rows being skipped

**Solutions:**
- Ensure file is saved as `.xlsx` or `.xls` format
- Verify Column A contains names (text)
- Verify Column B contains dates in MM/DD/YYYY or DD/MM/YYYY format
- Check that dates are formatted as dates, not text
- Remove any merged cells or complex formatting
- Ensure data is in the first worksheet

**Excel Format Checklist:**
```
✓ File extension is .xlsx or .xls
✓ Column A has associate names
✓ Column B has dates of birth
✓ Dates are in MM/DD/YYYY or DD/MM/YYYY format
✓ No empty rows between data
✓ Data is in the first worksheet
```

#### 4. SMS Not Sending

**Symptom:** No SMS received, or error in logs

**Possible Causes:**
- Invalid API credentials
- Incorrect API URL
- Invalid recipient mobile number format
- Network connectivity issues
- SMS gateway account issues (insufficient credits, etc.)

**Solutions:**
```bash
# Verify SMS configuration in .env
echo $SMS_API_URL
echo $SMS_API_KEY
echo $SMS_SENDER_ID
echo $RECIPIENT_MOBILE_NUMBER

# Test API credentials manually (example with curl)
curl -X POST $SMS_API_URL \
  -H "Authorization: Bearer $SMS_API_KEY" \
  -d "to=$RECIPIENT_MOBILE_NUMBER" \
  -d "message=Test"

# Ensure mobile number includes country code
RECIPIENT_MOBILE_NUMBER=+1234567890  # Correct
RECIPIENT_MOBILE_NUMBER=1234567890   # May not work

# Check SMS gateway account status
# - Verify account is active
# - Check remaining credits
# - Review API rate limits
```

#### 5. Scheduler Not Running

**Symptom:** Application starts but daily checks don't execute

**Solutions:**
```bash
# Verify SCHEDULED_TIME format (24-hour HH:MM)
SCHEDULED_TIME=09:00  # Correct
SCHEDULED_TIME=9:00   # May not work
SCHEDULED_TIME=09:00 AM  # Incorrect

# Check system time matches expected timezone
date

# Review logs for scheduler errors
tail -f ./logs/birthday-system.log

# Test manual execution
node examples/scheduler-usage.js
```

#### 6. Permission Denied Errors

**Symptom:** `EACCES: permission denied`

**Solutions:**
```bash
# Grant read permissions to Excel file
chmod 644 ./data/associates.xlsx

# Grant write permissions to log directory
chmod 755 ./logs

# Check file ownership
ls -la ./data/associates.xlsx
ls -la ./logs

# Run with appropriate user permissions
# Avoid running as root unless necessary
```

#### 7. Date Format Issues

**Symptom:** Birthdays not detected or wrong dates matched

**Solutions:**
- Ensure Excel dates are formatted consistently
- Use MM/DD/YYYY or DD/MM/YYYY format
- Avoid text-formatted dates
- Check system timezone matches expected timezone
- Verify dates in Excel are actual date values, not text

**Test Date Matching:**
```javascript
// Create a test file with today's date
// Run manual check to verify detection
node examples/scheduler-usage.js
```

#### 8. Memory or Performance Issues

**Symptom:** Application crashes or runs slowly with large Excel files

**Solutions:**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 src/index.js

# Optimize Excel file:
# - Remove unnecessary columns
# - Remove formatting and formulas
# - Keep only required data
# - Split into multiple files if very large (>10,000 rows)
```

### Getting Help

If you encounter issues not covered here:

1. **Check logs:** Review `./logs/birthday-system.log` for detailed error messages
2. **Enable debug logging:** Set `LOG_LEVEL=DEBUG` in `.env`
3. **Run tests:** Execute `npm test` to verify system components
4. **Review configuration:** Double-check all environment variables
5. **Test components individually:** Use example scripts in `examples/` directory

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
# In .env file
LOG_LEVEL=DEBUG

# Or set environment variable
LOG_LEVEL=DEBUG npm start
```

## Security Considerations

### Credential Management

- **Never commit `.env` file** to version control
- Store API keys securely in environment variables
- Use `.env.example` as a template (without real credentials)
- Rotate API keys periodically
- Use different credentials for development and production

### File Permissions

```bash
# Restrict .env file access
chmod 600 .env

# Ensure log files are not world-readable
chmod 640 ./logs/*.log
```

### Data Privacy

- Excel files may contain personal information (names, birthdates)
- Ensure proper file access controls
- Consider encrypting Excel files at rest
- Implement data retention policies
- Comply with relevant privacy regulations (GDPR, CCPA, etc.)

### Network Security

- Use HTTPS for SMS API endpoints
- Validate SSL certificates
- Consider using VPN for production deployments
- Implement IP whitelisting if supported by SMS gateway

### Logging Security

- API credentials are never logged
- Mobile numbers are masked in logs (last 4 digits only)
- Implement log file rotation and retention policies
- Secure log file access

## License

ISC

## Support

For issues, questions, or contributions, please contact the development team.
