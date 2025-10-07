const SettingsModel = require("../db/models/Setting"); // Votre modèle Setting en clé/valeur

class SettingsManager {
    constructor() {
        this.model = SettingsModel; 
        
        // Définition des valeurs par défaut pour les clés attendues par le Renderer
        // Ceci est la source de vérité pour les clés du Renderer
        this.defaultSettings = {
            watcherInterval: 1000, // Clé DB: 'clipboard_check_interval'
            theme: 'light' // Clé DB: 'theme'
        };
    }

    /**
     * Convertit la liste [ {key: 'k', value: 'v'} ] en objet { k: 'v' }.
     * @param {Array<Object>} settingsArray - Liste des paires clé/valeur de la DB.
     * @returns {Object} Un objet de configuration.
     */
    _convertArrayToObject(settingsArray) {
        return settingsArray.reduce((acc, current) => {
            // Renomme 'clipboard_check_interval' en 'watcherInterval' pour le Renderer
            const keyName = current.key === 'clipboard_check_interval' ? 'watcherInterval' : current.key;
            acc[keyName] = current.value;
            return acc;
        }, {});
    }

    /**
     * Récupère les paramètres actuels de la DB et les formatte pour le Renderer.
     * Il garantit que toutes les clés attendues par l'UI sont présentes.
     */
    async getSettings() {
        try {
            // 1. Récupère tous les paramètres de la DB
            const dbSettingsArray = await this.model.getAll(); 
            
            // 2. Convertit en objet simple
            const dbSettingsObject = this._convertArrayToObject(dbSettingsArray);
            
            // 3. Fusionne avec les valeurs par défaut
            const finalSettings = { 
                ...this.defaultSettings, 
                ...dbSettingsObject 
            };
            
            // Assure que l'intervalle est un type Number pour l'interface utilisateur
            if (finalSettings.watcherInterval) {
                 finalSettings.watcherInterval = parseInt(finalSettings.watcherInterval, 10);
            }

            return finalSettings;

        } catch (error) {
            console.error("[SettingsManager] Erreur lors de la récupération des paramètres:", error);
            return this.defaultSettings;
        }
    }

    /**
     * Sauvegarde les nouveaux paramètres dans la DB en utilisant la méthode set(key, value) du modèle.
     * @param {object} newSettings - L'objet de configuration du Renderer.
     */
    async saveSettings(newSettings) {
        try {
            const updates = [];
            
            // 1. Sauvegarde l'intervalle du Watcher
            if (newSettings.watcherInterval !== undefined) {
                updates.push(this.model.set('clipboard_check_interval', String(newSettings.watcherInterval)));
            }
            
            // 2. Sauvegarde le thème
            if (newSettings.theme !== undefined) {
                updates.push(this.model.set('theme', newSettings.theme));
            }
            
            await Promise.all(updates);
            
            return { success: true };
            
        } catch (error) {
            console.error("[SettingsManager] Erreur lors de la sauvegarde des paramètres:", error);
            return { success: false, message: error.message };
        }
    }
}

module.exports = new SettingsManager();
