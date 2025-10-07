// src/main/emitter.js (ou le chemin où vous organisez vos modules)

const EventEmitter = require('events');

// Créer une instance unique (Singleton) de l'EventEmitter pour toute l'application
const appEvents = new EventEmitter();

/**
 * Initialise les écouteurs d'événements et les lie à l'envoi IPC vers le Renderer.
 * Cette fonction est appelée une seule fois après la création de la fenêtre principale.
 * * @param {BrowserWindow} mainWindow - La référence à la fenêtre principale d'Electron.
 */
function initializeAppEmitters(mainWindow) {
    if (!mainWindow) {
        console.error("ERREUR: La fenêtre principale (mainWindow) n'est pas définie lors de l'initialisation de l'émetteur.");
        return;
    }

    appEvents.on('clip:added', (newClip) => {
        if (mainWindow.webContents) {
            // Utiliser IPC pour envoyer le clip au processus de rendu.
            // Le canal 'clip-added' est écouté dans le 'preload.js'.
            mainWindow.webContents.send('clip-added', newClip);
            //console.log(`[Emitter] Clip ajouté (ID: ${newClip.id}) -> Envoyé au Renderer.`);
        }
    });

    appEvents.on('settings:updated', (settings) => {
        if (mainWindow.webContents) {
            mainWindow.webContents.send('settings-updated', settings);
            //onsole.log('[Emitter] Paramètres mis à jour -> Envoyé au Renderer.');
        }
    });
    

    console.log('\n✅[Emitter] Les événements de l\'application sont maintenant liés à IPC.');
}


// Exporter l'instance de l'EventEmitter pour que d'autres modules puissent l'utiliser.
module.exports = {
    appEvents,
    initializeAppEmitters
};