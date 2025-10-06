const NodeCache = require("node-cache");

class CacheManager {
  constructor() {
    // TTL par défaut : 0 = pas d'expiration, checkperiod 600s
    this.store = new NodeCache({ stdTTL: 0, checkperiod: 600 });
  }

  /**
   * Récupère la valeur associée à une clé
   * @param {string} key
   * @returns any
   */
  get(key) {
    return this.store.get(key);
  }

  /**
   * Enregistre une valeur dans le cache
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    this.store.set(key, value);
  }

  /**
   * Supprime une clé du cache
   * @param {string} key
   */
  remove(key) {
    this.store.del(key);
  }

  /**
   * Vide complètement le cache
   */
  clear() {
    this.store.flushAll();
  }
}

// Export d'une instance unique
module.exports = new CacheManager();
