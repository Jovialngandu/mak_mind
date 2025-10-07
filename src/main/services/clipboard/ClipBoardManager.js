// src/main/services/clipboard/ClipboardManager.js
const { clipboard } = require("electron");
const ClipboardModel = require("../db/models/ClipBoard"); // chemin correct vers le modèle
const clipboardCache = require("../cache"); // cache persistant (assumé persistant ou in-memory)
const { appEvents } = require('../../ipc/emitter'); 

class ClipboardManager {
  constructor() {
    this.model = ClipboardModel;
    this.initializeCache(); 
  }

  /**
   * INITIALISE le cache 'last_clipboard' en le synchronisant avec la DB.
   * Ceci est crucial pour éviter de réenregistrer le même élément au redémarrage.
   */
  async initializeCache() {
    try {
      // Assurez-vous d'avoir une méthode pour récupérer le dernier enregistrement par date/ID
      const latestClip = await this.model.findLatest(); 
      
      if (latestClip && latestClip.content) {
        // Met à jour le cache in-memory/persistant avec le contenu le plus récent de la DB
        clipboardCache.set("last_clipboard", latestClip.content);
        //console.log(`[Cache Sync] Synchronisation réussie. Dernier clip: "${latestClip.content.substring(0, 30)}..."`);
      } else {
        // Si la DB est vide, assurez-vous que le cache est vide
        clipboardCache.set("last_clipboard", null); 
        //console.log("[Cache Sync] Base de données vide, cache initialisé à vide.");
      }
    } catch (error) {
      console.error("[Cache Sync] Erreur lors de la synchronisation du cache:", error);
    }
  }


  /**
   * Vérifie le presse-papier et sauvegarde si nouveau
   * en se basant sur le cache
   */
  async checkClipboard(source = "system") {

    const text = this.readText();
    if (!text) return null;

    // Le cache est maintenant initialisé avec la dernière valeur de la DB au démarrage
    const lastCached = clipboardCache.get("last_clipboard"); 
    
    if (text === lastCached) {
      // Déjà sauvegardé, on ne fait rien
      return null;
    }

    // Nouveau texte, on sauvegarde
    const record = await this.model.create({ content: text, source });

    appEvents.emit('clip:added', record);
    // On met à jour le cache AVEC LE NOUVEAU TEXTE
    clipboardCache.set("last_clipboard", text); 


    return record;
  }

  readText() {
    return clipboard.readText();
  }

  writeText(text){
    clipboard.writeText(text)
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

    const result = await this.model.softDelete(id); // Exécute la suppression (softDelete)
    
    if (result && result.changes > 0) { // Assurez-vous que votre softDelete retourne le nombre de changements
        appEvents.emit('clip:deleted', id);
    }
    
    return result;
  }

  async clearAll() {
    const all = await this.model.findAll();
    return Promise.all(all.map(item => this.model.softDelete(item.id)));
  }
}

module.exports = new ClipboardManager();
