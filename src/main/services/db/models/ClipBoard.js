const BaseModel = require("../BaseModel");
const db = require("../Database");

class Clipboard extends BaseModel {
  constructor() {
    super("clipboard", [
      "content TEXT NOT NULL",
      "source TEXT"
    ]);
  }

  findBySource(source) {
    return db.all(
      `SELECT * FROM ${this.tableName} WHERE source = ? AND deleted_at IS NULL`,
      [source]
    );
  }
}

module.exports = new Clipboard();
