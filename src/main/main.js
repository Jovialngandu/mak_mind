const { app } = require('electron')
const { Setting } = require("./services/db");
const {ClipboardService}=require("./services/clipboard")
const { registerIpcHandlers } = require("./ipc/handler"); 
const {createWindow}=require('./windows')

app.whenReady().then( async () => {


    const intervalMs = parseInt(await Setting.get("clipboard_check_interval")) || 1000;

    //console.log("Intervalle de vérification du presse-papier :", intervalMs, "ms");
    const window=await createWindow()

    setInterval(() => {
      ClipboardService.checkClipboard(); 
      
    }, intervalMs);

    registerIpcHandlers(window);
       
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

