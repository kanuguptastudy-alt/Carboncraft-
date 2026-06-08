/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { apiRouter } from "./api/index";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount the shared API endpoints (health, insights, chat)
  app.use(apiRouter);

  // === VITE / STATIC MIDDLEWARE ===
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched successfully at http://0.0.0.0:${PORT}`);
  });
}

startServer();
