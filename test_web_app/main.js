const express = require("express");
const http = require("http");
const AudoDB = require("audodb");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
// This allows the app to parse JSON sent in request bodies
app.use(express.json());

const server = http.createServer(app);
const db = new AudoDB();

// Attach the Admin UI for debugging
db.attachAdminUI(app, server);

// ==========================================
// INDEXING & JOINS ENDPOINTS
// ==========================================

/**
 * 1. CREATE INDEX
 * Speed up lookups on a specific column.
 */
app.post("/api/index/:table/:column", (req, res) => {
  const { table, column } = req.params;
  try {
    const result = db.execute(`CREATE INDEX ON ${table} (${column})`);
    res.json({ success: true, message: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * 2. JOIN: Users and Orders
 * Combines data where users.id = orders.user_id
 */
app.get("/api/reports/user-orders", (req, res) => {
  try {
    // Demonstrating a JOIN query
    const result = db.execute(
      "SELECT name, product, price FROM users JOIN orders ON users.id = orders.user_id"
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. CREATE ORDER
 * Simple endpoint to populate the second table for the join
 */
app.post("/api/orders", (req, res) => {
  const { id, user_id, product, price } = req.body;
  try {
    db.execute(
      `INSERT INTO orders VALUES (${id}, ${user_id}, '${product}', ${price})`
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// CRUD ENDPOINTS FOR FRONTEND
// ==========================================

// 1. CREATE: Add a new user
app.post("/api/users", (req, res) => {
  const { id, name, email } = req.body;
  try {
    // Note the single quotes around string values in SQL
    const result = db.execute(
      `INSERT INTO users VALUES (${id}, '${name}', '${email}')`
    );
    res.status(201).json({ success: true, message: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 2. READ: Get all users
app.get("/api/users", (req, res) => {
  try {
    const users = db.execute("SELECT * FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. UPDATE: Change a user's name
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = db.execute(
      `UPDATE users SET name = '${name}' WHERE id = ${id}`
    );
    res.json({ success: true, message: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. DELETE: Remove a user
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  try {
    const result = db.execute(`DELETE FROM users WHERE id = ${id}`);
    res.json({ success: true, message: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// INITIALIZATION - Run this once to setup table
// ==========================================
const initSchema = () => {
  try {
    // Setup Users Table
    try {
      db.execute("SELECT * FROM users");
    } catch {
      db.execute("CREATE TABLE users (id INT, name TEXT, email TEXT)");

      // Seed initial data
      db.execute(
        "INSERT INTO users VALUES (1, 'Admin User', 'admin@audodb.com')"
      );
    }

    // Setup Orders Table
    try {
      db.execute("SELECT * FROM orders");
    } catch {
      db.execute(
        "CREATE TABLE orders (id INT, user_id INT, product TEXT, price INT)"
      );
    }

    console.log("Database schema initialized.");
  } catch (err) {
    console.error("Schema setup error:", err.message);
  }
};

initSchema();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Web App running at http://localhost:${PORT}`);
});
