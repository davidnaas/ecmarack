import { app } from 'electron';
import { BrowserWindow } from 'electron';
import { ipcMain } from 'electron';
const parent = require('./ipc')(process);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600});
  // mainWindow = new BrowserWindow({width: 0, height: 0});
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.webContents.openDevTools();

  // app.dock.hide();
}

app.on('ready', createWindow);

// Input from repl in main process
parent.on('readline', function (splitInput) {
  mainWindow.webContents.send('readline', splitInput);
});

ipcMain.on('modular', function(event, msg) {
  parent.emit('response', msg);
})
