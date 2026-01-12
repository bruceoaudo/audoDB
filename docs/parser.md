# AudoDB Parser (Syntactic Analysis)

## 1. Overview

The Parser is the second stage of the AudoDB pipeline. It takes the stream of tokens produced by the Lexer and organizes them into an **Abstract Syntax Tree (AST)**. This tree is a structured JSON representation of the user's intent, ensuring the query follows the formal rules of SQL grammar.

## 2. Why a Recursive Descent Parser?

I implemented a **Recursive Descent Parser** because it mimics how humans read SQL. It starts at the highest level (a "Statement") and "descends" into smaller parts (like "Column Lists" or "Where Clauses").

- **Predictability:** Each SQL keyword has its own dedicated method (e.g., ```parseSelectStatement()```, ```parseInsertStatement()```), making the code highly readable and easy to debug.
- **Complex Feature Support:** By using recursion, the parser can easily handle nested structures, such as table-prefixed columns (users.id) and complex ```JOIN``` logic.
- **Strict Validation:** The expect() helper function acts as a gatekeeper. If a user types ```SELECT``` FROM users (missing the columns), the parser immediately catches the missing TokenType and throws a helpful error.

## 3. How it Works

The Parser follows a "Lookahead and Consume" strategy:
- **Statement Identification:** It checks the first token. If it sees ```SELECT```, it switches to "Select Mode."

- **Recursive Parsing:** It calls sub-functions to handle specific parts. For example, ```parseColumnList()``` iterates through tokens until it hits the ```FROM``` keyword.
- **AST Generation:** Instead of executing the query, it outputs a "Plan" (the AST).

**Example input:** ```SELECT name FROM users;```

**AST output:** ```{ type: "SelectStatement", table: "users", columns: ["name"] }```

## 4. Pros and Cons

#### Pros

- **Logical Separation:** The Parser doesn't care how data is stored; it only cares that the query is grammatically correct.
- **Easy Maintenance:** If you want to add a new SQL clause like ```ORDER BY```, you only need to add one method to the class.
- **Table.Column Awareness:** The parseIdentifier() method is specifically designed to handle the . operator, allowing for multi-table queries and clear data mapping.

#### Cons

- **No Optimization:** At this stage, the Parser doesn't check if a table actually exists, it only checks if the syntax is right. (Table existence is checked later by the Interpreter).
- **Linear Execution:** Recursive descent can be slightly slower than table-driven parsers (like Yacc/Bison), though this is negligible for a lightweight engine like AudoDB.

## 5. Parser Features

- **Multi-Statement Support:** Handles ```SELECT```, ```INSERT```, ```UPDATE```, ```DELETE```, ```CREATE```, and ```USE```.
- **Join Logic:** Correctly parses the JOIN table ON col1 = col2 syntax, providing the Interpreter with the necessary mapping for relational reports.
- **Constraint Handling:** In ```CREATE TABLE```, it can identify ```PRIMARY KEY``` and ```FOREIGN KEY``` definitions, setting the stage for relational integrity.
- **Data Type Enforcement:** During ```INSERT``` or ```CREATE```, it recognizes ```INT```, ```TEXT```, and ```BOOLEAN``` types to ensure data consistency.

## 6. Future Improvements

- **Subqueries:** Allowing the ```WHERE``` clause to contain another ```SELECT``` statement (Recursive parsing at its best).
- **Function Support:** Parsing expressions like ```COUNT(*)```, ```SUM(price)```, or ```UPPER(name)```.
- **Complex Logic:** Supporting ```AND``` / ```OR``` operators in the ```WHERE``` clause for more powerful filtering.
- **Alias Support:** Parsing the ```AS``` keyword (e.g., ```SELECT u.name FROM users AS u```).

## Final Piece of the Puzzle: The Interpreter

Once the ```Parser``` generates the AST, it hands it over to the ```Interpreter```. The ```Interpreter``` takes this "Plan" and performs the actual JavaScript operations on the stored JSON data to return the results you see in the Dashboard or REPL.