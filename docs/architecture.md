# AudoDB Architecture Documentation

## 1. Overview

AudoDB is a lightweight, custom-built SQL database engine designed for web-based administration. It follows a Pipeline Architecture, where a raw string query is transformed through several stages, from lexical analysis to execution, before interacting with the underlying data store.

## 2. Pipeline Flow

The architecture follows a unidirectional flow from the user input to the final data result.
1. **Frontend (UI):** User enters a SQL command or interacts with the Dashboard.
2. **Transport (Socket/API):** The command is sent to the Node.js backend via Socket.io (for REPL) or Express (for Dashboard).
3. **Lexer (Tokenization):** Breaks the raw string into meaningful "Tokens" (e.g., SELECT, IDENTIFIER, PERIOD).
4. **Parser (Syntactic Analysis):** Organizes tokens into an Abstract Syntax Tree (AST) to verify the query's structure.
5. **Interpreter (Execution):** The logic engine that performs the actual data operations (filtering, joining, inserting) on the JSON data objects.
6. **Database (Storage):** The layer that manages table schemas and persistence.

## 3. Library Design & Developer Accessibility

AudoDB was intentionally designed as an NPM-style library rather than a standalone application. This modular approach was chosen to empower other developers to integrate a SQL engine into their projects with ease.
- **Zero-Config Integration:** By packaging the engine into a class, a developer only needs to run const db = new AudoDB(); to begin executing SQL.
- **Embedded Databases:** Perfect for local tools, CLI applications, or electron apps where spinning up a separate database server is overkill.
- **Abstraction of Complexity:** Developers can use familiar SQL syntax to manage complex JSON data structures without having to write their own filtering or joining logic.
- **Plug-and-Play Admin UI:** The library includes a built-in attachAdminUI method, allowing developers to add a visual management dashboard to their existing Express servers in a single line of code.

## 4. Why This Architecture?

I chose a **Recursive Descent Parsing** architecture combined with a **JSON-based Storage** for the following reasons:
- **Decoupling:** By separating the Lexer from the Parser, we can update SQL syntax rules (like adding the . for table names) without touching the execution logic.
- **Web Native:** Using JSON for storage allows the database to feel "native" to the JavaScript ecosystem, making it easy to pass data directly to the frontend.
- **Real-time Interaction:** The Socket.io layer allows for a live "database console" experience, which is rare in standard SQL implementations.

## 5. Pros and Cons

#### Pros

- **Extensibility:** Adding new SQL keywords (like ORDER BY or LIMIT) only requires small updates to the Lexer and Parser.
- **Human Readable:** The storage is in JSON, meaning you can open the data files and understand them without a specialized viewer.
- **Low Overhead:** No heavy binaries are required; the entire engine runs within the Node.js runtime.

#### Cons

- **Performance:** Because the Interpreter uses high-level JavaScript loops for JOIN operations, it will slow down with very large datasets (O(n²) complexity).
- **Memory Bound:** Currently, the data is loaded into memory. Very large databases might exceed the Node.js heap limit.
- **ACID Compliance:** The engine lacks a "Transaction" layer, meaning if the server crashes during a write, the data file could potentially be corrupted.

## 6. Future Improvements

To take AudoDB to a production-ready level, the following enhancements are planned:
1. **B-Tree Indexing:** Moving beyond simple object lookups to a B-Tree structure for $O(\log n)$ search speeds.
2. **Query Optimizer:** Implementing a layer between the Parser and Interpreter that chooses the most efficient way to execute a JOIN (e.g., Hash Join vs. Nested Loop).
3. **Buffer Pool Manager:** Instead of loading the whole JSON file, only load specific "pages" of data as needed to save memory.
4. **WAL (Write-Ahead Logging):** Implementing a log file to ensure data can be recovered in the event of a system crash.