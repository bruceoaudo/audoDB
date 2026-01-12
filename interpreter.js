const { Lexer } = require("./lexer");
const { Parser } = require("./parser");
const { Database } = require("./database");

/**
 * @class Interpreter
 * @description The execution engine of the database. It coordinates the translation
 * of raw SQL strings into Abstract Syntax Trees (AST) and routes them to the
 * underlying Database storage logic.
 */
class Interpreter {
  /**
   * @constructor
   * @description Initializes a new instance of the Database engine for this interpreter.
   */
  constructor() {
    this.database = new Database();
  }

  /**
   * @method execute
   * @description Pipeline that converts raw text into a result. Handles the
   * Lexing, Parsing, and Execution phases.
   * @param {string} input - The raw SQL query or dot command string.
   * @returns {any} The result of the query execution or an error message.
   */
  execute(input) {
    try {
      // Create fresh lexer and parser for each input
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);

      const ast = parser.parse(input);
      return this.executeAST(ast);
    } catch (error) {
      console.log({ error });
      return `Error: ${error.message}`;
    }
  }

  /**
   * @method executeAST
   * @description Evaluates the Abstract Syntax Tree (AST) by mapping node types
   * to specific Database class methods.
   * @param {Object} ast - The parsed AST object.
   * @returns {any} Data results, confirmation strings, or error indicators.
   */
  executeAST(ast) {
    switch (ast.type) {
      case "CreateDatabaseStatement":
        return this.database.createDatabase(ast.name);

      case "UseStatement":
        return this.database.useDatabase(ast.database);

      case "ShowDatabasesStatement":
        return this.database.showDatabases();

      case "ShowTablesStatement":
        return this.database.showTables();

      case "CreateTableStatement":
        return this.database.createTable(
          ast.name,
          ast.columns,
          ast.constraints
        );

      case "InsertStatement":
        return this.database.insertIntoTable(ast.table, ast.values);

      case "SelectStatement":
        return this.database.selectFromTable(
          ast.table,
          ast.columns,
          ast.where,
          ast.join // Pass the join object
        );

      case "CreateIndexStatement":
        return this.database.createIndex(ast.tableName, ast.columnName);

      case "UpdateStatement":
        return this.database.updateTable(ast.table, ast.updates, ast.where);

      case "DeleteStatement":
        return this.database.deleteFromTable(ast.table, ast.where);

      case "DotCommand":
        return this.executeDotCommand(ast.command);

      default:
        return `Unknown statement type: ${ast.type}`;
    }
  }

  /**
   * @method executeDotCommand
   * @description Handles administrative meta-commands (dot commands) for the REPL environment.
   * @param {string} command - The command string (e.g., ".exit").
   * @returns {string} Response message or terminal control code.
   */
  executeDotCommand(command) {
    switch (command) {
      case ".exit":
      case ".quit":
        process.exit(0);
        return "Goodbye!";

      case ".clear":
        return "\x1B[2J\x1B[0;0H"; // Clear screen ANSI code

      default:
        return `Unknown command: ${command}`;
    }
  }
}

module.exports = { Interpreter };
