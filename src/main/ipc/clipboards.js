// src/main/ipc/clipboards.js
const { ipcMain } = require('electron');
const {ClipboardService} = require('../services/clipboard'); 

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
}



module.exports = { registerIpcHandlers };