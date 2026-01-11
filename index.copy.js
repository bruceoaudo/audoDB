const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const http = require("http");
const socketIO = require("socket.io");
const { Interpreter } = require("./interpreter");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 3000;

// Initialize the interpreter
const interpreter = new Interpreter();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Serve Socket.io client library
app.use(
  "/socket.io",
  express.static(path.join(__dirname, "node_modules/socket.io/client-dist"))
);

// Serves index.html automatically
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Catch-all route for handling 404 errors
app.use((req, res) => {
  res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 Not Found</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                h1 { color: #ff4444; }
            </style>
        </head>
        <body>
            <h1>404 - Page Not Found</h1>
            <p>The page you requested doesn't exist.</p>
            <a href="/">Go to homepage</a>
        </body>
        </html>
    `);
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`New user connected: ${socket.id}`);

  // Send welcome message to database user
  socket.emit("welcome", {
    message:
      "Welcome to audoDB!\nType SQL commands or .help for assistance.\n",
    id: socket.id,
    timestamp: new Date().toISOString(),
  });

  // Receive command from frontend
  socket.on("command", (data) => {
    console.log(`Command from ${socket.id}: ${data.command}`);

    try {
      const result = interpreter.execute(data.command);

      // Send result back to client
      socket.emit("command_result", {
        success: true,
        result: result,
        command: data.command,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Error executing command: ${error.message}`);

      socket.emit("command_error", {
        success: false,
        error: error.message,
        command: data.command,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Notify the disconnected user (if they reconnect)
    io.emit("user_disconnected", {
      id: socket.id,
      message: `Disconnected!\nRefresh page to login again...`,
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`audoDB ready for commands`);
});
