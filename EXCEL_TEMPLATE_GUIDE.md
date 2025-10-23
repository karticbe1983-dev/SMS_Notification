# Excel Template Guide

This guide explains how to create and maintain the Excel file for the Birthday Notification System.

## Table of Contents

- [File Format Requirements](#file-format-requirements)
- [Creating a New Excel File](#creating-a-new-excel-file)
- [Column Specifications](#column-specifications)
- [Date Format Guidelines](#date-format-guidelines)
- [Common Mistakes](#common-mistakes)
- [Validation Checklist](#validation-checklist)
- [Updating the Excel File](#updating-the-excel-file)

## File Format Requirements

### Supported Formats
- `.xlsx` (Excel 2007 and later) - **Recommended**
- `.xls` (Excel 97-2003)

### File Structure
- **Worksheet**: Data must be in the first worksheet
- **Headers**: Optional (first row can be headers or data)
- **Columns**: Minimum 2 columns (Name and Date of Birth)
- **Rows**: No maximum limit (tested with 10,000+ rows)

## Creating a New Excel File

### Method 1: Using Microsoft Excel

1. **Open Microsoft Excel**
2. **Create a new blank workbook**
3. **Set up columns:**
   - Column A: Associate Name
   - Column B: Date of Birth

4. **Add headers (optional but recommended):**
   ```
   | Name          | Date of Birth |
   ```

5. **Enter data:**
   ```
   | Name          | Date of Birth |
   | John Doe      | 03/15/1990    |
   | Jane Smith    | 07/22/1985    |
   | Bob Johnson   | 12/01/1992    |
   ```

6. **Format Date Column:**
   - Select column B
   - Right-click → Format Cells
   - Category: Date
   - Type: MM/DD/YYYY or DD/MM/YYYY
   - Click OK

7. **Save the file:**
   - File → Save As
   - Choose location: `./data/associates.xlsx`
   - Save as type: Excel Workbook (*.xlsx)

### Method 2: Using Google Sheets

1. **Create a new Google Sheet**
2. **Set up columns and enter data** (same as above)
3. **Format dates:**
   - Select column B
   - Format → Number → Date
4. **Download as Excel:**
   - File → Download → Microsoft Excel (.xlsx)
5. **Move to project directory:**
   - Save to `./data/associates.xlsx`

### Method 3: Using LibreOffice Calc

1. **Open LibreOffice Calc**
2. **Create new spreadsheet**
3. **Set up columns and enter data**
4. **Format dates:**
   - Select column B
   - Format → Cells → Date
   - Choose format: MM/DD/YYYY
5. **Save as Excel:**
   - File → Save As
   - File type: Excel 2007-365 (.xlsx)
   - Save to `./data/associates.xlsx`

## Column Specifications

### Column A: Associate Name

**Requirements:**
- **Type:** Text
- **Required:** Yes
- **Format:** Any text string
- **Max Length:** 255 characters (recommended: 50 characters)
- **Special Characters:** Allowed (accents, hyphens, apostrophes)

**Valid Examples:**
```
John Doe
Jane Smith-Johnson
María García
O'Brien, Patrick
李明 (Li Ming)
```

**Invalid Examples:**
```
(empty cell)          ❌ Name is required
123                   ⚠️  Numbers only (will work but not recommended)
```

### Column B: Date of Birth

**Requirements:**
- **Type:** Date
- **Required:** Yes
- **Format:** MM/DD/YYYY or DD/MM/YYYY
- **Range:** 01/01/1900 to current date

**Valid Examples:**
```
03/15/1990
12/01/1985
01/01/2000
2/5/1995      (will be interpreted as 02/05/1995)
```

**Invalid Examples:**
```
(empty cell)          ❌ Date is required
March 15, 1990        ❌ Text format not supported
15-03-1990            ❌ Wrong separator
1990/03/15            ❌ Wrong order
03/15/90              ⚠️  May work but ambiguous (use 4-digit year)
```

## Date Format Guidelines

### Recommended Format: MM/DD/YYYY

This format is recommended for consistency and clarity:
- `01/15/1990` - January 15, 1990
- `12/31/1985` - December 31, 1985

### Alternative Format: DD/MM/YYYY

Also supported, but ensure consistency throughout the file:
- `15/01/1990` - January 15, 1990
- `31/12/1985` - December 31, 1985

### Important Notes

1. **Be Consistent:** Use the same format for all dates in the file
2. **Use 4-Digit Years:** Always use YYYY (not YY)
3. **Leading Zeros:** Optional but recommended (01 vs 1)
4. **Date Values:** Ensure dates are formatted as dates, not text

### How to Verify Date Format in Excel

1. **Select a date cell**
2. **Look at the formula bar:**
   - If it shows a date: ✓ Correct
   - If it shows text: ✗ Needs fixing

3. **Check cell format:**
   - Right-click → Format Cells
   - Should show "Date" category
   - If "Text" or "General": needs reformatting

### Converting Text to Dates

If dates are stored as text:

1. **Select the date column**
2. **Data → Text to Columns**
3. **Choose "Delimited" → Next**
4. **Uncheck all delimiters → Next**
5. **Column data format: Date (MDY or DMY)**
6. **Finish**

## Common Mistakes

### Mistake 1: Dates Stored as Text

**Problem:** Dates entered as text won't be recognized

**Symptoms:**
- Dates left-aligned in cells (numbers are right-aligned)
- Green triangle in cell corner
- System logs "invalid date format"

**Solution:**
```
1. Select date column
2. Data → Text to Columns
3. Choose Date format
4. Finish
```

### Mistake 2: Inconsistent Date Formats

**Problem:** Mixing MM/DD/YYYY and DD/MM/YYYY

**Example:**
```
| Name       | Date of Birth |
| John       | 03/15/1990    |  ← MM/DD/YYYY
| Jane       | 22/07/1985    |  ← DD/MM/YYYY (ambiguous!)
```

**Solution:** Choose one format and use it consistently

### Mistake 3: Empty Rows

**Problem:** Empty rows between data

**Example:**
```
| Name       | Date of Birth |
| John       | 03/15/1990    |
|            |               |  ← Empty row
| Jane       | 07/22/1985    |
```

**Impact:** Empty rows are skipped (not a critical error)

**Solution:** Remove empty rows for cleaner data

### Mistake 4: Missing Data

**Problem:** Name or date missing

**Example:**
```
| Name       | Date of Birth |
| John       |               |  ← Missing date
|            | 07/22/1985    |  ← Missing name
```

**Impact:** Row will be skipped and logged as warning

**Solution:** Ensure both name and date are present

### Mistake 5: Wrong Worksheet

**Problem:** Data in second or later worksheet

**Impact:** System only reads first worksheet

**Solution:** Move data to first worksheet or create new file

### Mistake 6: Merged Cells

**Problem:** Using merged cells for formatting

**Impact:** May cause parsing errors

**Solution:** Unmerge all cells in data area

### Mistake 7: Formulas in Date Column

**Problem:** Using formulas instead of values

**Example:**
```
=TODAY()-365*30  ← Formula
```

**Impact:** May work but can cause issues

**Solution:** Convert formulas to values:
1. Select cells
2. Copy
3. Paste Special → Values

## Validation Checklist

Before using your Excel file, verify:

- [ ] File is saved as .xlsx or .xls format
- [ ] File is located at path specified in .env
- [ ] Data is in the first worksheet
- [ ] Column A contains associate names (no empty cells)
- [ ] Column B contains dates of birth (no empty cells)
- [ ] All dates use consistent format (MM/DD/YYYY or DD/MM/YYYY)
- [ ] Dates are formatted as dates, not text
- [ ] No merged cells in data area
- [ ] No empty rows between data
- [ ] File is not password protected
- [ ] File is not open in another application

### Quick Validation Test

Run this command to test your Excel file:

```bash
node examples/scheduler-usage.js
```

Check the output:
- ✓ "Loaded X associates" - File parsed successfully
- ✗ "Error: Invalid Excel file" - Check file format
- ⚠️  "Warning: Skipped row X" - Check that row's data

## Updating the Excel File

### Adding New Associates

1. **Open the Excel file**
2. **Go to the last row with data**
3. **Add new row:**
   ```
   | New Name      | 05/10/1995    |
   ```
4. **Save the file**
5. **Close Excel** (important - file must not be open when system runs)

### Modifying Existing Data

1. **Open the Excel file**
2. **Find the row to modify**
3. **Update name or date**
4. **Verify date format is maintained**
5. **Save and close**

### Removing Associates

1. **Open the Excel file**
2. **Select entire row(s) to remove**
3. **Right-click → Delete**
4. **Save and close**

**Note:** Don't just clear cells - delete entire rows to avoid empty rows

### Best Practices for Updates

1. **Backup First:**
   ```bash
   cp ./data/associates.xlsx ./data/associates-backup-$(date +%Y%m%d).xlsx
   ```

2. **Close Excel:** Always close the file after editing

3. **Test After Updates:**
   ```bash
   node examples/scheduler-usage.js
   ```

4. **Check Logs:** Verify no warnings about invalid data

5. **Version Control:** Keep dated backups of the file

## Sample Excel File

Here's a complete example with various scenarios:

| Name | Date of Birth |
|------|---------------|
| John Doe | 03/15/1990 |
| Jane Smith | 07/22/1985 |
| Bob Johnson | 12/01/1992 |
| María García | 05/10/1988 |
| Li Wei | 09/30/1995 |
| Sarah O'Connor | 02/14/1991 |
| Ahmed Hassan | 11/05/1987 |
| Emma Wilson | 06/18/1993 |
| Carlos Rodriguez | 04/25/1989 |
| Yuki Tanaka | 08/12/1994 |

## Troubleshooting Excel Issues

### Issue: "Excel file not found"

**Check:**
```bash
# Verify file exists
ls -la ./data/associates.xlsx

# Check path in .env matches
cat .env | grep EXCEL_FILE_PATH
```

### Issue: "Invalid Excel file format"

**Solutions:**
1. Open in Excel and Save As → .xlsx format
2. Remove any password protection
3. Ensure file is not corrupted (try opening in Excel)
4. Check file permissions: `chmod 644 ./data/associates.xlsx`

### Issue: "No associates loaded"

**Check:**
1. Data is in first worksheet
2. Data starts from row 1 or 2 (with/without headers)
3. Columns A and B contain data
4. File is not empty

### Issue: "Invalid date format" warnings

**Solutions:**
1. Select date column
2. Format → Cells → Date → MM/DD/YYYY
3. If dates are text, use Text to Columns to convert
4. Ensure consistent format throughout

### Issue: Birthdays not detected

**Check:**
1. Date format is correct
2. Dates are actual date values, not text
3. System timezone matches expected timezone
4. Test with a date matching today

## Advanced Tips

### Large Files (1000+ Associates)

- Remove unnecessary columns (keep only A and B)
- Remove formatting and colors
- Save as .xlsx (not .xls) for better performance
- Consider splitting into multiple files if >10,000 rows

### Multiple Locations

Create separate files for each location:
```
./data/associates-office1.xlsx
./data/associates-office2.xlsx
```

Run separate instances with different configurations.

### Data Privacy

- Limit access to Excel file
- Use file permissions: `chmod 600 ./data/associates.xlsx`
- Consider encrypting file at rest
- Regular backups to secure location

### Automation

Automate Excel file updates:
- Export from HR system
- Use scripts to generate Excel file
- Validate format before replacing production file

## Support

For Excel-related issues:
1. Verify file format using validation checklist
2. Test with sample file
3. Check application logs
4. Review this guide
5. Contact support team

---

**Template Version:** 1.0  
**Last Updated:** October 2025
