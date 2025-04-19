import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

/**
 * Middleware to validate request body against a provided schema
 * @param schema Zod schema to validate against
 */
export const validateBody = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate request query against a provided schema
 * @param schema Zod schema to validate against
 */
export const validateQuery = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Query validation error",
          errors: error.errors
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate request params against a provided schema
 * @param schema Zod schema to validate against
 */
export const validateParams = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Path parameter validation error",
          errors: error.errors
        });
      }
      next(error);
    }
  };
};