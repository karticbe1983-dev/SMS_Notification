const xlsx = require('xlsx');
const path = require('path');

// Create valid Excel file with associates
function createValidExcelFile() {
  const data = [
    ['Name', 'Date of Birth'],
    ['John Doe', '01/15/1990'],
    ['Jane Smith', '03/22/1985'],
    ['Bob Johnson', new Date(1992, 6, 10)], // July 10, 1992
    ['Alice Williams', '12/05/1988']
  ];

  const ws = xlsx.utils.aoa_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Associates');
  xlsx.writeFile(wb, path.join(__dirname, 'valid-associates.xlsx'));
  console.log('✓ Created valid-associates.xlsx');
}

// Create Excel file with today's birthday
function createTodayBirthdayFile() {
  const today = new Date();
  const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/1990`;
  
  const data = [
    ['Name', 'Date of Birth'],
    ['Birthday Person', todayStr],
    ['John Doe', '01/15/1990']
  ];

  const ws = xlsx.utils.aoa_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Associates');
  xlsx.writeFile(wb, path.join(__dirname, 'today-birthday.xlsx'));
  console.log('✓ Created today-birthday.xlsx');
}

// Create Excel file with invalid data
function createInvalidDataFile() {
  const data = [
    ['Name', 'Date of Birth'],
    ['Valid Person', '01/15/1990'],
    ['', '03/22/1985'],  // Missing name
    ['No DOB Person', ''],  // Missing DOB
    ['Invalid Date', 'not-a-date'],  // Invalid date format
    ['Another Valid', '12/05/1988']
  ];

  const ws = xlsx.utils.aoa_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Associates');
  xlsx.writeFile(wb, path.join(__dirname, 'invalid-data.xlsx'));
  console.log('✓ Created invalid-data.xlsx');
}

// Create Excel file with different date formats
function createDifferentFormatsFile() {
  const data = [
    ['Name', 'Date of Birth'],
    ['US Format', '01/15/1990'],  // MM/DD/YYYY
    ['ISO Format', '1985-03-22'],  // YYYY-MM-DD
    ['Excel Serial', 33658],  // Excel serial number (03/15/1992)
    ['Dash Format', '12-05-1988']  // MM-DD-YYYY
  ];

  const ws = xlsx.utils.aoa_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Associates');
  xlsx.writeFile(wb, path.join(__dirname, 'different-formats.xlsx'));
  console.log('✓ Created different-formats.xlsx');
}

// Create empty Excel file
function createEmptyFile() {
  const data = [
    ['Name', 'Date of Birth']
  ];

  const ws = xlsx.utils.aoa_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Associates');
  xlsx.writeFile(wb, path.join(__dirname, 'empty.xlsx'));
  console.log('✓ Created empty.xlsx');
}

// Create XLS format file
function createXlsFile() {
  const data = [
    ['Name', 'Date of Birth'],
    ['John Doe', '01/15/1990'],
    ['Jane Smith', '03/22/1985']
  ];

  const ws = xlsx.utils.aoa_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Associates');
  xlsx.writeFile(wb, path.join(__dirname, 'valid-associates.xls'), { bookType: 'xls' });
  console.log('✓ Created valid-associates.xls');
}

// Run all
console.log('Creating test Excel files...\n');
createValidExcelFile();
createTodayBirthdayFile();
createInvalidDataFile();
createDifferentFormatsFile();
createEmptyFile();
createXlsFile();
console.log('\n✓ All test files created successfully!');
