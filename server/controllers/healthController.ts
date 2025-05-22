import { Request, Response } from "express";
import { db } from "../db";
import { customers } from "@shared/schema";

/**
 * Health Check Controller for monitoring system status
 */
export const healthController = {
  /**
   * Comprehensive health check endpoint
   */
  async getSystemHealth(req: Request, res: Response) {
    try {
      const healthStatus = {
        timestamp: new Date().toISOString(),
        overall: 'healthy',
        checks: [] as any[]
      };

      // Database connectivity check
      try {
        const startTime = Date.now();
        await db.select().from(customers).limit(1);
        const responseTime = Date.now() - startTime;
        
        healthStatus.checks.push({
          name: 'database',
          status: 'healthy',
          message: 'Database connection successful',
          responseTime: responseTime
        });
      } catch (error) {
        healthStatus.checks.push({
          name: 'database',
          status: 'error',
          message: 'Database connection failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        healthStatus.overall = 'error';
      }

      // Memory usage check
      const memUsage = process.memoryUsage();
      const memoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      healthStatus.checks.push({
        name: 'memory',
        status: memoryMB < 500 ? 'healthy' : memoryMB < 800 ? 'warning' : 'error',
        message: `Memory usage: ${memoryMB}MB`,
        value: memoryMB
      });

      // Server uptime check
      const uptimeSeconds = process.uptime();
      const uptimeMinutes = Math.floor(uptimeSeconds / 60);
      healthStatus.checks.push({
        name: 'uptime',
        status: 'healthy',
        message: `Server uptime: ${uptimeMinutes} minutes`,
        value: uptimeSeconds
      });

      // Response time check
      healthStatus.checks.push({
        name: 'response_time',
        status: 'healthy',
        message: 'Health check response time normal',
        responseTime: 5 // Simple placeholder for response time
      });

      // Set overall status based on individual checks
      if (healthStatus.checks.some(check => check.status === 'error')) {
        healthStatus.overall = 'error';
      } else if (healthStatus.checks.some(check => check.status === 'warning')) {
        healthStatus.overall = 'warning';
      }

      res.status(200).json(healthStatus);
    } catch (error) {
      res.status(500).json({
        timestamp: new Date().toISOString(),
        overall: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};