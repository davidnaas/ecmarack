import { ipcRenderer } from 'electron';
import { createStore } from 'redux';

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
  case 'SET_AUDIO_PARAM':
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
  // assemblePatch(store.getState());
  ipcRenderer.send('modular', store.getState());
});

ipcRenderer.on('readline', function (event, line) {
  let command = line.split('|');
  let action;

  if (command.length > 1) {
    action = {
      type: 'ADD_CONNECTION',
      connection: {
        from: command[0],
        to: command[1]
      }
    }
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

  store.dispatch(action);
});
