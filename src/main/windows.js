//gestion des fenetres
const { BrowserWindow } = require('electron');
const path = require('node:path');
const { initializeAppEmitters } = require('./ipc/emitter');

async function createWindow(){
 
  const win = new BrowserWindow({
    width: 1000,
    height: 500,
    webPreferences: {
    preload: path.join(__dirname, '../preload/index.js')
      
    }
  })

  win.loadFile(path.join(__dirname, '../renderer/index.html'))

  initializeAppEmitters(win)
  
  return win
}

function close(win){
    win.close()
}

function maximize(win){
    (win.fullScreen)?win.setSize(1000,1000):win.maximize()
}

module.exports = {createWindow}


