const db = require("./Database");

class BaseModel {
  constructor(tableName, fields) {
    this.tableName = tableName;
    this.fields = fields;

    this.createTable();
  }

  createTable() {
    const columns = this.fields.join(", ");
    db.run(
      `CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ${columns},
        deleted_at DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
  }

  create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");
    const query = `INSERT INTO ${this.tableName} (${keys.join(", ")}) VALUES (${placeholders})`;
    return db.run(query, values);
  }

  findById(id) {
    return db.get(
      `SELECT * FROM ${this.tableName} WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
  }

  findAll() {
    return db.all(
      `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL ORDER BY created_at DESC`
    );
  }

  update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const query = `UPDATE ${this.tableName} 
                   SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = ? AND deleted_at IS NULL`;
    return db.run(query, [...values, id]);
  }

  softDelete(id) {
    const query = `UPDATE ${this.tableName} 
                   SET deleted_at = CURRENT_TIMESTAMP 
                   WHERE id = ?`;
    return db.run(query, [id]);
  }
}

module.exports = BaseModel;
