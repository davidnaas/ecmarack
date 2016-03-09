import electronPath from 'electron-prebuilt';
import childProcess from 'child_process';
import path from 'path';
import readline from 'readline';
import ipc from './ipc';

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
  child.emit('readline', line);
}

// Response from the synth
child.on('response', function(msg) {
  console.log(msg);
});
