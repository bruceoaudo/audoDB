/**
 * @file main.js
 * @description The main server application. Configures Express, establishes REST endpoints
 * for the AudoDB engine, and initializes the database schema with seed data.
 */

const express = require("express");
const http = require("http");
const AudoDB = require("audodb");
const dotenv = require("dotenv");
const path = require("node:path");
dotenv.config();

const app = express();
// This allows the app to parse JSON sent in request bodies
app.use(express.json());

// Add this to main.js
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
/**
 * @constant db
 * @description Instance of the AudoDB engine used across all API routes.
 */
const db = new AudoDB();

// Serves index.html automatically
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Attach the Admin UI for debugging
/**
 * @description Activates the real-time Socket.io Admin REPL at /audodb-admin.
 */
db.attachAdminUI(app, server);

// ==========================================
// INDEXING & JOINS ENDPOINTS
// ==========================================

/**
 * 1. CREATE INDEX
 * @route POST /api/index/:table/:column
 * @description Speed up lookups on a specific column by creating a B-Tree or Hash index.
 */
app.post("/api/index/:table/:column", (req, res) => {
  const { table, column } = req.params;
  try {
    const result = db.execute(`CREATE INDEX ON ${table} (${column});`);
    res.json({ success: true, message: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * 2. JOIN: Users and Orders
 * @route GET /api/reports/user-orders
 * @description Combines data where users.id = orders.user_id using a standard SQL JOIN.
 */
app.get("/api/reports/user-orders", (req, res) => {
  try {
    db.execute("USE audo;"); // Ensure database is selected
    const result = db.execute(
      "SELECT name, product, price FROM users JOIN orders ON users.id = orders.user_id;"
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. CREATE ORDER
 * @route POST /api/orders
 * @description Simple endpoint to populate the second table for the join.
 */
app.post("/api/orders", (req, res) => {
  const { id, user_id, product, price } = req.body;
  try {
    db.execute(
      `INSERT INTO orders VALUES (${id}, ${user_id}, '${product}', ${price});`
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route GET /api/orders
 * @description Retrieves all records from the orders table.
 */
app.get("/api/orders", (req, res) => {
  try {
    const orders = db.execute("SELECT * FROM orders;");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CRUD ENDPOINTS FOR FRONTEND
// ==========================================

/**
 * @route POST /api/users
 * @description CREATE: Inserts a new user record into the database.
 */
app.post("/api/users", (req, res) => {
  const { id, name, email } = req.body;
  try {
    // Note the single quotes around string values in SQL
    const result = db.execute(
      `INSERT INTO users VALUES (${id}, '${name}', '${email}');`
    );
    res.status(201).json({ success: true, message: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * @route GET /api/users
 * @description READ: Fetches all users stored in the AudoDB instance.
 */
app.get("/api/users", (req, res) => {
  try {
    const users = db.execute("SELECT * FROM users;");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route PUT /api/users/:id
 * @description UPDATE: Modifies existing user details based on ID.
 */
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body; // Extract both name and email
  try {
    // Corrected SQL to update multiple columns
    const result = db.execute(
      `UPDATE users SET name = '${name}', email = '${email}' WHERE id = ${id};`
    );
    res.json({ success: true, message: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * @route DELETE /api/users/:id
 * @description DELETE: Removes a user from the table.
 */
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  try {
    const result = db.execute(`DELETE FROM users WHERE id = ${id};`);
    res.json({ success: true, message: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// INITIALIZATION - Run this once to setup table
// ==========================================
/**
 * @function initSchema
 * @description Checks for the existence of required databases and tables.
 * Creates them and inserts seed data if they are missing.
 */
const initSchema = () => {
  try {
    db.execute("CREATE DATABASE audo;");
    db.execute("USE audo;");

    // Check if the result is actually an error string
    const checkTable = db.execute("SELECT * FROM users;");

    if (typeof checkTable === "string" && checkTable.startsWith("Error")) {
      console.log("Users table missing, creating now...");
      db.execute("CREATE TABLE users (id INT, name TEXT, email TEXT);");
    }

    // Now check length safely
    const users = db.execute("SELECT * FROM users;");
    if (Array.isArray(users) && users.length === 0) {
      db.execute(
        "INSERT INTO users VALUES (1, 'Bruce Audo', 'audo401@gmail.com');"
      );
      console.log("Seed data inserted.");
    }

    // Repeat for orders...
    const checkOrders = db.execute("SELECT * FROM orders;");
    if (typeof checkOrders === "string" && checkOrders.startsWith("Error")) {
      db.execute(
        "CREATE TABLE orders (id INT, user_id INT, product TEXT, price INT);"
      );
    }
  } catch (err) {
    console.error("Initialization failed:", err.message);
  }
};

initSchema();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Web App running at http://localhost:${PORT}`);
});
