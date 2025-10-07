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
  copyText: (text) => ipcRenderer.invoke('write-to-clipboard', text) // Pour le bouton "Copier à nouveau"
})