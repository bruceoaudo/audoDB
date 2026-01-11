const { TokenType, Token } = require("./lexer");

class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.tokens = [];
    this.currentTokenIndex = 0;
    this.currentToken = null;
  }

  parse(input) {
    this.tokens = this.lexer.tokenize(input);
    console.log(this.tokens);
    this.currentTokenIndex = 0;
    this.currentToken = this.tokens[0];
    return this.parseStatement();
  }

  // Helper to handle both "column" and "table.column"
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

  nextToken() {
    this.currentTokenIndex++;
    if (this.currentTokenIndex < this.tokens.length) {
      this.currentToken = this.tokens[this.currentTokenIndex];
    } else {
      this.currentToken = new Token(TokenType.EOF, "", 0, 0);
    }
  }

  expect(tokenType) {
    if (this.currentToken.type === tokenType) {
      const token = this.currentToken;
      this.nextToken();
      return token;
    }
    throw new Error(`Expected ${tokenType}, got ${this.currentToken.type}`);
  }

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

  parseCreateDatabase() {
    this.expect(TokenType.DATABASE);
    const name = this.expect(TokenType.IDENTIFIER).literal;
    this.expect(TokenType.SEMICOLON);

    return {
      type: "CreateDatabaseStatement",
      name,
    };
  }

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

  parseUseStatement() {
    this.expect(TokenType.USE);
    const database = this.expect(TokenType.IDENTIFIER).literal;
    this.expect(TokenType.SEMICOLON);

    return {
      type: "UseStatement",
      database,
    };
  }

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
