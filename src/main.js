'use strict';

const electronPath = require('electron-prebuilt');
const childProcess = require('child_process');
const path = require('path');
const readline = require('readline');
const ipc = require('./ipc');

// Runner contains the main electron thread
const runner = path.join(__dirname, 'runner.js');

// Excite the electron
const proc = childProcess.spawn(electronPath, [runner],  {
  stdio: [null, null, null, 'ipc']
});

// Propagate log from child to main 
proc.stdout.on('data', function(data) {
   console.log(data.toString()); 
});

// REPL
var child = ipc(proc);
var rl = readline.createInterface({
  input: process.stdin,
});

rl.on('line', function (line) {
  handleInput(line);
});

function handleInput(line) {
  child.emit('readline', line.split('|'));
}
