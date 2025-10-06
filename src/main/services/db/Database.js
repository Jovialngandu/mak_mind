const Database = require("better-sqlite3");
const path = require("path");

class DB {
  constructor() {
    const dbPath = path.resolve(__dirname, "app.db");
    this.db = new Database(dbPath);

    console.log("✅ Connected to SQLite with better-sqlite3:", dbPath);
  }

  run(query, params = []) {
    const stmt = this.db.prepare(query);
    const result = stmt.run(params);
    return { id: result.lastInsertRowid, changes: result.changes };
  }

  get(query, params = []) {
    const stmt = this.db.prepare(query);
    return stmt.get(params);
  }

  all(query, params = []) {
    const stmt = this.db.prepare(query);
    return stmt.all(params);
  }

  transaction(fn) {
    return this.db.transaction(fn);
  }
}

module.exports = new DB();
