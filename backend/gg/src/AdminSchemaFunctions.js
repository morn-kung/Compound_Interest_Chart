/**
 * Administrative functions for managing SHEET_SCHEMAS and validation
 * These functions use the new Config.js capabilities for dynamic schema management
 * @requires Config.js - For schema management functions
 * @requires ValidationService.js - For validation functions
 * @requires checkSheetDatatypes.js - For reading sheet structures
 * @created 2025-09-30
 */

/**
 * Test function to demonstrate dynamic schema loading
 */
function testSchemaManagement() {
  console.log('🧪 Testing Schema Management Functions...');
  
  try {
    // 1. Show current static schemas
    console.log('\n📋 Current Static Schemas:');
    const currentSchemas = getSheetSchemas();
    console.log(JSON.stringify(currentSchemas, null, 2));
    
    // 2. Load schemas from Google Sheets
    console.log('\n🔄 Loading schemas from Google Sheets...');
    const dynamicSchemas = loadSchemasFromSheets();
    console.log('✅ Dynamic schemas loaded successfully');
    
    // 3. Show updated schemas
    console.log('\n📋 Updated Schemas:');
    const updatedSchemas = getSheetSchemas();
    console.log(JSON.stringify(updatedSchemas, null, 2));
    
    // 4. Validate all sheets against schemas
    console.log('\n✅ Validating all sheets against schemas...');
    const validationResult = validateAllSheetsAgainstSchemas();
    console.log('Validation Result:', JSON.stringify(validationResult, null, 2));
    
    console.log('\n🎉 Schema management test completed successfully!');
    return {
      status: 'success',
      message: 'Schema management test completed',
      currentSchemas: currentSchemas,
      dynamicSchemas: dynamicSchemas,
      updatedSchemas: updatedSchemas,
      validationResult: validationResult
    };
    
  } catch (error) {
    console.error('❌ Schema management test failed:', error);
    return {
      status: 'error',
      message: 'Schema management test failed: ' + error.toString()
    };
  }
}

/**
 * Initialize schemas from Google Sheets and validate system
 * Run this after setting up the system or when sheets change
 */
function initializeSystem() {
  console.log('🚀 Initializing System with Dynamic Schemas...');
  
  try {
    // 1. Load schemas from Google Sheets
    console.log('📡 Loading schemas from Google Sheets...');
    const schemas = loadSchemasFromSheets();
    console.log('✅ Schemas loaded');
    
    // 2. Validate all sheets
    console.log('🔍 Validating all sheets...');
    const validation = validateAllSheetsAgainstSchemas();
    
    // 3. Check for issues
    let hasIssues = false;
    const issues = [];
    
    if (validation.status === 'success' && validation.results) {
      Object.keys(validation.results).forEach(function(sheetName) {
        const result = validation.results[sheetName];
        if (!result.hasValidHeaders) {
          hasIssues = true;
          issues.push({
            sheet: sheetName,
            missing: result.missingHeaders,
            extra: result.extraHeaders
          });
        }
      });
    }
    
    // 4. Report results
    if (hasIssues) {
      console.warn('⚠️ System initialized with validation issues:');
      issues.forEach(function(issue) {
        console.warn(`  Sheet "${issue.sheet}": Missing [${issue.missing.join(', ')}], Extra [${issue.extra.join(', ')}]`);
      });
    } else {
      console.log('🎉 System initialized successfully - all sheets valid!');
    }
    
    return {
      status: hasIssues ? 'warning' : 'success',
      message: hasIssues ? 'System initialized with issues' : 'System initialized successfully',
      schemas: schemas,
      validation: validation,
      issues: issues
    };
    
  } catch (error) {
    console.error('❌ System initialization failed:', error);
    return {
      status: 'error',
      message: 'System initialization failed: ' + error.toString()
    };
  }
}

/**
 * Check if current schemas match Google Sheets reality
 */
function checkSchemaSync() {
  console.log('🔍 Checking schema synchronization...');
  
  try {
    // Get current schemas
    const currentSchemas = getSheetSchemas();
    
    // Get fresh data from sheets
    const freshData = checkSheetDatatypes();
    
    // Convert fresh data to schema format
    const freshSchemas = {};
    freshData.forEach(function(sheetData) {
      freshSchemas[sheetData.sheetName] = {
        headers: sheetData.headers,
        dataTypes: sheetData.dataTypes
      };
    });
    
    // Compare schemas
    const differences = [];
    
    Object.keys(freshSchemas).forEach(function(sheetName) {
      const current = currentSchemas[sheetName];
      const fresh = freshSchemas[sheetName];
      
      if (!current) {
        differences.push({
          sheet: sheetName,
          type: 'missing_in_config',
          details: 'Sheet exists in Google Sheets but not in SHEET_SCHEMAS'
        });
      } else {
        // Compare headers
        const currentHeaders = current.headers || [];
        const freshHeaders = fresh.headers || [];
        
        if (JSON.stringify(currentHeaders) !== JSON.stringify(freshHeaders)) {
          differences.push({
            sheet: sheetName,
            type: 'header_mismatch',
            current: currentHeaders,
            fresh: freshHeaders
          });
        }
        
        // Compare data types
        const currentTypes = current.dataTypes || [];
        const freshTypes = fresh.dataTypes || [];
        
        if (JSON.stringify(currentTypes) !== JSON.stringify(freshTypes)) {
          differences.push({
            sheet: sheetName,
            type: 'datatype_mismatch',
            current: currentTypes,
            fresh: freshTypes
          });
        }
      }
    });
    
    // Check for sheets in config but not in Google Sheets
    Object.keys(currentSchemas).forEach(function(sheetName) {
      if (!freshSchemas[sheetName]) {
        differences.push({
          sheet: sheetName,
          type: 'missing_in_sheets',
          details: 'Sheet exists in SHEET_SCHEMAS but not in Google Sheets'
        });
      }
    });
    
    const isInSync = differences.length === 0;
    
    if (isInSync) {
      console.log('✅ Schemas are in sync with Google Sheets');
    } else {
      console.warn('⚠️ Schema differences detected:');
      differences.forEach(function(diff) {
        console.warn(`  ${diff.sheet}: ${diff.type} - ${diff.details || 'See details in response'}`);
      });
    }
    
    return {
      status: isInSync ? 'success' : 'warning',
      message: isInSync ? 'Schemas are synchronized' : 'Schema differences detected',
      inSync: isInSync,
      differences: differences,
      currentSchemas: currentSchemas,
      freshSchemas: freshSchemas
    };
    
  } catch (error) {
    console.error('❌ Schema sync check failed:', error);
    return {
      status: 'error',
      message: 'Schema sync check failed: ' + error.toString()
    };
  }
}

/**
 * Generate a comprehensive system report
 */
function generateSystemReport() {
  console.log('📊 Generating comprehensive system report...');
  
  try {
    const report = {
      timestamp: new Date().toISOString(),
      schemas: getSheetSchemas(),
      schemaSync: checkSchemaSync(),
      validation: validateAllSheetsAgainstSchemas(),
      systemHealth: {
        configLoaded: typeof CONFIG !== 'undefined',
        schemasLoaded: typeof getSheetSchemas === 'function',
        validationAvailable: typeof validateAllSheetsAgainstSchemas === 'function',
        checkDatatypesAvailable: typeof checkSheetDatatypes === 'function'
      }
    };
    
    console.log('✅ System report generated successfully');
    return {
      status: 'success',
      message: 'System report generated',
      report: report
    };
    
  } catch (error) {
    console.error('❌ System report generation failed:', error);
    return {
      status: 'error',
      message: 'System report generation failed: ' + error.toString()
    };
  }
}