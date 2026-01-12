# AudoDB Database Engine (Storage & Logic)

## 1. Overview

The Database class is the heart of AudoDB. While the Lexer and Parser handle the "speech," the Database engine handles the "memory." It manages the internal state of databases, tables, and rows, and provides the low-level methods for data manipulation and persistence.

## 2. Why This Implementation?

I designed the Database layer to be Memory-First with File-Syncing for the following reasons:
- **Speed:** By using JavaScript Map objects and arrays to store data in-memory, AudoDB provides near-instantaneous query results.
- **Simplicity:** Using a single engine_data.json file for persistence makes the database "portable." You can copy the JSON file to move your entire database to another project.
- **Relational Integrity:** Unlike a simple JSON object store, this engine implements Primary Key (PK) and Foreign Key (FK) validation logic, ensuring that your relational data stays consistent.

## 3. How it Works (The Storage Lifecycle)

- **Initialization:** When AudoDB starts, ```loadFromFile()``` reads the engine_data.json.
- **In-Memory Management:** Databases and Tables are stored as Map structures for $O(1)$ lookup performance.
- **The "Commit" Cycle:** Every time a write operation occurs (```INSERT```, ```UPDATE```, ```DELETE```, ```CREATE```), the engine calls ```saveToFile()```, performing a synchronous write to ensure the disk matches the memory.
- **Logging:** Every action is recorded in history.log with a timestamp, providing a simple audit trail for the developer.

## 4. Key Engine Features

#### Relational Constraints

AudoDB isn't just a flat-file store. It enforces rules:
- **Primary Keys:** Prevents duplicate IDs in a table.
- **Foreign Keys:** Ensures that an order cannot be created for a user_id that doesn't exist.

#### Indexing Support

The engine supports manual indexing via ```createIndex()```. It builds a "Lookup Map" for a specific column, allowing the engine to find data without scanning every single row.

#### Query Execution (Selection)

The ```selectFromTable``` method handles:
- **Joins:** Implements a "Nested Loop Join" to combine two tables into one result set.
- **Filtering:** Applies the WhereClause logic ( =, >, < ).
- **Projection:** Limits the output to only the requested columns (e.g., ```SELECT name``` vs ```SELECT *```).

## 5. Pros and Cons

#### Pros

- **Developer Friendly:** The storage is plain-text JSON. You can debug your data just by opening a text editor.
- **Acid-Lite:** While not fully ACID compliant, the immediate file-syncing ensures high durability for small-to-medium datasets.
- **No External Dependencies:** Uses Node.js native fs and path modules. No need for complex binary drivers.

#### Cons

- **Write Bottleneck:** Because the entire database is rewritten to a JSON file on every update, performance will degrade as the file size grows into the megabytes.
- **Concurrency:** Synchronous file writing can block the Node.js event loop if the dataset is massive.

## 6. Future Improvements

- **Incremental Saves:** Instead of saving the whole database, only append new rows to a log and periodically "compact" the file.
- **Indexing Automation:** Automatically create indices for columns marked as ```PRIMARY KEY```.
- **Data Types:** Adding strict type checking (e.g., preventing a ```string``` from being inserted into an ```INT``` column).
- **Transaction Support:** Implementing a ```.begin()``` and ```.commit()``` flow to allow multiple changes to happen all at once or not at all.

## Connecting the Pieces

The Database engine is the final destination for an Abstract Syntax Tree (AST). Once the Parser confirms a query is valid, the Interpreter calls the methods documented here to make the change permanent.