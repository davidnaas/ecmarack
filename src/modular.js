'use strict'
const ipcRenderer = require('electron').ipcRenderer;
const ctx = new AudioContext();

const vco = ctx.createOscillator();
vco.type = 'sine';
vco.frequency.value = 400;
vco.start();

const vca = ctx.createGain();
vca.gain.value = 0;

vco.connect(vca);
vca.connect(ctx.destination);

ipcRenderer.on('readline', function (event, msg) {
  
});
