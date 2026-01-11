// Since JavaScript doesn't have enums, we'll use an Object.freeze() pattern
const TokenType = Object.freeze({
  // ============ KEYWORDS ============
  // Data Definition Language (DDL)
  CREATE: "CREATE",
  DATABASE: "DATABASE",
  TABLE: "TABLE",
  DATABASES: "DATABASES",
  TABLES: "TABLES",
  // DROP: "DROP", // Commented: Not needed for basic SELECT query
  // ALTER: "ALTER", // Commented: Not needed for basic SELECT query
  // TRUNCATE: "TRUNCATE", // Commented: Not needed for basic SELECT query

  // Data Manipulation Language (DML) - KEEPING ONLY SELECT for the query
  SELECT: "SELECT",
  INSERT: "INSERT",
  INTO: "INTO",
  VALUES: "VALUES",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  FROM: "FROM",
  WHERE: "WHERE",
  SET: "SET",

  // Data Control Language (DCL)
  // GRANT: "GRANT", // Commented: Not needed
  // REVOKE: "REVOKE", // Commented: Not needed

  // Transaction Control
  // BEGIN: "BEGIN", // Commented: Not needed
  // COMMIT: "COMMIT", // Commented: Not needed
  // ROLLBACK: "ROLLBACK", // Commented: Not needed

  // Clauses
  // ORDER: "ORDER", // Commented: Not in the specific query
  // BY: "BY", // Commented: Not in the specific query
  // GROUP: "GROUP", // Commented: Not in the specific query
  // HAVING: "HAVING", // Commented: Not in the specific query
  // LIMIT: "LIMIT", // Commented: Not in the specific query
  // OFFSET: "OFFSET", // Commented: Not in the specific query
  // DISTINCT: "DISTINCT", // Commented: Not in the specific query
  // ALL: "ALL", // Commented: Not in the specific query

  // Joins - KEEPING FOR JOIN OPERATIONS
  JOIN: "JOIN", // You said to keep JOIN related operations
  // INNER: "INNER", // Commented: Not needed for basic JOIN
  // LEFT: "LEFT", // Commented: Not needed for basic JOIN
  // RIGHT: "RIGHT", // Commented: Not needed for basic JOIN
  // FULL: "FULL", // Commented: Not needed for basic JOIN
  // OUTER: "OUTER", // Commented: Not needed for basic JOIN
  ON: "ON", // Needed for JOIN operations

  // Constraints
  PRIMARY: "PRIMARY",
  KEY: "KEY",
  FOREIGN: "FOREIGN",
  REFERENCES: "REFERENCES",
  UNIQUE: "UNIQUE",
  // NOT: "NOT", // Commented: Not in the specific query
  NULL: "NULL", // You said to keep NULL data type
  // DEFAULT: "DEFAULT", // Commented: Not needed for the query
  // CHECK: "CHECK", // Commented: Not needed for the query
  // CONSTRAINT: "CONSTRAINT", // Commented: Not needed for the query

  // Data Types - KEEPING ONLY INT, TEXT, BOOLEAN, NULL
  INT: "INT", // You said to keep INT data type
  // INTEGER: "INTEGER", // Commented: Redundant with INT
  // FLOAT: "FLOAT", // Commented: Not in the specified data types
  // DOUBLE: "DOUBLE", // Commented: Not in the specified data types
  // DECIMAL: "DECIMAL", // Commented: Not in the specified data types
  // NUMERIC: "NUMERIC", // Commented: Not in the specified data types
  BOOLEAN: "BOOLEAN", // You said to keep BOOLEAN data type
  // BOOL: "BOOL", // Commented: Redundant with BOOLEAN
  // VARCHAR: "VARCHAR", // Commented: Not in the specified data types
  TEXT: "TEXT", // You said to keep TEXT data type
  // CHAR: "CHAR", // Commented: Not in the specified data types
  // DATE: "DATE", // Commented: Not in the specified data types
  // TIME: "TIME", // Commented: Not in the specified data types
  // DATETIME: "DATETIME", // Commented: Not in the specified data types
  // TIMESTAMP: "TIMESTAMP", // Commented: Not in the specified data types
  // BLOB: "BLOB", // Commented: Not in the specified data types

  // Functions
  // COUNT: "COUNT", // Commented: Not in the specific query
  // SUM: "SUM", // Commented: Not in the specific query
  // AVG: "AVG", // Commented: Not in the specific query
  // MIN: "MIN", // Commented: Not in the specific query
  // MAX: "MAX", // Commented: Not in the specific query
  // UPPER: "UPPER", // Commented: Not in the specific query
  // LOWER: "LOWER", // Commented: Not in the specific query
  // LENGTH: "LENGTH", // Commented: Not in the specific query
  // NOW: "NOW", // Commented: Not in the specific query
  // CURRENT_DATE: "CURRENT_DATE", // Commented: Not in the specific query
  // CURRENT_TIME: "CURRENT_TIME", // Commented: Not in the specific query

  // Control Flow
  // IF: "IF", // Commented: Not in SQL queries
  // ELSE: "ELSE", // Commented: Not in SQL queries
  // CASE: "CASE", // Commented: Not in the specific query
  // WHEN: "WHEN", // Commented: Not in the specific query
  // THEN: "THEN", // Commented: Not in the specific query
  // END: "END", // Commented: Not in the specific query

  // Logical
  // AND: "AND", // Commented: Not in the specific query
  // OR: "OR", // Commented: Not in the specific query
  // BETWEEN: "BETWEEN", // Commented: Not in the specific query
  // IN: "IN", // Commented: Not in the specific query
  // LIKE: "LIKE", // Commented: Not in the specific query
  // IS: "IS", // Commented: Not in the specific query
  // EXISTS: "EXISTS", // Commented: Not in the specific query

  // Sorting
  // ASC: "ASC", // Commented: Not in the specific query
  // DESC: "DESC", // Commented: Not in the specific query

  // Boolean literals
  TRUE: "TRUE", // Keep for BOOLEAN data type
  FALSE: "FALSE", // Keep for BOOLEAN data type

  // Database operations
  USE: "USE",
  SHOW: "SHOW",
  // DESCRIBE: "DESCRIBE", // Commented: Not in the specific query
  // EXPLAIN: "EXPLAIN", // Commented: Not in the specific query
  INDEX: "INDEX",
  // VIEW: "VIEW", // Commented: Not in the specific query

  // ============ PUNCTUATION ============
  COMMA: "COMMA", // , - Might be needed for column lists
  SEMICOLON: "SEMICOLON", // ; - Needed for: SELECT * FROM IDENTIFIER WHERE IDENTIFIER > 5;
  PERIOD: "PERIOD", // . - Commented: Not in the specific query
  // COLON: "COLON", // : - Commented: Not in the specific query
  // DOUBLE_COLON: "DOUBLE_COLON", // :: - Commented: Not in the specific query
  LEFT_PAREN: "LEFT_PAREN", // (
  RIGHT_PAREN: "RIGHT_PAREN", // )
  // LEFT_BRACKET: "LEFT_BRACKET", // [ - Commented: Not in the specific query
  // RIGHT_BRACKET: "RIGHT_BRACKET", // ] - Commented: Not in the specific query
  // LEFT_BRACE: "LEFT_BRACE", // { - Commented: Not in the specific query
  // RIGHT_BRACE: "RIGHT_BRACE", // } - Commented: Not in the specific query

  // ============ OPERATORS ============
  // Assignment
  ASSIGN: "ASSIGN", // = - Might be needed for comparisons, but query uses >
  // WALRUS: "WALRUS", // := - Commented: Not in SQL

  // Comparison - KEEPING > for the query: WHERE IDENTIFIER > 5
  // EQUAL: "EQUAL", // == - Commented: Not in the specific query
  // NOT_EQUAL: "NOT_EQUAL", // != or <> - Commented: Not in the specific query
  LESS_THAN: "LESS_THAN", // < - Keep for completeness with >
  GREATER_THAN: "GREATER_THAN", // > - NEEDED for: WHERE IDENTIFIER > 5
  // LESS_EQUAL: "LESS_EQUAL", // <= - Commented: Not in the specific query
  // GREATER_EQUAL: "GREATER_EQUAL", // >= - Commented: Not in the specific query
  // SPACESHIP: "SPACESHIP", // <=> - Commented: Not in SQL

  // Arithmetic
  // PLUS: "PLUS", // + - Commented: Not in the specific query
  // MINUS: "MINUS", // - - Commented: Not in the specific query
  ASTERISK: "ASTERISK", // * - NEEDED for: SELECT *
  // SLASH: "SLASH", // / - Commented: Not in the specific query
  // PERCENT: "PERCENT", // % - Commented: Not in the specific query
  // CARET: "CARET", // ^ - Commented: Not in the specific query
  // PIPE: "PIPE", // | - Commented: Not in the specific query
  // AMPERSAND: "AMPERSAND", // & - Commented: Not in the specific query
  // TILDE: "TILDE", // ~ - Commented: Not in the specific query

  // String concatenation
  // CONCAT: "CONCAT", // || - Commented: Not in the specific query
  // CONCAT_WS: "CONCAT_WS", // Commented: Not in the specific query

  // Bitwise
  // LSHIFT: "LSHIFT", // << - Commented: Not in SQL
  // RSHIFT: "RSHIFT", // >> - Commented: Not in SQL

  // Pattern matching
  // LIKE_OP: "LIKE_OP", // Commented: Not in the specific query
  // NOT_LIKE: "NOT_LIKE", // Commented: Not in the specific query
  // REGEXP: "REGEXP", // Commented: Not in the specific query
  // NOT_REGEXP: "NOT_REGEXP", // Commented: Not in the specific query

  // Null operators
  // IS_NULL: "IS_NULL", // IS NULL - Commented: Not in the specific query
  // IS_NOT_NULL: "IS_NOT_NULL", // Commented: Not in the specific query

  // ============ LITERALS ============
  IDENTIFIER: "IDENTIFIER", // NEEDED for: FROM IDENTIFIER and WHERE IDENTIFIER
  STRING: "STRING", // Keep for TEXT data type
  INTEGER: "INTEGER", // NEEDED for: > 5
  // FLOAT: "FLOAT", // Commented: Not in the specific query
  // HEX: "HEX", // Commented: Not in the specific query
  // BINARY: "BINARY", // Commented: Not in the specific query
  // PARAMETER: "PARAMETER", // Commented: Not in the specific query

  // ============ COMMANDS (dot commands) ============
  DOT_EXIT: "DOT_EXIT", // .exit - Keep for terminal commands
  //DOT_HELP: "DOT_HELP", // .help - Keep for terminal commands
  DOT_CLEAR: "DOT_CLEAR", // .clear - Keep for terminal commands
  // DOT_TABLES: "DOT_TABLES", // .tables - Commented: Not essential
  // DOT_SCHEMA: "DOT_SCHEMA", // .schema - Commented: Not essential
  // DOT_DATABASES: "DOT_DATABASES", // .databases - Commented: Not essential
  // DOT_INDEXES: "DOT_INDEXES", // .indexes - Commented: Not essential
  // DOT_VARS: "DOT_VARS", // .vars - Commented: Not essential
  // DOT_TIMING: "DOT_TIMING", // .timing - Commented: Not essential
  // DOT_MODE: "DOT_MODE", // .mode - Commented: Not essential
  // DOT_OUTPUT: "DOT_OUTPUT", // .output - Commented: Not essential
  // DOT_NULLVALUE: "DOT_NULLVALUE", // .nullvalue - Commented: Not essential
  // DOT_SEPARATOR: "DOT_SEPARATOR", // .separator - Commented: Not essential
  // DOT_ECHO: "DOT_ECHO", // .echo - Commented: Not essential
  DOT_QUIT: "DOT_QUIT", // .quit - Keep for terminal commands

  // ============ SPECIAL ============
  EOF: "EOF", // End of file - ALWAYS NEEDED
  ILLEGAL: "ILLEGAL", // Illegal/unknown character - ALWAYS NEEDED
  // COMMENT: "COMMENT", // -- comment or /* comment */ - Commented: Optional
  // WHITESPACE: "WHITESPACE", // Spaces, tabs, newlines - Commented: Usually ignored

  // ============ RESERVED FOR FUTURE ============
  // Window functions
  // OVER: "OVER", // Commented: Not needed now
  // PARTITION: "PARTITION", // Commented: Not needed now
  // ROWS: "ROWS", // Commented: Not needed now
  // RANGE: "RANGE", // Commented: Not needed now

  // JSON support
  // JSON: "JSON", // Commented: Not needed now
  // JSON_EXTRACT: "JSON_EXTRACT", // Commented: Not needed now
  // JSON_SET: "JSON_SET", // Commented: Not needed now
  // JSON_REMOVE: "JSON_REMOVE", // Commented: Not needed now

  // Full-text search
  // MATCH: "MATCH", // Commented: Not needed now
  // AGAINST: "AGAINST", // Commented: Not needed now
});

// Helper object to map string keywords to TokenTypes
const Keywords = Object.freeze({
  // SQL Keywords - ONLY KEEPING WHAT'S IN TokenType
  CREATE: TokenType.CREATE,
  DATABASE: TokenType.DATABASE,
  DATABASES: TokenType.DATABASES,
  TABLES: TokenType.TABLES,
  TABLE: TokenType.TABLE,
  // DROP: TokenType.DROP, // Commented: Not in TokenType
  // ALTER: TokenType.ALTER, // Commented: Not in TokenType
  SELECT: TokenType.SELECT,
  INSERT: TokenType.INSERT,
  INTO: TokenType.INTO,
  VALUES: TokenType.VALUES,
  UPDATE: TokenType.UPDATE,
  DELETE: TokenType.DELETE,
  FROM: TokenType.FROM,
  WHERE: TokenType.WHERE,
  SET: TokenType.SET,
  // AND: TokenType.AND, // Commented: Not in TokenType
  // OR: TokenType.OR, // Commented: Not in TokenType
  // NOT: TokenType.NOT, // Commented: Not in TokenType
  NULL: TokenType.NULL,
  TRUE: TokenType.TRUE,
  FALSE: TokenType.FALSE,
  // ORDER: TokenType.ORDER, // Commented: Not in TokenType
  // BY: TokenType.BY, // Commented: Not in TokenType
  // GROUP: TokenType.GROUP, // Commented: Not in TokenType
  // HAVING: TokenType.HAVING, // Commented: Not in TokenType
  // LIMIT: TokenType.LIMIT, // Commented: Not in TokenType
  // OFFSET: TokenType.OFFSET, // Commented: Not in TokenType
  // DISTINCT: TokenType.DISTINCT, // Commented: Not in TokenType
  // ALL: TokenType.ALL, // Commented: Not in TokenType
  JOIN: TokenType.JOIN,
  // INNER: TokenType.INNER, // Commented: Not in TokenType
  // LEFT: TokenType.LEFT, // Commented: Not in TokenType
  // RIGHT: TokenType.RIGHT, // Commented: Not in TokenType
  ON: TokenType.ON,
  // AS: "AS", // Commented: Not defined in TokenType

  // Data Types - ONLY KEEPING WHAT'S IN TokenType
  INT: TokenType.INT,
  // INTEGER: TokenType.INTEGER, // Commented: Not in TokenType
  // VARCHAR: TokenType.VARCHAR, // Commented: Not in TokenType
  TEXT: TokenType.TEXT,
  BOOLEAN: TokenType.BOOLEAN,
  // DATE: TokenType.DATE, // Commented: Not in TokenType
  // DATETIME: TokenType.DATETIME, // Commented: Not in TokenType

  // Functions
  // COUNT: TokenType.COUNT, // Commented: Not in TokenType
  // SUM: TokenType.SUM, // Commented: Not in TokenType
  // AVG: TokenType.AVG, // Commented: Not in TokenType
  // MIN: TokenType.MIN, // Commented: Not in TokenType
  // MAX: TokenType.MAX, // Commented: Not in TokenType

  // Commands
  USE: TokenType.USE,
  SHOW: TokenType.SHOW,
  INDEX: TokenType.INDEX,
});

// Dot commands mapping - ONLY KEEPING WHAT'S IN TokenType
const DotCommands = Object.freeze({
  ".exit": TokenType.DOT_EXIT,
  //".help": TokenType.DOT_HELP,
  ".clear": TokenType.DOT_CLEAR,
  // ".tables": TokenType.DOT_TABLES, // Commented: Not in TokenType
  // ".schema": TokenType.DOT_SCHEMA, // Commented: Not in TokenType
  // ".databases": TokenType.DOT_DATABASES, // Commented: Not in TokenType
  ".quit": TokenType.DOT_QUIT,
});

// Operators mapping - ONLY KEEPING WHAT'S IN TokenType
const Operators = Object.freeze({
  // Single character operators
  ",": TokenType.COMMA,
  ";": TokenType.SEMICOLON,
  ".": TokenType.PERIOD,
  "(": TokenType.LEFT_PAREN,
  ")": TokenType.RIGHT_PAREN,
  // "[": TokenType.LEFT_BRACKET, // Commented: Not in TokenType
  // "]": TokenType.RIGHT_BRACKET, // Commented: Not in TokenType
  // "{": TokenType.LEFT_BRACE, // Commented: Not in TokenType
  // "}": TokenType.RIGHT_BRACE, // Commented: Not in TokenType
  // "+": TokenType.PLUS, // Commented: Not in TokenType
  // "-": TokenType.MINUS, // Commented: Not in TokenType
  "*": TokenType.ASTERISK,
  // "/": TokenType.SLASH, // Commented: Not in TokenType
  // "%": TokenType.PERCENT, // Commented: Not in TokenType
  "=": TokenType.ASSIGN,
  "<": TokenType.LESS_THAN,
  ">": TokenType.GREATER_THAN,
  // "~": TokenType.TILDE, // Commented: Not in TokenType
  // "^": TokenType.CARET, // Commented: Not in TokenType
  // "|": TokenType.PIPE, // Commented: Not in TokenType
  // "&": TokenType.AMPERSAND, // Commented: Not in TokenType
  // ":": TokenType.COLON, // Commented: Not in TokenType

  // Multi-character operators
  // "::": TokenType.DOUBLE_COLON, // Commented: Not in TokenType
  // "==": TokenType.EQUAL, // Commented: Not in TokenType
  // "!=": TokenType.NOT_EQUAL, // Commented: Not in TokenType
  // "<>": TokenType.NOT_EQUAL, // Commented: Not in TokenType
  // "<=": TokenType.LESS_EQUAL, // Commented: Not in TokenType
  // ">=": TokenType.GREATER_EQUAL, // Commented: Not in TokenType
  // "<=>": TokenType.SPACESHIP, // Commented: Not in TokenType
  // "||": TokenType.CONCAT, // Commented: Not in TokenType
  // "<<": TokenType.LSHIFT, // Commented: Not in TokenType
  // ">>": TokenType.RSHIFT, // Commented: Not in TokenType
  // ":=": TokenType.WALRUS, // Commented: Not in TokenType
  // "--": "COMMENT_START", // Commented: Not needed
  // "/*": "COMMENT_START_MULTI", // Commented: Not needed
});

// Token class implementation
class Token {
  constructor(type, literal, line = 1, column = 1) {
    this.type = type;
    this.literal = literal;
    this.line = line;
    this.column = column;
  }

  toString() {
    return `Token(${this.type}, "${this.literal}", line: ${this.line}, col: ${this.column})`;
  }

  isKeyword() {
    // Check if this token type is in the Keywords mapping values
    return Object.values(Keywords).includes(this.type);
  }

  isOperator() {
    return Object.values(Operators).includes(this.type);
  }

  isDotCommand() {
    return Object.values(DotCommands).includes(this.type);
  }

  isLiteral() {
    const literals = [
      TokenType.STRING,
      TokenType.INTEGER,
      // TokenType.FLOAT, // Commented: Not in TokenType
      // TokenType.HEX, // Commented: Not in TokenType
      // TokenType.BINARY, // Commented: Not in TokenType
      TokenType.TRUE,
      TokenType.FALSE,
      TokenType.NULL,
    ];
    return literals.includes(this.type);
  }

  isDataType() {
    const dataTypes = [
      TokenType.INT,
      // TokenType.INTEGER, // Commented: Not in TokenType
      // TokenType.VARCHAR, // Commented: Not in TokenType
      TokenType.TEXT,
      TokenType.BOOLEAN,
      // TokenType.DATE, // Commented: Not in TokenType
      // TokenType.DATETIME, // Commented: Not in TokenType
      // TokenType.FLOAT, // Commented: Not in TokenType
      // TokenType.DOUBLE, // Commented: Not in TokenType
      // TokenType.DECIMAL, // Commented: Not in TokenType
    ];
    return dataTypes.includes(this.type);
  }

  equals(otherToken) {
    return this.type === otherToken.type && this.literal === otherToken.literal;
  }
}

// Helper functions
const TokenUtils = {
  // Check if a string is a keyword
  isKeyword: (str) => {
    return Keywords[str.toUpperCase()] !== undefined;
  },

  // Get token type for a keyword string
  getKeywordType: (str) => {
    return Keywords[str.toUpperCase()];
  },

  // Check if a string is a dot command
  isDotCommand: (str) => {
    return DotCommands[str.toLowerCase()] !== undefined;
  },

  // Get token type for a dot command
  getDotCommandType: (str) => {
    return DotCommands[str.toLowerCase()];
  },

  // Check if character is an operator
  isOperatorChar: (char) => {
    return Object.keys(Operators).some((op) => op.startsWith(char));
  },

  // Get operator token type
  getOperatorType: (op) => {
    return Operators[op] || TokenType.ILLEGAL;
  },

  // Pretty print token
  prettyPrint: (token) => {
    const typeName = token.type.replace(/_/g, " ").toLowerCase();
    return `${typeName.padEnd(20)} '${token.literal}'`;
  },
};

class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.readPosition = 0;
    this.ch = "";
    this.line = 1;
    this.column = 1;
    this.readChar(); // This should read the first character
  }

  readChar() {
    if (this.readPosition >= this.input.length) {
      this.ch = "\0"; // EOF character
    } else {
      this.ch = this.input[this.readPosition];
    }

    // Set current position BEFORE incrementing readPosition
    this.position = this.readPosition;

    // Only increment if we're not already at EOF
    if (this.ch !== "\0") {
      this.readPosition++;
    }

    if (this.ch === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
  }

  peekChar() {
    if (this.readPosition >= this.input.length) {
      return "\0";
    }
    return this.input[this.readPosition];
  }

  skipWhitespace() {
    while (
      this.ch === " " ||
      this.ch === "\t" ||
      this.ch === "\n" ||
      this.ch === "\r"
    ) {
      this.readChar();
    }
  }

  readIdentifier() {
    const start = this.position;
    while (this.isLetter(this.ch) || this.isDigit(this.ch) || this.ch === "_") {
      this.readChar();
    }
    return this.input.slice(start, this.position);
  }

  readNumber() {
    const start = this.position;
    while (this.isDigit(this.ch)) {
      this.readChar();
    }
    return this.input.slice(start, this.position);
  }

  readString() {
    const quote = this.ch;
    const start = this.position + 1; // Skip opening quote
    this.readChar();

    while (this.ch !== quote && this.ch !== "\0") {
      this.readChar();
    }

    const value = this.input.slice(start, this.position);

    if (this.ch === quote) {
      this.readChar(); // Skip closing quote
    }

    return value;
  }

  isLetter(ch) {
    return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_";
  }

  isDigit(ch) {
    return ch >= "0" && ch <= "9";
  }

  nextToken() {
    this.skipWhitespace();

    let token;
    const col = this.column;
    const line = this.line;

    switch (this.ch) {
      case ".":
        // Peek at next char: if it's a letter, this is a dot command (.exit)
        // ONLY if it's at the very start of a command.
        // For "users.id", the "." must be its own token.
        if (
          this.position === 0 ||
          this.input[this.position - 1] === " " ||
          this.input[this.position - 1] === "\n"
        ) {
          if (this.isLetter(this.peekChar())) {
            const ident = "." + this.readIdentifier();
            const cmdType = TokenUtils.getDotCommandType(ident);
            return new Token(cmdType || TokenType.ILLEGAL, ident, line, col);
          }
        }

        // Otherwise, it's a standard PERIOD operator for table.column
        token = new Token(TokenType.PERIOD, ".", line, col);
        this.readChar();
        return token;
      case "=":
        token = new Token(TokenType.ASSIGN, "=", line, col);
        this.readChar(); // Move past "="
        return token;
      case "<":
        token = new Token(TokenType.LESS_THAN, "<", line, col);
        break;
      case ">":
        token = new Token(TokenType.GREATER_THAN, ">", line, col);
        break;
      case "*":
        token = new Token(TokenType.ASTERISK, "*", line, col);
        break;
      case ",":
        token = new Token(TokenType.COMMA, ",", line, col);
        break;
      case ";":
        token = new Token(TokenType.SEMICOLON, ";", line, col);
        break;
      case "(":
        token = new Token(TokenType.LEFT_PAREN, "(", line, col);
        break;
      case ")":
        token = new Token(TokenType.RIGHT_PAREN, ")", line, col);
        break;
      case "'":
      case '"':
        const strValue = this.readString();
        token = new Token(TokenType.STRING, strValue, line, col);
        return token; // Early return since we already read the string
      case "\0":
        token = new Token(TokenType.EOF, "", line, col);
        break;
      default:
        if (this.isLetter(this.ch)) {
          const ident = this.readIdentifier();
          // Check if it's a keyword
          if (TokenUtils.isKeyword(ident.toUpperCase())) {
            const keywordType = TokenUtils.getKeywordType(ident.toUpperCase());
            token = new Token(keywordType, ident.toUpperCase(), line, col);
          }
          // Otherwise it's an identifier
          else {
            token = new Token(TokenType.IDENTIFIER, ident, line, col);
          }
          return token; // Early return since we already read the identifier
        } else if (this.isDigit(this.ch)) {
          const num = this.readNumber();
          token = new Token(TokenType.INTEGER, num, line, col);
          return token; // Early return since we already read the number
        } else {
          // Handle unknown characters
          const unknownChar = this.ch;
          token = new Token(TokenType.ILLEGAL, unknownChar, line, col);
        }
    }

    this.readChar();
    return token;
  }

  tokenize() {
    const tokens = [];
    let token = this.nextToken();

    while (token.type !== TokenType.EOF) {
      tokens.push(token);
      token = this.nextToken();
    }

    tokens.push(token); // Add EOF token
    return tokens;
  }
}

// Example usage:
// const lexer = new Lexer("SELECT * FROM users WHERE age > 5;");
// const tokens = lexer.tokenize();

// Export if using modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    TokenType,
    Keywords,
    DotCommands,
    Operators,
    Token,
    TokenUtils,
    Lexer,
  };
}
