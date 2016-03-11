import { ipcRenderer } from 'electron';
import { createStore } from 'redux';
import { assemblePatch } from './assemblePatch'

const ctx = new AudioContext();

/*
  State reducer, aka the patchbay:
    {
      connections: {
        [from]: to,
        ...
      },
      nodes: {
        [node]: {
          [type]: value, // type being parameter type, e.g frequency
          ...
        },
        ...
      }
    }
 */

function patch(state = { connections: {}, nodes: {} }, action = {}) {
  switch (action.type) {
  case 'ADD_CONNECTION':
    return Object.assign({}, state, {
      connections: Object.assign({}, state.connections, {
        [action.connection.from]: action.connection.to
      })
    });
  case 'SET_AUDIO_PARAM': // TODO split into subreducers
    return Object.assign({}, state, {
      nodes: Object.assign({}, state.nodes, {
        [action.modification.node]: Object.assign({}, state.nodes[action.modification.node] ? state.nodes[action.modification.node] : {}, {
          [action.modification.type]: action.modification.value
        })
      })
    });
  default:
    return state;
  }
}

let store = createStore(patch);

store.subscribe(() => {
  ipcRenderer.send('modular', store.getState());
  //assemblePatch(store.getState(), ctx);
});

ipcRenderer.on('readline', function (event, line) {
  let command = line.split('|');
  let actions = [];

  if (command.length > 1) {
    command.forEach((part, i) => {  
      if (i > 0) {
        actions.push({
          type: 'ADD_CONNECTION',
          connection: {
            from: command[i - 1],
            to: command[i]
          }
        });
      }
    });
  } else {
    command = line.split('>');
    command = command.slice(0, 1).concat(command.slice(1, command.length)[0].split('.'));
    action = {
      type: 'SET_AUDIO_PARAM',
      modification: {
        value: command[0],
        node: command[1],
        type: command[2],
      }
    }
  }
  actions.forEach((action) => {
    store.dispatch(action);
  });
});
