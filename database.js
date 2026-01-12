const fs = require("fs");
const path = require("path");

/**
 * @class Database
 * @description Core engine for managing in-memory databases, handling table operations,
 * indexing, and JSON file persistence.
 */
class Database {
  /**
   * @constructor
   * @description Initializes the database engine, sets up storage paths, and loads existing data.
   */
  constructor() {
    this.databases = new Map();
    this.currentDatabase = null;
    // Change __dirname to process.cwd()
    this.storagePath = path.join(process.cwd(), "engine_data.json");
    this.logPath = path.join(process.cwd(), "history.log");

    this.loadFromFile();
    this.log("Database Engine Started.");
  }
  // ================= LOGGING HELPER =================

  /**
   * @method log
   * @description Appends a timestamped message to the history.log file.
   * @param {string} message - The message to log.
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    try {
      fs.appendFileSync(this.logPath, logEntry);
    } catch (error) {
      console.error(`Logging Error: ${error.message}`);
    }
  }

  // ================= PERSISTENCE HELPERS =================

  /**
   * @method saveToFile
   * @description Serializes the current state of all databases and tables to engine_data.json.
   */
  saveToFile() {
    try {
      const dataToSave = {};
      for (let [dbName, db] of this.databases) {
        const tablesObj = {};
        for (let [tableName, table] of db.tables) {
          tablesObj[tableName] = {
            name: table.name,
            columns: table.columns,
            constraints: table.constraints,
            rows: table.rows,
          };
        }
        dataToSave[dbName] = { name: db.name, tables: tablesObj };
      }
      fs.writeFileSync(this.storagePath, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
      this.log(`Critical: Failed to persist data - ${error.message}`);
    }
  }

  /**
   * @method loadFromFile
   * @description Reads engine_data.json and reconstructs the database Map and table structures.
   */
  loadFromFile() {
    try {
      if (!fs.existsSync(this.storagePath)) return;
      const fileData = fs.readFileSync(this.storagePath, "utf8");
      const parsedData = JSON.parse(fileData);

      for (let dbName in parsedData) {
        const dbData = parsedData[dbName];
        const tableMap = new Map();
        for (let tableName in dbData.tables) {
          const tableData = dbData.tables[tableName];
          tableMap.set(tableName, { ...tableData, indices: new Map() });
        }
        this.databases.set(dbName, { name: dbData.name, tables: tableMap });
      }
      this.log("Database state loaded from disk.");
    } catch (error) {
      this.log(`Load Error: ${error.message}`);
    }
  }

  // ================= DATABASE METHODS =================

  /**
   * @method projectColumns
   * @description Filters rows to only include the specified columns (SELECT projection).
   * @param {Array<Object>} data - The dataset to process.
   * @param {string[]} columns - Array of column names to project.
   * @returns {Array<Object>} Projected dataset.
   */
  projectColumns(data, columns) {
    if (columns[0] === "*") return data;
    return data.map((row) => {
      const projected = {};
      columns.forEach((col) => {
        const normalizedCol = col.toLowerCase();
        projected[normalizedCol] = row[normalizedCol];
      });
      return projected;
    });
  }

  /**
   * @method createIndex
   * @description Creates a lookup Map for a specific column to optimize search performance.
   * @param {string} tableName - The name of the table.
   * @param {string} columnName - The column to index.
   * @returns {string} Confirmation message.
   */
  createIndex(tableName, columnName) {
    if (!this.currentDatabase) throw new Error("No database selected");
    const table = this.currentDatabase.tables.get(tableName);
    if (!table) throw new Error(`Table ${tableName} not found`);

    const normalizedCol = columnName.toLowerCase();
    const index = new Map();
    table.rows.forEach((row) => {
      const val = row[normalizedCol];
      if (!index.has(val)) index.set(val, []);
      index.get(val).push(row);
    });

    if (!table.indices) table.indices = new Map();
    table.indices.set(normalizedCol, index);
    this.log(`INDEX CREATED: ${tableName}(${normalizedCol})`);
    return `Index created on ${tableName}(${normalizedCol})`;
  }

  /**
   * @method createDatabase
   * @description Creates a new database instance.
   * @param {string} name - The name of the database.
   * @returns {string} Confirmation message.
   */
  createDatabase(name) {
    if (this.databases.has(name))
      throw new Error(`Database '${name}' already exists`);
    this.databases.set(name, { name, tables: new Map() });
    this.saveToFile();
    this.log(`DATABASE CREATED: ${name}`);
    return `Database '${name}' created successfully`;
  }

  /**
   * @method useDatabase
   * @description Switches the current active database context.
   * @param {string} name - The name of the database to use.
   * @returns {string} Confirmation message.
   */
  useDatabase(name) {
    if (!this.databases.has(name))
      throw new Error(`Database '${name}' does not exist`);
    this.currentDatabase = this.databases.get(name);
    this.log(`SWITCHED TO DATABASE: ${name}`);
    return `Using database '${name}'`;
  }

  /**
   * @method showDatabases
   * @description Lists all available databases.
   * @returns {string} Newline-separated database names.
   */
  showDatabases() {
    const dbNames = Array.from(this.databases.keys());
    return dbNames.length === 0 ? "No databases found" : dbNames.join("\n");
  }

  /**
   * @method createTable
   * @description Creates a new table with defined columns and constraints.
   * @param {string} name - Table name.
   * @param {Object[]} columns - Array of column definition objects.
   * @param {Object} [constraints={}] - Primary and Foreign key constraints.
   * @returns {string} Confirmation message.
   */
  createTable(name, columns, constraints = {}) {
    if (!this.currentDatabase) throw new Error("No database selected");
    const normalizedColumns = columns.map((col) => ({
      name: col.name.toLowerCase(),
      type: col.type,
    }));

    const normalizedConstraints = {
      primaryKey: constraints.primaryKey
        ? constraints.primaryKey.toLowerCase()
        : null,
      foreignKeys: (constraints.foreignKeys || []).map((fk) => ({
        column: fk.column.toLowerCase(),
        refTable: fk.refTable,
        refCol: fk.refCol.toLowerCase(),
      })),
    };

    this.currentDatabase.tables.set(name, {
      name,
      columns: normalizedColumns,
      constraints: normalizedConstraints,
      rows: [],
      indices: new Map(),
    });

    this.saveToFile();
    this.log(`TABLE CREATED: ${name} in database ${this.currentDatabase.name}`);
    return `Table '${name}' created successfully.`;
  }

  /**
   * @method showTables
   * @description Lists all tables in the current active database.
   * @returns {string} Newline-separated table names.
   */
  showTables() {
    if (!this.currentDatabase) throw new Error("No database selected");
    const tableNames = Array.from(this.currentDatabase.tables.keys());
    return tableNames.length === 0 ? "No tables found" : tableNames.join("\n");
  }

  /**
   * @method insertIntoTable
   * @description Inserts a new row into a table after validating constraints (PK and FK).
   * @param {string} tableName - Target table.
   * @param {Array} values - Array of values to insert.
   * @returns {string} Confirmation message.
   */
  insertIntoTable(tableName, values) {
    if (!this.currentDatabase) throw new Error("No database selected");
    const table = this.currentDatabase.tables.get(tableName);
    if (!table) throw new Error(`Table '${tableName}' does not exist`);

    const row = {};
    table.columns.forEach((col, index) => {
      const val = values[index];
      const colName = col.name.toLowerCase();
      if (table.constraints.primaryKey === colName) {
        if (table.rows.some((r) => r[colName] === val))
          throw new Error(`PK Violation: ${val}`);
      }
      const fk = table.constraints.foreignKeys.find(
        (f) => f.column === colName
      );
      if (fk) {
        const refTable = this.currentDatabase.tables.get(fk.refTable);
        if (!refTable || !refTable.rows.some((r) => r[fk.refCol] === val))
          throw new Error(`FK Violation: ${val}`);
      }
      row[colName] = val;
    });

    table.rows.push(row);
    this.saveToFile();
    this.log(`INSERT: 1 row added to ${tableName}`);
    return "1 row inserted";
  }

  /**
   * @method selectFromTable
   * @description Retrieves rows from a table with support for JOINs and WHERE clauses.
   * @param {string} tableName - Source table.
   * @param {string[]} columns - Columns to return.
   * @param {Object} [whereClause] - Filtering logic.
   * @param {Object} [joinClause] - Joining logic.
   * @returns {Array<Object>} Resulting dataset.
   */
  selectFromTable(tableName, columns, whereClause, joinClause) {
    if (!this.currentDatabase) throw new Error("No database selected");
    const leftTable = this.currentDatabase.tables.get(tableName);
    if (!leftTable) throw new Error(`Table '${tableName}' does not exist`);

    let data = leftTable.rows;
    if (joinClause) {
      const rightTable = this.currentDatabase.tables.get(joinClause.table);
      const joinedData = [];
      const leftCol = joinClause.leftCol.toLowerCase();
      const rightCol = joinClause.rightCol.toLowerCase();
      data.forEach((l) =>
        rightTable.rows.forEach((r) => {
          if (l[leftCol] === r[rightCol]) joinedData.push({ ...l, ...r });
        })
      );
      data = joinedData;
    }

    if (whereClause) {
      const leftKey = whereClause.left.toLowerCase();
      const { operator, right } = whereClause;
      data = data.filter((row) => {
        const val = row[leftKey];
        switch (operator) {
          case "=":
            return val == right;
          case ">":
            return val > right;
          case "<":
            return val < right;
          default:
            return true;
        }
      });
    }
    this.log(`SELECT: Query executed on ${tableName}`);
    return this.projectColumns(data, columns);
  }

  /**
   * @method updateTable
   * @description Updates existing rows in a table based on a WHERE condition.
   * @param {string} tableName - Target table.
   * @param {Object} updates - Key-value pairs of updates.
   * @param {Object} [whereClause] - Condition for which rows to update.
   * @returns {string} Number of rows updated.
   */
  updateTable(tableName, updates, whereClause = null) {
    if (!this.currentDatabase) throw new Error("No database selected");
    const table = this.currentDatabase.tables.get(tableName);
    if (!table) throw new Error(`Table '${tableName}' does not exist`);

    let updatedCount = 0;
    table.rows.forEach((row) => {
      let shouldUpdate = true;
      if (whereClause) {
        const val = row[whereClause.left.toLowerCase()];
        const right = whereClause.right;
        switch (whereClause.operator) {
          case "=":
            shouldUpdate = val == right;
            break;
          case ">":
            shouldUpdate = val > right;
            break;
          case "<":
            shouldUpdate = val < right;
            break;
        }
      }
      if (shouldUpdate) {
        Object.keys(updates).forEach(
          (c) => (row[c.toLowerCase()] = updates[c])
        );
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      this.saveToFile();
      this.log(`UPDATE: ${updatedCount} rows in ${tableName}`);
    }
    return `${updatedCount} row(s) updated`;
  }

  /**
   * @method deleteFromTable
   * @description Removes rows from a table based on a WHERE condition.
   * @param {string} tableName - Target table.
   * @param {Object} [whereClause] - Condition for which rows to delete.
   * @returns {string} Number of rows deleted.
   */
  deleteFromTable(tableName, whereClause = null) {
    if (!this.currentDatabase) throw new Error("No database selected");
    const table = this.currentDatabase.tables.get(tableName);
    const initialLength = table.rows.length;

    if (!whereClause) {
      table.rows = [];
    } else {
      const k = whereClause.left.toLowerCase();
      table.rows = table.rows.filter((r) => {
        const v = r[k];
        const rv = whereClause.right;
        switch (whereClause.operator) {
          case "=":
            return v != rv;
          case ">":
            return !(v > rv);
          case "<":
            return !(v < rv);
        }
      });
    }

    const deletedCount = initialLength - table.rows.length;
    if (deletedCount > 0) {
      this.saveToFile();
      this.log(`DELETE: ${deletedCount} rows from ${tableName}`);
    }
    return `${deletedCount} row(s) deleted`;
  }
}

module.exports = { Database };
