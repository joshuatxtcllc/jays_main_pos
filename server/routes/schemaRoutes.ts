/**
 * Schema API Routes
 * 
 * These routes provide endpoints for working with JSON Schema validation
 * and type generation.
 */

import { Router } from 'express';
import * as schemaController from '../controllers/schemaController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/schemas
 * @desc Get a list of all available schemas
 * @access Public
 */
router.get('/', schemaController.getSchemas);

/**
 * @route GET /api/schemas/:name
 * @desc Get a specific schema by name
 * @access Public
 */
router.get('/:name', schemaController.getSchema);

/**
 * @route POST /api/schemas/:name/validate
 * @desc Validate data against a schema
 * @access Public
 */
router.post('/:name/validate', schemaController.validateData);

/**
 * @route GET /api/schemas/:name/types
 * @desc Generate TypeScript types for a schema
 * @access Public
 */
router.get('/:name/types', schemaController.generateTypes);

/**
 * @route GET /api/schemas/:name/docs
 * @desc Get schema documentation
 * @access Public
 */
router.get('/:name/docs', schemaController.getSchemaDocumentation);

export default router;