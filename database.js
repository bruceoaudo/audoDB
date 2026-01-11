const fs = require("fs");
const path = require("path");

class Database {
  constructor() {
    this.databases = new Map();
    this.currentDatabase = null;
    this.storagePath = path.join(__dirname, "engine_data.json");
    this.logPath = path.join(__dirname, "history.log"); // Path for the log file

    this.loadFromFile();
    this.log("Database Engine Started."); // Initial log entry
  }

  // ================= LOGGING HELPER =================

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

  createDatabase(name) {
    if (this.databases.has(name))
      throw new Error(`Database '${name}' already exists`);
    this.databases.set(name, { name, tables: new Map() });
    this.saveToFile();
    this.log(`DATABASE CREATED: ${name}`);
    return `Database '${name}' created successfully`;
  }

  useDatabase(name) {
    if (!this.databases.has(name))
      throw new Error(`Database '${name}' does not exist`);
    this.currentDatabase = this.databases.get(name);
    this.log(`SWITCHED TO DATABASE: ${name}`);
    return `Using database '${name}'`;
  }

  showDatabases() {
    const dbNames = Array.from(this.databases.keys());
    return dbNames.length === 0 ? "No databases found" : dbNames.join("\n");
  }

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

  showTables() {
    if (!this.currentDatabase) throw new Error("No database selected");
    const tableNames = Array.from(this.currentDatabase.tables.keys());
    return tableNames.length === 0 ? "No tables found" : tableNames.join("\n");
  }

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
