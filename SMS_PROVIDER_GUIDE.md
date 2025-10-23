# SMS Provider Integration Guide

This guide helps you configure the Birthday Notification System with various SMS gateway providers.

## Table of Contents

- [Overview](#overview)
- [Supported Providers](#supported-providers)
- [Provider-Specific Configuration](#provider-specific-configuration)
- [Testing Your Configuration](#testing-your-configuration)
- [Troubleshooting](#troubleshooting)

## Overview

The Birthday Notification System can work with any SMS gateway that supports HTTP/HTTPS API calls. This guide provides configuration examples for popular providers.

### What You Need

From your SMS provider, you'll need:
1. **API Endpoint URL** - Where to send API requests
2. **API Key/Token** - Authentication credentials
3. **Sender ID** - The name/number shown as sender (if supported)
4. **Account Status** - Active account with sufficient credits

## Supported Providers

The system has been tested with these providers:

- [Twilio](#twilio)
- [Nexmo (Vonage)](#nexmo-vonage)
- [MessageBird](#messagebird)
- [Plivo](#plivo)
- [AWS SNS](#aws-sns)
- [Generic HTTP API](#generic-http-api)

## Provider-Specific Configuration

### Twilio

**Website:** https://www.twilio.com

**Setup Steps:**

1. **Create Twilio Account:**
   - Sign up at https://www.twilio.com/try-twilio
   - Verify your phone number
   - Get free trial credits

2. **Get Credentials:**
   - Go to Console Dashboard
   - Copy your Account SID
   - Copy your Auth Token
   - Get a Twilio phone number (or use trial number)

3. **Configure .env:**

```env
SMS_API_URL=https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json
SMS_API_KEY=YOUR_AUTH_TOKEN
SMS_SENDER_ID=YOUR_TWILIO_PHONE_NUMBER
RECIPIENT_MOBILE_NUMBER=+1234567890
```

**Example Values:**
```env
SMS_API_URL=https://api.twilio.com/2010-04-01/Accounts/AC1234567890abcdef/Messages.json
SMS_API_KEY=your_auth_token_here
SMS_SENDER_ID=+15551234567
RECIPIENT_MOBILE_NUMBER=+15559876543
```

**Notes:**
- Sender ID must be a Twilio phone number
- Include country code in all phone numbers
- Trial accounts can only send to verified numbers

**Pricing:** Pay-as-you-go, ~$0.0075 per SMS (US)

---

### Nexmo (Vonage)

**Website:** https://www.vonage.com/communications-apis/

**Setup Steps:**

1. **Create Vonage Account:**
   - Sign up at https://dashboard.nexmo.com/sign-up
   - Verify your email
   - Get free trial credits

2. **Get Credentials:**
   - Go to Dashboard
   - Copy your API Key
   - Copy your API Secret

3. **Configure .env:**

```env
SMS_API_URL=https://rest.nexmo.com/sms/json
SMS_API_KEY=YOUR_API_KEY:YOUR_API_SECRET
SMS_SENDER_ID=BirthdayBot
RECIPIENT_MOBILE_NUMBER=+1234567890
```

**Example Values:**
```env
SMS_API_URL=https://rest.nexmo.com/sms/json
SMS_API_KEY=abc12345:def67890ghij
SMS_SENDER_ID=BirthdayBot
RECIPIENT_MOBILE_NUMBER=+15559876543
```

**Notes:**
- API Key and Secret are separated by colon (:)
- Sender ID can be alphanumeric (11 chars max)
- Some countries don't support alphanumeric sender IDs

**Pricing:** Pay-as-you-go, ~$0.0076 per SMS (US)

---

### MessageBird

**Website:** https://www.messagebird.com

**Setup Steps:**

1. **Create MessageBird Account:**
   - Sign up at https://dashboard.messagebird.com/en/sign-up
   - Verify your email
   - Get free trial credits

2. **Get Credentials:**
   - Go to Developers → API Access
   - Create a new API key
   - Copy the API key

3. **Configure .env:**

```env
SMS_API_URL=https://rest.messagebird.com/messages
SMS_API_KEY=YOUR_API_KEY
SMS_SENDER_ID=BirthdayBot
RECIPIENT_MOBILE_NUMBER=+1234567890
```

**Example Values:**
```env
SMS_API_URL=https://rest.messagebird.com/messages
SMS_API_KEY=live_abc123def456ghi789
SMS_SENDER_ID=BirthdayBot
RECIPIENT_MOBILE_NUMBER=+15559876543
```

**Notes:**
- Use "live" API key for production
- Sender ID can be alphanumeric
- Test mode available with "test" API key

**Pricing:** Pay-as-you-go, varies by country

---

### Plivo

**Website:** https://www.plivo.com

**Setup Steps:**

1. **Create Plivo Account:**
   - Sign up at https://console.plivo.com/accounts/register/
   - Verify your email
   - Get free trial credits

2. **Get Credentials:**
   - Go to Dashboard
   - Copy your Auth ID
   - Copy your Auth Token
   - Get a Plivo phone number

3. **Configure .env:**

```env
SMS_API_URL=https://api.plivo.com/v1/Account/YOUR_AUTH_ID/Message/
SMS_API_KEY=YOUR_AUTH_TOKEN
SMS_SENDER_ID=YOUR_PLIVO_NUMBER
RECIPIENT_MOBILE_NUMBER=+1234567890
```

**Example Values:**
```env
SMS_API_URL=https://api.plivo.com/v1/Account/MAXXXXXXXXXXXXXXXXXX/Message/
SMS_API_KEY=your_auth_token_here
SMS_SENDER_ID=15551234567
RECIPIENT_MOBILE_NUMBER=+15559876543
```

**Notes:**
- Auth ID starts with "MA"
- Sender ID must be a Plivo phone number
- Trial accounts have limitations

**Pricing:** Pay-as-you-go, competitive rates

---

### AWS SNS

**Website:** https://aws.amazon.com/sns/

**Setup Steps:**

1. **Set Up AWS Account:**
   - Create AWS account
   - Enable SNS service
   - Create IAM user with SNS permissions

2. **Get Credentials:**
   - Create IAM access key
   - Note your AWS region
   - Configure AWS CLI or use access keys directly

3. **Configure .env:**

```env
SMS_API_URL=https://sns.us-east-1.amazonaws.com/
SMS_API_KEY=YOUR_ACCESS_KEY_ID:YOUR_SECRET_ACCESS_KEY
SMS_SENDER_ID=BirthdayBot
RECIPIENT_MOBILE_NUMBER=+1234567890
```

**Example Values:**
```env
SMS_API_URL=https://sns.us-east-1.amazonaws.com/
SMS_API_KEY=AKIAIOSFODNN7EXAMPLE:wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
SMS_SENDER_ID=BirthdayBot
RECIPIENT_MOBILE_NUMBER=+15559876543
```

**Notes:**
- Requires AWS account and IAM configuration
- More complex setup but highly reliable
- Integrates with other AWS services

**Pricing:** Pay-as-you-go, ~$0.00645 per SMS (US)

---

### Generic HTTP API

If your SMS provider isn't listed above, you can configure it manually:

**Requirements:**
- HTTP/HTTPS API endpoint
- Authentication method (API key, token, or basic auth)
- Ability to send POST requests

**Configuration Template:**

```env
SMS_API_URL=https://api.your-provider.com/send
SMS_API_KEY=your_api_key_here
SMS_SENDER_ID=YourSenderID
RECIPIENT_MOBILE_NUMBER=+1234567890
```

**Common API Patterns:**

1. **API Key in Header:**
   - Most common pattern
   - API key sent in Authorization header

2. **API Key in URL:**
   - API key as query parameter
   - Example: `https://api.provider.com/send?apikey=YOUR_KEY`

3. **Basic Authentication:**
   - Username:Password in Authorization header
   - Format: `username:password`

**Note:** The system's SMS service may need customization for providers with unique API requirements. Contact support for assistance.

## Testing Your Configuration

### Step 1: Verify Credentials

Before running the full system, verify your SMS provider credentials:

**Twilio Test:**
```bash
curl -X POST https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json \
  --data-urlencode "To=+15559876543" \
  --data-urlencode "From=+15551234567" \
  --data-urlencode "Body=Test message" \
  -u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN
```

**Nexmo Test:**
```bash
curl -X POST https://rest.nexmo.com/sms/json \
  -d "api_key=YOUR_API_KEY" \
  -d "api_secret=YOUR_API_SECRET" \
  -d "to=15559876543" \
  -d "from=BirthdayBot" \
  -d "text=Test message"
```

### Step 2: Test with Application

Run a manual test:

```bash
node examples/scheduler-usage.js
```

Check logs for SMS delivery status:

```bash
tail -f logs/birthday-system-*.log
```

### Step 3: Verify SMS Received

- Check your mobile phone for the test SMS
- Verify sender ID appears correctly
- Confirm message content is readable

## Troubleshooting

### Issue: Authentication Failed

**Symptoms:**
- Error: "401 Unauthorized"
- Error: "Invalid API key"

**Solutions:**
1. Verify API key is correct (no extra spaces)
2. Check if API key is active in provider dashboard
3. Ensure account is not suspended
4. Verify API key has SMS sending permissions

**Test:**
```bash
# Check if API key is set correctly
node -e "require('dotenv').config(); console.log('API Key:', process.env.SMS_API_KEY)"
```

---

### Issue: Invalid Phone Number

**Symptoms:**
- Error: "Invalid phone number format"
- Error: "Phone number not found"

**Solutions:**
1. Include country code: `+1234567890`
2. Remove spaces and dashes: `+1-234-567-8900` → `+1234567890`
3. Verify number is valid and active
4. Check if number is on provider's blacklist

**Valid Formats:**
```
✓ +15551234567
✓ +442071234567
✓ +61412345678

✗ 5551234567 (missing country code)
✗ +1 555 123 4567 (spaces)
✗ +1-555-123-4567 (dashes)
```

---

### Issue: Insufficient Credits

**Symptoms:**
- Error: "Insufficient balance"
- Error: "Account suspended"

**Solutions:**
1. Check account balance in provider dashboard
2. Add credits to your account
3. Verify billing information is up to date
4. Check if trial period has expired

---

### Issue: Rate Limiting

**Symptoms:**
- Error: "Too many requests"
- Error: "Rate limit exceeded"

**Solutions:**
1. Check provider's rate limits
2. Reduce frequency of tests
3. Upgrade to higher tier plan
4. Implement retry logic with delays

---

### Issue: Message Not Delivered

**Symptoms:**
- API returns success but SMS not received
- Delivery status shows "failed"

**Solutions:**
1. Check recipient number is correct
2. Verify recipient can receive SMS
3. Check if number is on DND (Do Not Disturb) list
4. Review provider's delivery logs
5. Verify sender ID is approved (some countries require registration)

---

### Issue: Sender ID Not Showing

**Symptoms:**
- SMS received but sender shows as number instead of name
- Sender ID appears as "Unknown"

**Solutions:**
1. Some countries don't support alphanumeric sender IDs
2. Sender ID may need pre-registration with provider
3. Use a phone number as sender ID instead
4. Check provider's sender ID requirements for your country

**Countries with Restrictions:**
- USA: Alphanumeric sender IDs not supported (use phone number)
- Canada: Similar to USA
- India: Sender IDs must be pre-registered
- China: Strict regulations on sender IDs

---

### Issue: Network/Connection Errors

**Symptoms:**
- Error: "Connection timeout"
- Error: "Network unreachable"

**Solutions:**
1. Check internet connectivity
2. Verify firewall allows outbound HTTPS (port 443)
3. Test API endpoint accessibility:
   ```bash
   curl -v https://api.your-provider.com
   ```
4. Check if provider's API is down (status page)
5. Verify DNS resolution works

---

## Provider Comparison

| Provider | Setup Difficulty | Pricing (US) | Trial Credits | Alphanumeric Sender | Global Coverage |
|----------|-----------------|--------------|---------------|---------------------|-----------------|
| Twilio | Easy | $0.0075/SMS | Yes | No (US) | Excellent |
| Nexmo | Easy | $0.0076/SMS | Yes | Yes | Excellent |
| MessageBird | Easy | Varies | Yes | Yes | Good |
| Plivo | Medium | Competitive | Yes | No (US) | Good |
| AWS SNS | Hard | $0.00645/SMS | No | No (US) | Excellent |

## Best Practices

1. **Start with Trial:**
   - Use trial credits for testing
   - Verify everything works before going live

2. **Monitor Usage:**
   - Track SMS delivery success rate
   - Monitor account balance
   - Set up low balance alerts

3. **Secure Credentials:**
   - Never commit API keys to version control
   - Rotate credentials regularly
   - Use different keys for dev/prod

4. **Test Regularly:**
   - Verify SMS delivery monthly
   - Test after any configuration changes
   - Keep backup provider configured

5. **Optimize Costs:**
   - Choose provider with best rates for your region
   - Consolidate messages when possible
   - Monitor for failed deliveries (wasted credits)

## Getting Help

If you need assistance with SMS provider integration:

1. **Check Provider Documentation:**
   - Most providers have detailed API docs
   - Look for SMS/messaging API sections

2. **Contact Provider Support:**
   - Most providers offer email/chat support
   - They can help with API integration issues

3. **Review Application Logs:**
   - Check `logs/birthday-system-*.log`
   - Look for detailed error messages

4. **Test with curl:**
   - Isolate if issue is with provider or application
   - Use curl commands to test API directly

## Additional Resources

- **Twilio Docs:** https://www.twilio.com/docs/sms
- **Nexmo Docs:** https://developer.vonage.com/messaging/sms/overview
- **MessageBird Docs:** https://developers.messagebird.com/api/sms-messaging/
- **Plivo Docs:** https://www.plivo.com/docs/sms/
- **AWS SNS Docs:** https://docs.aws.amazon.com/sns/

---

**Guide Version:** 1.0  
**Last Updated:** October 2025
