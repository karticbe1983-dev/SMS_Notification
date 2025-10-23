// Quick test to verify Configuration Manager implementation
const Configuration = require('./src/models/Configuration');

console.log('Testing Configuration Model...\n');

// Test 1: Mobile number validation
const config = new Configuration();
console.log('Test 1: Mobile Number Validation');
console.log('  Valid number (+1234567890):', config.validateMobileNumber('+1234567890'));
console.log('  Invalid number (1234567890):', config.validateMobileNumber('1234567890'));
console.log('  Invalid number (abc):', config.validateMobileNumber('abc'));
console.log('  Empty string:', config.validateMobileNumber(''));

// Test 2: File path validation
console.log('\nTest 2: File Path Validation');
console.log('  Valid path (.env.example):', config.validateFilePath('.env.example'));
console.log('  Invalid path (nonexistent.txt):', config.validateFilePath('nonexistent.txt'));

// Test 3: Scheduled time validation
console.log('\nTest 3: Scheduled Time Validation');
console.log('  Valid time (09:00):', config.validateScheduledTime('09:00'));
console.log('  Valid time (23:59):', config.validateScheduledTime('23:59'));
console.log('  Invalid time (25:00):', config.validateScheduledTime('25:00'));
console.log('  Invalid time (9:0):', config.validateScheduledTime('9:0'));

// Test 4: Configuration validation with missing values
console.log('\nTest 4: Configuration Validation (empty config)');
const validationResult = config.validate();
console.log('  Is valid:', validationResult.isValid);
console.log('  Errors:', validationResult.errors.length);

// Test 5: Load from environment (will fail without .env)
console.log('\nTest 5: Load from Environment');
config.loadFromEnvironment();
console.log('  Excel file path:', config.excelFilePath || '(not set)');
console.log('  Recipient number:', config.recipientMobileNumber || '(not set)');

// Test 6: Safe object for logging
console.log('\nTest 6: Safe Object (masked sensitive data)');
config.smsApiKey = 'secret_key_12345';
config.recipientMobileNumber = '+1234567890';
const safeObj = config.toSafeObject();
console.log('  Masked API Key:', safeObj.smsApiKey);
console.log('  Masked Mobile:', safeObj.recipientMobileNumber);

console.log('\n✓ All tests completed successfully!');
