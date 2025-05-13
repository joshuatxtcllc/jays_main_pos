/**
 * Schema Controller
 * 
 * This controller provides endpoints for working with JSON Schema validation
 * and type generation.
 */

import { Request, Response } from 'express';
import schemaValidation from '../services/schemaValidationService';
import path from 'path';
import fs from 'fs';

/**
 * Get a list of all available schemas
 */
export async function getSchemas(req: Request, res: Response) {
  try {
    const schemasDir = path.resolve(process.cwd(), 'schemas');
    const schemaFiles = fs.readdirSync(schemasDir)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        name: file.replace('.json', ''),
        path: `/schemas/${file}`,
        description: getSchemaDescription(file.replace('.json', ''))
      }));
    
    res.json(schemaFiles);
  } catch (error: any) {
    console.error('Error getting schemas:', error);
    res.status(500).json({ error: `Failed to get schemas: ${error?.message || 'Unknown error'}` });
  }
}

/**
 * Get a specific schema by name
 */
export async function getSchema(req: Request, res: Response) {
  const { name } = req.params;
  
  try {
    const schema = schemaValidation.loadSchema(name);
    res.json(schema);
  } catch (error: any) {
    console.error(`Error getting schema ${name}:`, error);
    res.status(404).json({ error: `Schema '${name}' not found: ${error?.message || 'Unknown error'}` });
  }
}

/**
 * Validate data against a schema
 */
export async function validateData(req: Request, res: Response) {
  const { name } = req.params;
  const data = req.body;
  
  try {
    const result = schemaValidation.validate(name, data);
    
    if (result.valid) {
      res.json({ 
        valid: true,
        message: 'Validation successful'
      });
    } else {
      res.status(400).json({
        valid: false,
        errors: schemaValidation.formatErrors(result.errors)
      });
    }
  } catch (error: any) {
    console.error(`Error validating data against schema ${name}:`, error);
    res.status(500).json({ error: `Validation error: ${error?.message || 'Unknown error'}` });
  }
}

/**
 * Generate TypeScript types for a schema
 */
export async function generateTypes(req: Request, res: Response) {
  const { name } = req.params;
  
  try {
    const typeScript = await schemaValidation.generateTypeFromSchema(name);
    res.set('Content-Type', 'text/plain');
    res.send(typeScript);
  } catch (error: any) {
    console.error(`Error generating types for schema ${name}:`, error);
    res.status(500).json({ error: `Failed to generate types: ${error?.message || 'Unknown error'}` });
  }
}

/**
 * Get schema documentation
 */
export async function getSchemaDocumentation(req: Request, res: Response) {
  const { name } = req.params;
  
  try {
    const schema = schemaValidation.loadSchema(name);
    
    // Generate human-readable documentation from the schema
    const documentation = {
      title: schema.title || name,
      description: schema.description || 'No description provided',
      properties: generatePropertyDocs(schema.properties, schema.required || []),
      examples: schema.examples || []
    };
    
    res.json(documentation);
  } catch (error: any) {
    console.error(`Error getting schema documentation for ${name}:`, error);
    res.status(404).json({ error: `Schema '${name}' not found or invalid: ${error?.message || 'Unknown error'}` });
  }
}

/**
 * Helper function to get schema description
 */
function getSchemaDescription(schemaName: string): string {
  try {
    const schema = schemaValidation.loadSchema(schemaName);
    return schema.description || `Schema for ${schemaName}`;
  } catch (error: any) {
    console.error(`Error getting schema description for ${schemaName}:`, error?.message || 'Unknown error');
    return `Schema for ${schemaName}`;
  }
}

/**
 * Helper function to generate property documentation
 */
function generatePropertyDocs(properties: any, required: string[]): any {
  if (!properties) return {};
  
  const result: any = {};
  
  for (const [key, prop] of Object.entries<any>(properties)) {
    result[key] = {
      type: prop.type,
      description: prop.description || 'No description provided',
      required: required.includes(key),
      default: prop.default !== undefined ? prop.default : undefined
    };
    
    if (prop.enum) {
      result[key].enum = prop.enum;
    }
    
    if (prop.format) {
      result[key].format = prop.format;
    }
    
    if (prop.properties) {
      result[key].properties = generatePropertyDocs(
        prop.properties, 
        prop.required || []
      );
    }
    
    if (prop.items && prop.items.properties) {
      result[key].items = {
        properties: generatePropertyDocs(
          prop.items.properties,
          prop.items.required || []
        )
      };
    }
  }
  
  return result;
}