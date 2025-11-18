const { parse } = require('csv-parse/sync');
const fs = require('fs').promises;

class CSVParserService {
  /**
   * Parse CSV file and return rows as objects
   * @param {string} filePath - Path to CSV file
   * @param {object} options - Parser options
   * @returns {Promise<Array>} Array of row objects
   */
  async parseFile(filePath, options = {}) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');

      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true, // Handle UTF-8 BOM
        ...options
      });

      return records;
    } catch (error) {
      throw new Error(`CSV parsing failed: ${error.message}`);
    }
  }

  /**
   * Detect columns in CSV file
   * @param {string} filePath - Path to CSV file
   * @returns {Promise<Array>} Array of column names
   */
  async detectColumns(filePath) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const lines = fileContent.split('\n');

      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Parse just the header row
      const headers = parse(lines[0], {
        trim: true,
        bom: true
      })[0];

      return headers;
    } catch (error) {
      throw new Error(`Column detection failed: ${error.message}`);
    }
  }

  /**
   * Validate CSV structure and content
   * @param {Array} rows - Parsed CSV rows
   * @param {object} columnMapping - Column mapping configuration
   * @returns {object} Validation result with errors
   */
  validateRows(rows, columnMapping) {
    const errors = [];
    const validRows = [];
    const duplicateEmails = new Set();
    const seenEmails = new Map();

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index is 0-based and header is row 1
      const rowErrors = [];

      // Extract mapped fields
      const email = row[columnMapping.email]?.trim();
      const firstName = row[columnMapping.firstName]?.trim();
      const lastName = row[columnMapping.lastName]?.trim();
      const group = columnMapping.group ? row[columnMapping.group]?.trim() : '';
      const role = columnMapping.role ? row[columnMapping.role]?.trim() : 'student';

      // Validate email
      if (!email) {
        rowErrors.push('Email is required');
      } else if (!this.isValidEmail(email)) {
        rowErrors.push('Invalid email format');
      } else {
        // Check for duplicates within the file
        if (seenEmails.has(email.toLowerCase())) {
          rowErrors.push(`Duplicate email (also in row ${seenEmails.get(email.toLowerCase())})`);
          duplicateEmails.add(email.toLowerCase());
        } else {
          seenEmails.set(email.toLowerCase(), rowNumber);
        }
      }

      // Validate first name
      if (!firstName) {
        rowErrors.push('First name is required');
      } else if (firstName.length > 100) {
        rowErrors.push('First name too long (max 100 characters)');
      }

      // Validate last name
      if (!lastName) {
        rowErrors.push('Last name is required');
      } else if (lastName.length > 100) {
        rowErrors.push('Last name too long (max 100 characters)');
      }

      // Validate role (if provided)
      const validRoles = ['student', 'instructor', 'org_admin'];
      if (role && !validRoles.includes(role.toLowerCase())) {
        rowErrors.push(`Invalid role (must be one of: ${validRoles.join(', ')})`);
      }

      if (rowErrors.length > 0) {
        errors.push({
          row: rowNumber,
          data: row,
          errors: rowErrors
        });
      } else {
        validRows.push({
          row: rowNumber,
          email,
          firstName,
          lastName,
          group,
          role: role?.toLowerCase() || 'student',
          originalData: row
        });
      }
    });

    return {
      valid: errors.length === 0,
      totalRows: rows.length,
      validRows: validRows.length,
      errorRows: errors.length,
      errors,
      validatedData: validRows
    };
  }

  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Suggest column mappings based on common patterns
   * @param {Array} columns - CSV column names
   * @returns {object} Suggested column mapping
   */
  suggestColumnMapping(columns) {
    const mapping = {};

    // Email patterns
    const emailPatterns = ['email', 'e-mail', 'email address', 'mail'];
    mapping.email = this.findMatchingColumn(columns, emailPatterns);

    // First name patterns
    const firstNamePatterns = ['first name', 'firstname', 'first', 'given name', 'forename'];
    mapping.firstName = this.findMatchingColumn(columns, firstNamePatterns);

    // Last name patterns
    const lastNamePatterns = ['last name', 'lastname', 'last', 'surname', 'family name'];
    mapping.lastName = this.findMatchingColumn(columns, lastNamePatterns);

    // Group patterns
    const groupPatterns = ['group', 'class', 'grade', 'team', 'cohort'];
    mapping.group = this.findMatchingColumn(columns, groupPatterns);

    // Role patterns
    const rolePatterns = ['role', 'type', 'user type', 'account type'];
    mapping.role = this.findMatchingColumn(columns, rolePatterns);

    return mapping;
  }

  /**
   * Find matching column by pattern
   * @param {Array} columns
   * @param {Array} patterns
   * @returns {string|null}
   */
  findMatchingColumn(columns, patterns) {
    for (const column of columns) {
      const normalizedColumn = column.toLowerCase().trim();
      for (const pattern of patterns) {
        if (normalizedColumn === pattern || normalizedColumn.includes(pattern)) {
          return column;
        }
      }
    }
    return null;
  }
}

module.exports = new CSVParserService();
