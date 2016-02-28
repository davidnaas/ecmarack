'use strict'
const app = require('electron').app;
const BrowserWindow = require('electron').BrowserWindow;
const ipcMain = require('electron').ipcMain
const parent = require('./ipc')(process);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.webContents.openDevTools();

  app.dock.hide();
}

app.on('ready', createWindow);

// Input from repl in main process
parent.on('readline', function (splitInput) {
  mainWindow.webContents.send('readline', splitInput);
});
