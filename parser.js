const { TokenType, Token } = require("./lexer");

/**
 * @class Parser
 * @description Translates a flat list of tokens from the Lexer into an
 * Abstract Syntax Tree (AST). It implements a Recursive Descent parsing strategy
 * to enforce SQL grammar rules.
 */
class Parser {
  /**
   * @constructor
   * @param {Lexer} lexer - The lexer instance to retrieve tokens from.
   */
  constructor(lexer) {
    this.lexer = lexer;
    this.tokens = [];
    this.currentTokenIndex = 0;
    this.currentToken = null;
  }

  /**
   * @method parse
   * @description The main entry point for parsing. Tokenizes the input and
   * initiates the statement parsing logic.
   * @param {string} input - The raw SQL input string.
   * @returns {Object} The resulting AST node.
   */
  parse(input) {
    this.tokens = this.lexer.tokenize(input);
    console.log(this.tokens);
    this.currentTokenIndex = 0;
    this.currentToken = this.tokens[0];
    return this.parseStatement();
  }

  /**
   * @method parseIdentifier
   * @description Helper to handle both "column" and "table.column" (fully qualified) identifiers.
   * @returns {string} The normalized identifier name.
   */
  parseIdentifier() {
    let name = this.expect(TokenType.IDENTIFIER).literal;

    // If the next token is a PERIOD (.), we have a table.column situation
    if (this.currentToken.type === TokenType.PERIOD) {
      this.nextToken(); // consume '.'
      const columnName = this.expect(TokenType.IDENTIFIER).literal;
      name = `${name}.${columnName}`;
    }
    return name;
  }

  /**
   * @method nextToken
   * @description Advances the internal pointer to the next token in the stream.
   */
  nextToken() {
    this.currentTokenIndex++;
    if (this.currentTokenIndex < this.tokens.length) {
      this.currentToken = this.tokens[this.currentTokenIndex];
    } else {
      this.currentToken = new Token(TokenType.EOF, "", 0, 0);
    }
  }

  /**
   * @method expect
   * @description Asserts that the current token is of a specific type.
   * If true, consumes it and returns it; otherwise, throws a syntax error.
   * @param {TokenType} tokenType - The expected type.
   * @returns {Token} The consumed token.
   * @throws {Error} Syntax error if type mismatch occurs.
   */
  expect(tokenType) {
    if (this.currentToken.type === tokenType) {
      const token = this.currentToken;
      this.nextToken();
      return token;
    }
    throw new Error(`Expected ${tokenType}, got ${this.currentToken.type}`);
  }

  /**
   * @method parseStatement
   * @description Determines the type of SQL statement to parse based on the current lookahead token.
   * @returns {Object} AST statement node.
   */
  parseStatement() {
    if (this.currentToken.type === TokenType.SELECT) {
      return this.parseSelectStatement();
    } else if (this.currentToken.type === TokenType.INSERT) {
      return this.parseInsertStatement();
    } else if (this.currentToken.type === TokenType.UPDATE) {
      return this.parseUpdateStatement();
    } else if (this.currentToken.type === TokenType.DELETE) {
      return this.parseDeleteStatement();
    } else if (this.currentToken.type === TokenType.CREATE) {
      return this.parseCreateStatement();
    } else if (this.currentToken.type === TokenType.USE) {
      return this.parseUseStatement();
    } else if (this.currentToken.type === TokenType.SHOW) {
      return this.parseShowStatement();
    } else if (this.currentToken.type.startsWith("DOT_")) {
      return this.parseDotCommand();
    } else if (this.currentToken.type === TokenType.EOF) {
      throw new Error("Empty statement");
    } else {
      throw new Error(`Unknown statement type: ${this.currentToken.type}`);
    }
  }

  /**
   * @method parseSelectStatement
   * @description Parses SELECT queries, including column lists, JOINs, and WHERE clauses.
   * @returns {Object} AST node for SelectStatement.
   */
  parseSelectStatement() {
    this.expect(TokenType.SELECT);
    const columns = this.parseColumnList();
    this.expect(TokenType.FROM);
    const table = this.expect(TokenType.IDENTIFIER).literal;

    let joinClause = null;
    if (this.currentToken.type === TokenType.JOIN) {
      this.nextToken(); // Consume JOIN
      const joinTable = this.expect(TokenType.IDENTIFIER).literal;
      this.expect(TokenType.ON);

      // Use parseIdentifier() instead of expect(IDENTIFIER)
      const leftCol = this.parseIdentifier();
      this.expect(TokenType.ASSIGN);
      const rightCol = this.parseIdentifier();

      joinClause = { table: joinTable, leftCol, rightCol };
    }

    let whereClause = null;
    if (this.currentToken.type === TokenType.WHERE) {
      whereClause = this.parseWhereClause();
    }

    this.expect(TokenType.SEMICOLON);

    return {
      type: "SelectStatement",
      columns,
      table,
      join: joinClause,
      where: whereClause,
    };
  }

  /**
   * @method parseColumnList
   * @description Parses a comma-separated list of columns or the asterisk (*) wildcard.
   * @returns {string[]} List of column names.
   */
  parseColumnList() {
    const columns = [];
    if (this.currentToken.type === TokenType.ASTERISK) {
      columns.push("*");
      this.nextToken();
    } else {
      // Use parseIdentifier()
      columns.push(this.parseIdentifier());

      while (this.currentToken.type === TokenType.COMMA) {
        this.nextToken();
        // Use parseIdentifier()
        columns.push(this.parseIdentifier());
      }
    }
    return columns;
  }

  /**
   * @method parseWhereClause
   * @description Parses WHERE conditions, supporting '=', '>', and '<' operators.
   * @returns {Object} AST node for WhereClause.
   */
  parseWhereClause() {
    this.expect(TokenType.WHERE);

    // Use parseIdentifier() instead of expect(IDENTIFIER)
    // This allows "WHERE users.id = 1"
    const left = this.parseIdentifier();

    const operator = this.currentToken;

    if (
      ![TokenType.ASSIGN, TokenType.LESS_THAN, TokenType.GREATER_THAN].includes(
        operator.type
      )
    ) {
      throw new Error(`Invalid operator in WHERE clause: ${operator.type}`);
    }

    this.nextToken();

    let right;
    // Also allow the right side to be a table column (for cross-table filters)
    if (this.currentToken.type === TokenType.INTEGER) {
      right = parseInt(this.currentToken.literal);
      this.nextToken();
    } else if (this.currentToken.type === TokenType.STRING) {
      right = this.currentToken.literal;
      this.nextToken();
    } else if (this.currentToken.type === TokenType.IDENTIFIER) {
      // If the right side is an identifier, it could also have a dot!
      right = this.parseIdentifier();
    } else {
      throw new Error(
        `Invalid value in WHERE clause: ${this.currentToken.type}`
      );
    }

    return {
      type: "WhereClause",
      left,
      operator: operator.literal,
      right,
    };
  }

  /**
   * @method parseInsertStatement
   * @description Parses INSERT INTO table VALUES (...) syntax.
   * @returns {Object} AST node for InsertStatement.
   */
  parseInsertStatement() {
    this.expect(TokenType.INSERT);
    this.expect(TokenType.INTO);
    const table = this.expect(TokenType.IDENTIFIER).literal;
    this.expect(TokenType.VALUES);

    const values = this.parseValueList();
    this.expect(TokenType.SEMICOLON);

    return {
      type: "InsertStatement",
      table,
      values,
    };
  }

  /**
   * @method parseValueList
   * @description Parses a parenthesized, comma-separated list of literals for INSERT.
   * @returns {any[]} List of parsed values.
   */
  parseValueList() {
    this.expect(TokenType.LEFT_PAREN);
    const values = [];

    values.push(this.parseValue());

    while (this.currentToken.type === TokenType.COMMA) {
      this.nextToken();
      values.push(this.parseValue());
    }

    this.expect(TokenType.RIGHT_PAREN);
    return values;
  }

  /**
   * @method parseValue
   * @description Parses a single literal value (Integer, String, Boolean, or Null).
   * @returns {any} The literal value.
   */
  parseValue() {
    let value;
    if (this.currentToken.type === TokenType.INTEGER) {
      value = parseInt(this.currentToken.literal);
      this.nextToken();
    } else if (this.currentToken.type === TokenType.STRING) {
      value = this.currentToken.literal;
      this.nextToken();
    } else if (this.currentToken.type === TokenType.TRUE) {
      value = true;
      this.nextToken();
    } else if (this.currentToken.type === TokenType.FALSE) {
      value = false;
      this.nextToken();
    } else if (this.currentToken.type === TokenType.NULL) {
      value = null;
      this.nextToken();
    } else {
      throw new Error(`Invalid value: ${this.currentToken.type}`);
    }

    return value;
  }

  /**
   * @method parseCreateStatement
   * @description Dispatches parsing to specific CREATE logic (DATABASE, TABLE, or INDEX).
   * @returns {Object} AST node for the specific CREATE operation.
   */
  parseCreateStatement() {
    this.expect(TokenType.CREATE);

    if (this.currentToken.type === TokenType.DATABASE) {
      return this.parseCreateDatabase();
    } else if (this.currentToken.type === TokenType.TABLE) {
      return this.parseCreateTable();
    } else if (this.currentToken.type === TokenType.INDEX) {
      this.nextToken();
      const tableName = this.expect(TokenType.IDENTIFIER).literal;
      this.expect(TokenType.LEFT_PAREN);
      const columnName = this.expect(TokenType.IDENTIFIER).literal;
      this.expect(TokenType.RIGHT_PAREN);
      this.expect(TokenType.SEMICOLON);
      return { type: "CreateIndexStatement", tableName, columnName };
    } else {
      throw new Error(`Unknown CREATE statement: ${this.currentToken.type}`);
    }
  }

  /**
   * @method parseCreateDatabase
   * @returns {Object} AST node for CreateDatabaseStatement.
   */
  parseCreateDatabase() {
    this.expect(TokenType.DATABASE);
    const name = this.expect(TokenType.IDENTIFIER).literal;
    this.expect(TokenType.SEMICOLON);

    return {
      type: "CreateDatabaseStatement",
      name,
    };
  }

  /**
   * @method parseCreateTable
   * @description Parses table creation syntax including column types and key constraints.
   * @returns {Object} AST node for CreateTableStatement.
   */
  parseCreateTable() {
    this.expect(TokenType.TABLE);
    const tableName = this.expect(TokenType.IDENTIFIER).literal;

    this.expect(TokenType.LEFT_PAREN);
    const columns = [];
    const constraints = { primaryKey: null, foreignKeys: [] };

    while (this.currentToken.type !== TokenType.RIGHT_PAREN) {
      // Check for Table Constraints (PRIMARY KEY / FOREIGN KEY)
      if (this.currentToken.type === TokenType.PRIMARY) {
        this.nextToken();
        this.expect(TokenType.KEY);
        this.expect(TokenType.LEFT_PAREN);
        constraints.primaryKey = this.expect(TokenType.IDENTIFIER).literal;
        this.expect(TokenType.RIGHT_PAREN);
      } else if (this.currentToken.type === TokenType.FOREIGN) {
        this.nextToken();
        this.expect(TokenType.KEY);
        this.expect(TokenType.LEFT_PAREN);
        const col = this.expect(TokenType.IDENTIFIER).literal;
        this.expect(TokenType.RIGHT_PAREN);
        this.expect(TokenType.REFERENCES);
        const refTable = this.expect(TokenType.IDENTIFIER).literal;
        this.expect(TokenType.LEFT_PAREN);
        const refCol = this.expect(TokenType.IDENTIFIER).literal;
        this.expect(TokenType.RIGHT_PAREN);
        constraints.foreignKeys.push({ column: col, refTable, refCol });
      } else {
        // Parse standard Column Definition: name type
        const colName = this.expect(TokenType.IDENTIFIER).literal;
        const colType = this.currentToken.type; // e.g., INT, TEXT
        this.nextToken();
        columns.push({ name: colName, type: colType });
      }

      if (this.currentToken.type === TokenType.COMMA) {
        this.nextToken();
      } else {
        break;
      }
    }

    this.expect(TokenType.RIGHT_PAREN);
    this.expect(TokenType.SEMICOLON);

    return {
      type: "CreateTableStatement",
      name: tableName,
      columns,
      constraints,
    };
  }

  /**
   * @method parseUseStatement
   * @returns {Object} AST node for UseStatement.
   */
  parseUseStatement() {
    this.expect(TokenType.USE);
    const database = this.expect(TokenType.IDENTIFIER).literal;
    this.expect(TokenType.SEMICOLON);

    return {
      type: "UseStatement",
      database,
    };
  }

  /**
   * @method parseShowStatement
   * @description Parses SHOW DATABASES or SHOW TABLES commands.
   * @returns {Object} AST node for Show statements.
   */
  parseShowStatement() {
    this.expect(TokenType.SHOW);

    if (this.currentToken.type === TokenType.DATABASES) {
      this.nextToken();
      this.expect(TokenType.SEMICOLON);
      return { type: "ShowDatabasesStatement" };
    } else if (this.currentToken.type === TokenType.TABLES) {
      this.nextToken();
      this.expect(TokenType.SEMICOLON);
      return { type: "ShowTablesStatement" };
    } else {
      throw new Error(`Unknown SHOW statement: ${this.currentToken.type}`);
    }
  }

  /**
   * @method parseUpdateStatement
   * @description Parses UPDATE table SET col = val ... WHERE ... syntax.
   * @returns {Object} AST node for UpdateStatement.
   */
  parseUpdateStatement() {
    this.expect(TokenType.UPDATE);
    const table = this.expect(TokenType.IDENTIFIER).literal;
    this.expect(TokenType.SET);

    const updates = this.parseUpdates();

    let whereClause = null;
    if (this.currentToken.type === TokenType.WHERE) {
      whereClause = this.parseWhereClause();
    }

    this.expect(TokenType.SEMICOLON);

    return {
      type: "UpdateStatement",
      table,
      updates,
      where: whereClause,
    };
  }

  /**
   * @method parseUpdates
   * @description Helper to parse the SET portion of an UPDATE statement.
   * @returns {Object} Mapping of column names to new values.
   */
  parseUpdates() {
    const updates = {};

    // Parse first update
    const column = this.expect(TokenType.IDENTIFIER).literal;
    this.expect(TokenType.ASSIGN);
    updates[column] = this.parseValue();

    // Parse additional updates if any
    while (this.currentToken.type === TokenType.COMMA) {
      this.nextToken();
      const col = this.expect(TokenType.IDENTIFIER).literal;
      this.expect(TokenType.ASSIGN);
      updates[col] = this.parseValue();
    }

    return updates;
  }

  /**
   * @method parseDeleteStatement
   * @description Parses DELETE FROM table WHERE ... syntax.
   * @returns {Object} AST node for DeleteStatement.
   */
  parseDeleteStatement() {
    this.expect(TokenType.DELETE);
    this.expect(TokenType.FROM);
    const table = this.expect(TokenType.IDENTIFIER).literal;

    let whereClause = null;
    if (this.currentToken.type === TokenType.WHERE) {
      whereClause = this.parseWhereClause();
    }

    this.expect(TokenType.SEMICOLON);

    return {
      type: "DeleteStatement",
      table,
      where: whereClause,
    };
  }

  /**
   * @method parseDotCommand
   * @description Parses REPL meta-commands like .exit or .clear.
   * @returns {Object} AST node for DotCommand.
   */
  parseDotCommand() {
    const command = this.currentToken.literal;
    this.nextToken();

    // Don't expect semicolon for dot commands
    return {
      type: "DotCommand",
      command,
    };
  }
}

module.exports = { Parser };
