const { app, BrowserWindow } = require('electron')
const { Setting } = require("./services/db");
const {ClipboardService}=require("./services/clipboard")
const { registerIpcHandlers } = require("./ipc/handler"); 
const {createWindow}=require('./windows')

global.isHeadlessMode = false

function checkHeadlessMode() {
  global.isHeadlessMode = process.argv.some(arg => 
    arg === 'headless' || 
    arg === 'h' ||
    arg === 'no-ui'
  )
  return global.isHeadlessMode
}

app.whenReady().then( async () => {
  const isHeadless = checkHeadlessMode()
  
  const intervalMs = parseInt(await Setting.get("clipboard_check_interval")) || 1000

  setInterval(() => {
    ClipboardService.checkClipboard() 
  }, intervalMs)

  if (!isHeadless) {
    const window = await createWindow()
    registerIpcHandlers(window)
  } else {
    console.log('Mode headless - Application ninja')
  }
       
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0 && !global.isHeadlessMode) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && !global.isHeadlessMode) {
    app.quit()
  }
})