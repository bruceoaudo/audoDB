const { Interpreter } = require("./interpreter");
const express = require("express");
const path = require("path");
const socketIO = require("socket.io");

/**
 * @class AudoDB
 * @description The primary entry point for the AudoDB ecosystem. It provides both a
 * programmatic API for backend integration and an automated Admin UI via Socket.io
 * and Express.
 */
class AudoDB {
  /**
   * @constructor
   * @description Initializes the core database interpreter instance.
   */
  constructor() {
    this.interpreter = new Interpreter();
  }

  /**
   * Programmatic API:
   * Allows developers to run SQL directly in their backend code.
   * * @method execute
   * @param {string} sql - The SQL query string to execute.
   * @returns {any} The processed result from the database engine.
   */
  execute(sql) {
    // You can add internal logging here if you want to track API calls
    return this.interpreter.execute(sql);
  }

  /**
   * Admin UI Plugin:
   * Attaches the Socket.io listeners and serves the REPL frontend.
   * * @method attachAdminUI
   * @description Configures Socket.io for real-time communication, sets up
   * static middleware for the admin dashboard, and handles REPL commands.
   * @param {express.Application} app - An Express application instance.
   * @param {http.Server} server - The HTTP server instance to attach Socket.io to.
   */
  attachAdminUI(app, server) {
    const io = socketIO(server);

    // Check if server is already listening, otherwise wait for it
    /** @private */
    const logUrl = () => {
      const addr = server.address();
      const port = addr
        ? typeof addr === "string"
          ? addr
          : addr.port
        : "3000";
      console.log("─────────────────────────────────────────");
      console.log(`🚀 audoDB Admin UI: http://localhost:${port}/audodb-admin`);
      console.log("─────────────────────────────────────────");
    };

    if (server.listening) {
      logUrl();
    } else {
      server.once("listening", logUrl);
    }

    // Serve the REPL static files
    // Note: We use /audodb-admin so it doesn't conflict with the developer's home page
    app.use("/audodb-admin", express.static(path.join(__dirname, "public")));

    io.on("connection", (socket) => {
      //console.log(`Admin connected: ${socket.id}`);

      socket.emit("welcome", {
        message: "Welcome to audoDB Admin!\nDirect engine access enabled.\n",
        id: socket.id,
        timestamp: new Date().toISOString(),
      });

      socket.on("command", (data) => {
        try {
          // Uses the SAME interpreter instance as the programmatic API
          const result = this.interpreter.execute(data.command);
          socket.emit("command_result", {
            success: true,
            result: result,
            command: data.command,
          });
        } catch (error) {
          socket.emit("command_error", {
            success: false,
            error: error.message,
            command: data.command,
          });
        }
      });

      socket.on("disconnect", () => {
        console.log("Admin disconnected");
      });
    });
  }
}

module.exports = AudoDB;
