const { Lexer } = require("./lexer");
const { Parser } = require("./parser");
const { Database } = require("./database");

class Interpreter {
  constructor() {
    this.database = new Database();
  }

  execute(input) {
    try {

      // Create fresh lexer and parser for each input
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);

      const ast = parser.parse(input);
      return this.executeAST(ast);
    } catch (error) {
      console.log({error})
      return `Error: ${error.message}`;
    }
  }

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
