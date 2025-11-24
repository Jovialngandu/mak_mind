const Database = require("better-sqlite3");
const path = require("path");
const { app } = require("electron");

class DB {
  constructor() {

    // AppData user path : ~/.config/makmind/ (sur Linux)
    const userDataPath = app.getPath("userData");

    // Chemin final vers la DB
    const dbPath = path.join(userDataPath, "app.db");

    console.log("📌 Using SQLite DB at:", dbPath);

    this.db = new Database(dbPath);

    console.log("✅ Connected to SQLite with better-sqlite3");
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
