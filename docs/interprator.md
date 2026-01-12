# AudoDB Interpreter (The Execution Engine)

## 1. Overview

The Interpreter is the high-level coordinator of the AudoDB pipeline. It acts as the bridge between the user's input and the physical database operations. Its primary responsibility is to manage the lifecycle of a query: initiating the Lexer, receiving the AST from the Parser, and finally instructing the Database engine on what action to take.

## 2. Why the Interpreter Pattern?

I chose an Interpreter Pattern to encapsulate the execution logic for several reasons:

- **Single Point of Entry:** Whether a query comes from the Web Dashboard, the REPL, or a developer’s backend code, it always passes through ```Interpreter.execute()```.
- **State Management:** The Interpreter maintains the instance of the Database class, ensuring that the "current database" context is preserved across multiple queries.
- **Error Orchestration:** It provides a central try-catch block that captures errors from the Lexer, Parser, or Database and translates them into human-readable strings for the UI.

## 3. How it Works (The Execution Cycle)

The Interpreter follows a three-step cycle for every query:
- **Preparation:** It instantiates a fresh Lexer and Parser for the input string to ensure no state leakage between different queries.
- **Transformation:** It triggers ```parser.parse(input)```, which turns the string into an Abstract Syntax Tree (AST).
- **Dispatching (executeAST):** It reads the ast.type (e.g., ```SelectStatement```) and routes the data to the corresponding method in the Database class.

## 4. Pros and Cons

#### Pros

- **Modular Logic:** Because the Interpreter only "dispatches" commands, the code is very clean. It doesn't need to know how a join works; it just needs to know to pass the join parameters to the Database.
- **Support for System Commands:** It handles "Meta" commands (Dot Commands) like .exit or .clear which aren't standard SQL but are vital for the REPL experience.
- **High Extensibility:** To add a new SQL feature, you simply add a new case to the ```executeAST``` switch.

#### Cons

- **Synchronous Flow:** Currently, the execution is synchronous. For extremely heavy queries, the Interpreter will block the Node.js event loop until the Database finishes the task.
- **Instance Coupling:** The Interpreter is tightly coupled with the Database class, meaning they generally exist in a 1:1 relationship.

## 5. Interpreter Features

#### The AST Dispatcher

The ```executeAST()``` method acts as a router. It unpacks the complex objects created by the Parser and flattens them into method arguments that the Database layer understands.

#### Meta-Command Handling

The Interpreter specifically watches for DotCommand types. This allows AudoDB to perform system-level actions (like ```process.exit(0)```) that are outside the scope of the SQL language itself.

#### Global Error Handling

The Interpreter ensures the application never crashes due to a bad query. By returning an "Error: ..." string, it allows the frontend to display red error text in the terminal while keeping the server running.

## 6. Future Improvements

- **Async Execution:** Refactoring ```execute()``` to be an async function to allow for non-blocking I/O during heavy file operations.
- **Query Statistics:** Adding a timer to the Interpreter to measure and return "Query Execution Time" to the user.
- **Pre-processors:** Implementing a step that can expand "star" queries (```SELECT *```) into a list of specific columns before they reach the Database.
- **Security Middleware:** Adding a validation layer that can "sanitize" or block certain commands based on user permissions.

## The Final Bridge

The Interpreter is the final piece of the core engine. Once it finishes its job, the data is either safely tucked away in engine_data.json or returned to the user as a beautifully formatted table in their browser.