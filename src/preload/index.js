const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping')
  // nous pouvons aussi exposer des variables en plus des fonctions
})


contextBridge.exposeInMainWorld('clipboardAPI', {

  getRecentClips: (limit) => ipcRenderer.invoke('get-recent-clips', limit),

  searchClips: (query) => ipcRenderer.invoke('search-clips', query),

  copyText: (text) => ipcRenderer.invoke('write-to-clipboard', text), // Pour le bouton "Copier à nouveau"

  onClipAdded: (callback) => {
        // Empêche les écouteurs multiples lors du rechargement à chaud
        ipcRenderer.removeAllListeners('clip-added'); 
        
        // Écoute le canal 'clip-added' envoyé par le Main Process (via emitter.js)
        ipcRenderer.on('clip-added', (event, newClip) => {
            // newClip est l'objet complet du clip
            callback(newClip);
        });
  },

  deleteClip: (clipId) => ipcRenderer.invoke('delete-clip', clipId),

  onClipDeleted: (callback) => {
        ipcRenderer.removeAllListeners('clip-deleted'); 
        ipcRenderer.on('clip-deleted', (event, clipId) => callback(clipId));
  },

  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
})