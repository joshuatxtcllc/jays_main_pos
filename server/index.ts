import express, { type Request, Response, NextFunction } from "express";
import DiscordBot from './services/discordBot.js';
import UnifiedNotificationService from './services/unifiedNotificationService.js';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from "cors";

// ES module compatibility - add __dirname and __filename polyfills
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Discord bot and unified notification service
const discordBot = new DiscordBot();
const notificationService = new UnifiedNotificationService(discordBot);
discordBot.start();

// Make notification service available to routes
app.locals.notificationService = notificationService;

// CORS setup for API requests
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true
}));

// JSON parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });

    // Log the error instead of re-throwing it
    log(`Error: ${message} (${status})`, "error");
    console.error(err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT from environment or fallback to port 5000
  let port = parseInt(process.env.PORT || '5000', 10);

  // Function to start server with deployment-ready configuration
  const startServer = () => {
    try {
      // Use environment PORT or default for Cloud Run compatibility
      const finalPort = parseInt(process.env.PORT || '8080', 10);
      
      const serverInstance = server.listen(finalPort, "0.0.0.0", () => {
        log(`serving on port ${finalPort}`);
        console.log(`Server running on port ${finalPort}`);
      });

      serverInstance.on('error', (error: any) => {
        log(`Server startup error: ${error.message}`, "error");
        console.error('Server error:', error);
        
        // Exit gracefully on startup errors for deployment
        setTimeout(() => {
          process.exit(1);
        }, 1000);
      });

      // Graceful shutdown handlers
      const gracefulShutdown = (signal: string) => {
        log(`${signal} received, shutting down gracefully`, "info");
        serverInstance.close(() => {
          log("Server closed", "info");
          process.exit(0);
        });
      };

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));

      return serverInstance;
    } catch (error) {
      log(`Critical server startup failure: ${error}`, "error");
      console.error('Critical error:', error);
      process.exit(1);
    }
  };

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (error) {
    log(`Warning: Could not create uploads directory: ${error}`, "warning");
  }

  // Static file serving for uploads
  app.use('/uploads', express.static(uploadsDir));

  startServer();
})();