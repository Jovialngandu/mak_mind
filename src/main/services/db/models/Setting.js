const BaseModel = require("../BaseModel");

class Setting extends BaseModel {
  constructor() {
    super("settings", [
      "key TEXT UNIQUE NOT NULL",
      "value TEXT"
    ]);

    this.seedDefaults();
  }

  seedDefaults() {
    const defaults = [
      { key: "theme", value: "light" },
      { key: "clipboard_check_interval", value: "1000" },
    ];

    for (const setting of defaults) {
      const exists = this.findByKey(setting.key);
      if (!exists) {
        this.create(setting);
      }
    }
  }

  findByKey(key) {
    return this.tableName && require("../Database").get(
      `SELECT * FROM ${this.tableName} WHERE key = ? AND deleted_at IS NULL`,
      [key]
    );
  }

  get(key) {
    const row = this.findByKey(key);
    return row ? row.value : null;
  }

  set(key, value) {
    const existing = this.findByKey(key);
    if (existing) {
      return require("../Database").run(
        `UPDATE ${this.tableName} SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?`,
        [value, key]
      );
    } else {
      return this.create({ key, value });
    }
  }

  getAll() {
    return require("../Database").all(
      `SELECT key, value FROM ${this.tableName} WHERE deleted_at IS NULL`
    );
  }
}

module.exports = new Setting();
