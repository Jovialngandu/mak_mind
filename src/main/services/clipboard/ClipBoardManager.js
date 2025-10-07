// src/main/services/clipboard/ClipboardManager.js
const { clipboard } = require("electron");
const ClipboardModel = require("../db/models/ClipBoard"); // chemin correct vers le modèle
const clipboardCache = require("../cache"); // cache persistant
const { appEvents } = require('../../ipc/emitter'); 

class ClipboardManager {
  constructor() {
    this.model = ClipboardModel;
  }

  /**
   * Vérifie le presse-papier et sauvegarde si nouveau
   * en se basant sur le cache
   */
  async checkClipboard(source = "system") {

    const text = this.readText();
    if (!text) return null;

    const lastCached = clipboardCache.get("last_clipboard");
    if (text === lastCached) {
      // Déjà sauvegardé, on ne fait rien
      return null;
    }

    // Nouveau texte, on sauvegarde
    //console.log(text)
    const record = await this.model.create({ content: text, source });

    appEvents.emit('clip:added', record);
    // On met à jour le cache
    clipboardCache.set("last_clipboard", text);



    return record;
  }

  readText() {
    return clipboard.readText();
  }

  // Récupère les derniers textes
  async getRecent(limit = 50) {
    const all = await this.model.findAll(); // utilise la fonction héritée
    return all.slice(0, limit); // limite le nombre en JS
  }

  async search(query) {
    const all = await this.model.findAll(); // on récupère tous les items
    const likeQuery = query.toLowerCase();
    return all.filter(
      row =>
        row.content.toLowerCase().includes(likeQuery) ||
        (row.source && row.source.toLowerCase().includes(likeQuery))
    );
  }

  async remove(id) {
    return this.model.softDelete(id);
  }

  async clearAll() {
    const all = await this.model.findAll();
    return Promise.all(all.map(item => this.model.softDelete(item.id)));
  }
}

module.exports = new ClipboardManager();
