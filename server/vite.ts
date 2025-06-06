import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        // Don't exit the process, just log the error
        console.error(`Vite server error: ${msg}`);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const clientDistPath = path.resolve(__dirname, '..', 'client', 'dist');
  const distPath = path.resolve(__dirname, '..', 'dist');

  let staticPath = '';

  // Check for client build first, then fallback to dist
  if (fs.existsSync(clientDistPath)) {
    staticPath = clientDistPath;
    log(`Serving static files from: ${clientDistPath}`);
  } else if (fs.existsSync(distPath)) {
    staticPath = distPath;
    log(`Serving static files from: ${distPath}`);
  } else {
    log('No static files found. Please build the client application.', 'error');
  }

  if (staticPath) {
    // Serve static files with proper cache headers
    app.use(express.static(staticPath, {
      maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
      etag: true
    }));
  }

  // Catch-all handler for client-side routing
  app.get('*', (req, res, next) => {
    // Skip API routes and uploads
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }

    const indexPath = path.resolve(staticPath, 'index.html');

    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(500).json({ 
        error: 'Client application not built', 
        message: 'Please run "npm run build" to build the client application' 
      });
    }
  });
}