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

  /*create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");
    const query = `INSERT INTO ${this.tableName} (${keys.join(", ")}) VALUES (${placeholders})`;

    
    return db.run(query, values);
  }*/

  
  create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");
    
    const query = `INSERT INTO ${this.tableName} (${keys.join(", ")}) VALUES (${placeholders})`;
    const result = db.run(query, values); // db.run retourne { id: lastInsertRowid, changes: ... }
    const record = {
        ...data,
        id: result.id,
        created_at: new Date().toISOString()
    };
    
    return record; 
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

  findLatest() {
      // Supposons que 'id' est un auto-incrément, donc l'ID le plus élevé est le plus récent,
      // ou que 'created_at' est un timestamp
      const query = `SELECT * FROM ${this.tableName} 
                    ORDER BY id DESC 
                    LIMIT 1`;
      
      // Votre fonction db.get() doit être utilisée ici pour récupérer une seule ligne
      return db.get(query); 
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
