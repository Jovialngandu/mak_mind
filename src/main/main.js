const { app, BrowserWindow ,ipcMain,clipboard } = require('electron')
const path = require('node:path')
const { Setting } = require("./services/db");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

   win.loadFile(path.join(__dirname, '../renderer/index.html'))
}

app.whenReady().then(() => {
  
    ipcMain.handle('ping', () => 'pong')   
    const theme = Setting.get("theme");
    console.log("Thème actuel :", theme); 
    const interval =Setting.get("clipboard_check_interval");
    console.log("Intervalle copie :", interval, "ms");
    Setting.set("language", "fr");
 
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

