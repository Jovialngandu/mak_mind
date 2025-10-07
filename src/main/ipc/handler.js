// src/main/ipc/clipboards.js
const { ipcMain } = require('electron');
const {ClipboardService} = require('../services/clipboard'); 
const SettingsManager = require('../services/setting/SettingsManager'); 
const ClipboardManager=ClipboardService;

function registerIpcHandlers(mainWindow=null) {

    // Canal pour récupérer les clips récents
    ipcMain.handle('get-recent-clips', async (event, limit) => {
        try {
            return await ClipboardManager.getRecent(limit);
        } catch (error) {
            console.error('Erreur lors de la récupération des clips:', error);
            return [];
        }
    });

    // Canal pour rechercher des clips
    ipcMain.handle('search-clips', async (event, query) => {
        try {
            return await ClipboardManager.search(query);
        } catch (error) {
            console.error('Erreur lors de la recherche des clips:', error);
            return [];
        }
    });
    
    // Ajout d'une gestion pour la copie
    ipcMain.handle('write-to-clipboard', (event, text) => {
        try {
            ClipboardManager.writeText(text);
            return { success: true };
        } catch (error) {
            console.error('Erreur lors de l\'écriture dans le presse-papier:', error);
            return { success: false, error: error.message };
        }
    });


    ipcMain.handle('delete-clip', async (event, clipId) => {
        try {
            const result = await ClipboardManager.remove(clipId);
            
            if (result && result.changes > 0) {
                 return { success: true, changes: result.changes };
            } else {
                 return { success: false, message: "Clip non trouvé ou suppression échouée." };
            }
        } catch (error) {
            console.error(`Erreur lors de la suppression du clip ID ${clipId}:`, error);
            return { success: false, error: error.message };
        }
    });

    // Canal pour récupérer tous les paramètres
    ipcMain.handle('get-settings', async () => {
        try {
            return await SettingsManager.getSettings();
        } catch (error) {
            console.error('Erreur lors de la récupération des paramètres:', error);
            return SettingsManager.defaultSettings;
        }
    });

    // Canal pour sauvegarder les paramètres
    ipcMain.handle('save-settings', async (event, settings) => {
        try {
            return await SettingsManager.saveSettings(settings);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des paramètres:', error);
            return { success: false, message: error.message };
        }
    });
}



module.exports = { registerIpcHandlers };