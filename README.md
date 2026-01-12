# 🚀 AudoDB: A Lightweight SQL Engine for Node.js

AudoDB is a custom-built, library-first SQL database engine written entirely in JavaScript. It features a full SQL pipeline—from lexical analysis to physical storage—and includes a built-in web-based administrative dashboard and REPL.

# 🏗️ Core Architecture

AudoDB follows a modular pipeline architecture. Each component is designed to be decoupled and extensible. For deep dives into each layer, see the dedicated documentation files:
- Lexer: Tokenizes raw SQL strings into meaningful units.
- Parser: Transforms tokens into an Abstract Syntax Tree (AST).
- Interpreter: Orchestrates the execution of the AST.
- Database: Handles memory management, relational constraints, and JSON persistence.
- REPL: Powering the real-time web terminal via Socket.io.
- Architecture Overview: The big picture of how everything connects.

# 🛠️ Getting Started

Follow these steps to clone the repository and launch the demonstration web app.

#### 1. Prerequisites

Ensure you have Node.js (v14 or higher) installed on your machine.

#### 2. Installation

Clone the repository and install the necessary dependencies (Express and Socket.io):

```bash
# Clone the repository
git clone https://github.com/bruceoaudo/audoDB.git

# Enter the directory
cd audoDB

# Install dependencies
npm install
```

#### 3. Running the Test Web App

The project includes a ```main.js``` file that demonstrates how to use AudoDB as a library within an Express application.

```bash
# Navigate to test_web_app
cd test_web_app

# Start the server
node main.js
```
Once started, you will see a message in your terminal: ```🚀 audoDB Admin UI: http://localhost:3000/audodb-admin```

# 🖥️ Accessing the Interfaces

#### The User Dashboard

Open your browser to ```http://localhost:3000```. This interface uses the AudoDB Programmatic API to perform CRUD operations (Create, Read, Update, Delete) on a ```users``` and ```orders``` table. It demonstrates:
- Real-time updates.
- Relational data joining.
- Interactive modals for data entry.

#### The Admin REPL

Open your browser to ```http://localhost:3000/audodb-admin```. This is the Direct Engine Access terminal. You can type raw SQL here, such as:

```sql
CREATE DATABASE shop;
USE shop;
CREATE TABLE products (id INT, name TEXT, price INT);
INSERT INTO products VALUES (1, 'Mechanical Keyboard', 120);
SELECT * FROM products;
```

# 📦 Using AudoDB as a Library

You can integrate AudoDB into your own projects easily:

```js
const AudoDB = require("./audodb");
const db = new AudoDB();

// Execute SQL programmatically
db.execute("CREATE DATABASE my_app;");
db.execute("USE my_app;");
db.execute("CREATE TABLE tasks (id INT, task TEXT);");

// Attach the Admin UI to your existing Express server
const app = require("express")();
const server = require("http").createServer(app);

db.attachAdminUI(app, server);

server.listen(3000);
```

# 🛡️ Data Persistence

AudoDB automatically creates two files in your root directory:
1. ```engine_data.json```: This is your physical database. It stores all databases, tables, and rows.
2. ```history.log```: A chronological log of every operation performed on the engine for auditing and debugging.

# 📝 Acknowledgments & AI Attribution

This project was developed with the assistance of Gemini (Google AI). AI was utilized as a "thought partner" and technical assistant in the following areas:
- **Debugging & Logic Refinement:** Assisting in identifying edge cases within the Recursive Descent Parser and Lexer state machine.
- **Documentation:** Collaborating on the technical writing for the .md architecture files to ensure clarity and professional standards.
- **Code Documentation (JSDoc):** Assisted in generating comprehensive JSDoc comments throughout the codebase to ensure that the library is easily navigable for other developers.

# 📜 License

This project is open-source and available under the MIT License.

