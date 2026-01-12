# AudoDB Lexical Analyzer (Lexer)

## 1. Overview

The Lexer is the first stage of the AudoDB query pipeline. Its job is to perform **Lexical Analysis:** taking a raw string of SQL (e.g., ```SELECT * FROM users```) and breaking it down into a stream of meaningful units called Tokens.

Without the Lexer, the database would see a query as just a sequence of characters; with it, the database identifies "Keywords," "Operators," and "Identifiers."

## 2. Why a Custom Lexer?

I chose to write a manual Lexer using the **Scanner Pattern** (iterating through characters one by one) rather than using **Regular Expressions (RegEx)** for several reasons:
1. **Granular Control:** SQL has unique edge cases, such as distinguishing between a . used in a decimal number versus a . used to separate a table and a column (users.id). A manual scanner allows for precise "lookahead" logic.
2. **Context Sensitivity:** Dot commands (like .exit) only occur at the start of a line. A manual Lexer makes it easy to check the current position before deciding if a . is a command or a separator.
3. **Error Reporting:** Because the Lexer tracks line and column numbers for every token, AudoDB can tell the developer exactly where a syntax error occurred (e.g., "Illegal character at Line 1, Col 15").

## 3. How it Works

The Lexer operates as a state machine:
- **Read:** It reads the current character (ch) and peeks at the next one.
- **Identify:** If it sees a letter, it reads until the end of the word and checks if it's a Keyword (like SELECT) or an Identifier (like users). If it sees a digit, it bundles it into an Integer token. If it sees a symbol (like * or ;), it maps it to an Operator token.
- **Emit:** It returns a Token object containing the type, the literal value, and the location.

## 4. Pros and Cons

#### Pros

- **Blazing Fast:** Character-by-character scanning is highly efficient in Node.js, as it avoids the heavy backtracking overhead of complex RegEx patterns.
- **Extensible:** Adding a new SQL feature (like JSON support or new operators) is as simple as adding a entry to the TokenType object and a case statement to the nextToken() switch.
- **Predictable:** Since it follows a strict state machine logic, the behavior is consistent and easy to debug using the tokenize() method.

#### Cons

- **Verbosity:** Writing a manual Lexer requires more lines of code than a "Lexer Generator" tool.
- **Manual Maintenance:** Every new symbol or multi-character operator (like !=) must be manually added to the character-matching logic.

## 5. Lexer Features

1. **Keyword Mapping:** Automatically recognizes standard SQL keywords while ignoring case (e.g., select vs SELECT).
2. **Dot Command Support:** Specifically handles administrative commands like .exit and .clear for the REPL.
3. **String Handling:** Correctly handles text enclosed in single (') or double (") quotes, essential for INSERT and UPDATE operations.
4. **Whitespace Ignorance:** Intelligently skips spaces, tabs, and newlines so the user can format their SQL however they like.

## 6. Future Improvements

- **Multi-character Operators:** Adding support for operators like >= (Greater than or equal) or <> (Not equal).
- **Comments Support:** Implementing logic to skip over -- (single line) or /* */ (multi-line) comments so developers can document their SQL scripts.
- **Floating Point Logic:** Enhancing the readNumber() method to support decimals (e.g., 3.14).
- **Unicode Support:** Ensuring identifiers can support non-ASCII characters for internationalization.

## Integration in the Pipeline

The Lexer serves as the "Iterator" for the Parser. Instead of the Parser looking at the whole string, it simply asks the Lexer: "Give me the next token." This separation of concerns is what allows AudoDB to remain modular and easy to maintain.