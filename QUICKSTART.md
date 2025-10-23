# Quick Start Guide

Get the Birthday Notification System up and running in 5 minutes.

## Prerequisites

- Node.js v14+ installed
- SMS gateway account (Twilio, Nexmo, etc.)
- Excel file with associate data

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Create configuration file
cp .env.example .env

# 3. Edit .env with your settings
# (Use your favorite text editor)
```

## Configuration

Edit `.env` file with your actual values:

```env
# Path to your Excel file
EXCEL_FILE_PATH=./data/associates.xlsx

# Your mobile number (include country code)
RECIPIENT_MOBILE_NUMBER=+1234567890

# Your SMS gateway credentials
SMS_API_URL=https://api.your-sms-provider.com/send
SMS_API_KEY=your_actual_api_key_here
SMS_SENDER_ID=BirthdayBot

# When to run daily checks (24-hour format)
SCHEDULED_TIME=09:00
```

## Prepare Excel File

Create or copy your Excel file to `./data/associates.xlsx` with this format:

| Name | Date of Birth |
|------|---------------|
| John Doe | 03/15/1990 |
| Jane Smith | 10/23/1985 |

**Important:**
- Column A: Associate names
- Column B: Dates in MM/DD/YYYY format
- Save as .xlsx or .xls format

## Run the Application

```bash
# Start the application
npm start
```

You should see:

```
[INFO] Birthday Notification System Starting...
[INFO] Scheduled time: 09:00
[INFO] Birthday Notification System Started Successfully
[INFO] Daily checks scheduled at 09:00
[INFO] Press Ctrl+C to stop the application
```

## Test It Works

To test without waiting for the scheduled time:

```bash
# Run a manual check
node examples/scheduler-usage.js
```

## What Happens Next?

1. The system runs automatically every day at your scheduled time
2. It checks the Excel file for birthdays matching today's date
3. If birthdays are found, it sends an SMS to your configured number
4. All activity is logged to `./logs/birthday-system-YYYY-MM-DD.log`

## Common Issues

### "Excel file not found"
- Verify the file exists at the path specified in `EXCEL_FILE_PATH`
- Use absolute path if relative path doesn't work

### "SMS not sending"
- Double-check your SMS API credentials
- Ensure mobile number includes country code (+1234567890)
- Verify your SMS gateway account is active

### "Invalid date format"
- Ensure dates in Excel are formatted as MM/DD/YYYY
- Make sure dates are actual date values, not text

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Check logs in `./logs/` directory for detailed information
- Run `npm test` to verify all components are working

## Need Help?

1. Check the [Troubleshooting](README.md#troubleshooting) section in README
2. Review log files in `./logs/` directory
3. Run tests: `npm test`
4. Contact support team

---

**That's it!** Your Birthday Notification System is now running and will automatically check for birthdays daily.
