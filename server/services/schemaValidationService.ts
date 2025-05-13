/**
 * Schema Validation Service
 * 
 * This service provides JSON Schema validation utilities for the application.
 * It allows validation of data structures against predefined schemas to ensure
 * data integrity throughout the system.
 */

import Ajv from 'ajv';
import { ValidateFunction } from 'ajv';
import fs from 'fs';
import path from 'path';
import { compile } from 'json-schema-to-typescript';

// Initialize Ajv with additional formats
const ajv = new Ajv({
  allErrors: true,
  strict: false,
  strictRequired: false,
  useDefaults: true,
  coerceTypes: true,
});

// Add formats
ajv.addFormat('uri', {
  type: 'string',
  validate: (str: string) => {
    try {
      new URL(str);
      return true;
    } catch (e) {
      return false;
    }
  }
});

// Cache for compiled schemas
const schemaCache: Record<string, any> = {};

/**
 * Load a JSON schema from the schemas directory
 * @param schemaName Name of the schema file without .json extension
 * @returns The loaded schema object
 */
export function loadSchema(schemaName: string): any {
  const schemaPath = path.resolve(process.cwd(), 'schemas', `${schemaName}.json`);
  try {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    return JSON.parse(schemaContent);
  } catch (error) {
    console.error(`Error loading schema ${schemaName}:`, error);
    throw new Error(`Cannot load schema: ${schemaName}`);
  }
}

/**
 * Get a compiled validator for a schema
 * @param schemaName Name of the schema file without .json extension
 * @returns A validation function
 */
export function getValidator(schemaName: string): ValidateFunction {
  if (!schemaCache[schemaName]) {
    const schema = loadSchema(schemaName);
    try {
      schemaCache[schemaName] = ajv.compile(schema);
    } catch (error) {
      console.error(`Error compiling schema ${schemaName}:`, error);
      throw new Error(`Cannot compile schema: ${schemaName}`);
    }
  }
  return schemaCache[schemaName];
}

/**
 * Validate data against a schema
 * @param schemaName Name of the schema file without .json extension
 * @param data Data to validate
 * @returns Validation result with errors if any
 */
export function validate(schemaName: string, data: any): { valid: boolean; errors: any[] | null } {
  const validator = getValidator(schemaName);
  const valid = validator(data);
  
  return {
    valid: valid as boolean,
    errors: validator.errors
  };
}

/**
 * Format validation errors into a human-readable string
 * @param errors Array of validation errors from Ajv
 * @returns Formatted error string
 */
export function formatErrors(errors: any[] | null): string {
  if (!errors || errors.length === 0) {
    return 'No errors';
  }
  
  return errors.map(err => {
    const path = err.instancePath || '';
    const property = err.params.missingProperty ?
      `${path}/${err.params.missingProperty}` :
      path;
      
    switch (err.keyword) {
      case 'required':
        return `Missing required property: ${err.params.missingProperty}`;
      case 'type':
        return `${property} should be ${err.params.type}`;
      case 'enum':
        return `${property} should be one of: ${err.params.allowedValues.join(', ')}`;
      case 'format':
        return `${property} should match format: ${err.params.format}`;
      case 'pattern':
        return `${property} should match pattern: ${err.params.pattern}`;
      case 'minimum':
        return `${property} should be >= ${err.params.limit}`;
      case 'maximum':
        return `${property} should be <= ${err.params.limit}`;
      case 'minLength':
        return `${property} should have at least ${err.params.limit} characters`;
      case 'maxLength':
        return `${property} should have at most ${err.params.limit} characters`;
      default:
        return `${property}: ${err.message}`;
    }
  }).join('\n');
}

/**
 * Generate TypeScript interfaces from JSON Schema
 * @param schemaName Name of the schema file without .json extension
 * @returns Promise that resolves to TypeScript interface string
 */
export async function generateTypeFromSchema(schemaName: string): Promise<string> {
  const schema = loadSchema(schemaName);
  try {
    return await compile(schema, schemaName, {
      bannerComment: '',
      style: {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'all',
      }
    });
  } catch (error) {
    console.error(`Error generating TypeScript from schema ${schemaName}:`, error);
    throw new Error(`Cannot generate TypeScript: ${schemaName}`);
  }
}

/**
 * Write generated TypeScript interfaces to a file
 * @param schemaName Name of the schema file without .json extension
 * @param outputPath Path to write the TypeScript file to
 */
export async function writeTypesToFile(schemaName: string, outputPath: string): Promise<void> {
  try {
    const typeScript = await generateTypeFromSchema(schemaName);
    const dirPath = path.dirname(outputPath);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, typeScript, 'utf8');
    console.log(`Types for ${schemaName} written to ${outputPath}`);
  } catch (error) {
    console.error(`Error writing types to file:`, error);
    throw new Error(`Failed to write types for ${schemaName}`);
  }
}

/**
 * Schema validation middleware for Express routes
 * @param schemaName Schema to validate against
 * @param property Request property to validate (body, query, params)
 * @returns Express middleware function
 */
export function validateSchema(schemaName: string, property: 'body' | 'query' | 'params' = 'body') {
  return (req: any, res: any, next: any) => {
    const { valid, errors } = validate(schemaName, req[property]);
    
    if (!valid) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatErrors(errors || [])
      });
    }
    
    next();
  };
}

// Export utility functions
export default {
  validate,
  validateSchema,
  formatErrors,
  generateTypeFromSchema,
  writeTypesToFile,
  loadSchema
};